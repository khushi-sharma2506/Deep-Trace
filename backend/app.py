import numpy
import os
import json
import uuid
import cv2
from pathlib import Path
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------
# 1. DYNAMICALLY LOAD THE UNCHANGED JUPYTER NOTEBOOK MODEL
# ---------------------------------------------------------
def load_model_from_notebook(notebook_path):
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        
    model_code = ""
    for cell in nb.get('cells', []):
        if cell['cell_type'] == 'code':
            source = "".join(cell.get('source', []))
            if "class DeepFakeCNN(nn.Module):" in source:
                # We extract ONLY the class definition, stopping before any initialization code that follows.
                lines = source.split('\n')
                class_lines = []
                for line in lines:
                    if line.startswith("model =") or line.startswith("print("):
                        break
                    class_lines.append(line)
                model_code = "\n".join(class_lines)
                break
                
    if not model_code:
        raise Exception("Could not find DeepFakeCNN class in the Jupyter Notebook.")
        
    # Execute the class definition into the global namespace
    exec(model_code, globals())

# Define paths
BASE_DIR = Path(__file__).resolve().parent
NOTEBOOK_PATH = os.path.join(BASE_DIR, "deepfake_pytorch_gpu_e2e.ipynb")

# Attempt to load original model code strictly without changing it
load_model_from_notebook(NOTEBOOK_PATH)

# Initialize device dynamically relying on notebook's requirement
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize the model using the dynamically loaded class
model = DeepFakeCNN().to(device)

# Load Weights
weight_paths_to_try = [
    r"G:\My Drive\deepfake_pytorch_model.pth",  # Original path from notebook
    os.path.join(BASE_DIR, "deepfake_pytorch_model.pth"), # Fallback localized path
    os.path.join(BASE_DIR, "..", "deepfake_pytorch_model.pth")
]

weights_loaded = False
for w_path in weight_paths_to_try:
    if os.path.exists(w_path):
        try:
            model.load_state_dict(torch.load(w_path, map_location=device))
            model.eval()
            weights_loaded = True
            print(f"✅ Loaded model weights from: {w_path}")
            break
        except Exception as e:
            print(f"⚠️ Failed to load {w_path}: {e}")

if not weights_loaded:
    print("⚠️ WARNING: Pre-trained weights not found! Model will generate random predictions.")

# Exact transform logic extracted from notebook
val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# ---------------------------------------------------------
# 2. FASTAPI SERVER DEFINITION
# ---------------------------------------------------------
app = FastAPI(title="DeepTrace API", description="DeepFake Validation API Wrapper", version="1.0.0")

# Enable CORS for the frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production specify actual domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp_uploads", exist_ok=True)

@app.get("/health")
def health_check():
    return {"status": "ok", "gpu_active": torch.cuda.is_available(), "weights_loaded": weights_loaded}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    # Temporary file storage
    temp_path = os.path.join("temp_uploads", f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())
            
        ext = temp_path.lower().split('.')[-1]
        
        # Determine how to extract frame based on file type
        image_pil = None
        if ext in ['mp4', 'avi', 'mov', 'mkv']:
            cap = cv2.VideoCapture(temp_path)
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                raise HTTPException(status_code=400, detail="Could not read video file.")
                
            # Convert CV2 BGR to RGB for PIL
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image_pil = Image.fromarray(frame)
        elif ext in ['jpg', 'jpeg', 'png']:
            image_pil = Image.open(temp_path).convert('RGB')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
            
        # Model Inference
        tensor_img = val_transform(image_pil).unsqueeze(0).to(device)
        
        with torch.no_grad():
            with torch.cuda.amp.autocast() if torch.cuda.is_available() else torch.autocast("cpu", enabled=False):
                output = model(tensor_img)
                # Apply Sigmoid since criterion was BCEWithLogitsLoss
                probability = torch.sigmoid(output).item()
                
        # Determine Prediction
        prediction = "FAKE" if probability > 0.5 else "REAL"
        confidence = probability if prediction == "FAKE" else 1.0 - probability
        
        return JSONResponse(content={
            "prediction": prediction,
            "confidence": float(confidence)
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
