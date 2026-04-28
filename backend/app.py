import numpy
import os
import json
import uuid
import cv2
from pathlib import Path
import torch
import torch.nn as nn
from torchvision import transforms, models  # Added models for ResNet support
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
            # We look for the class definition as a marker
            if "class DeepFakeCNN(nn.Module):" in source:
                lines = source.split('\n')
                class_lines = []
                for line in lines:
                    # Stop before it starts training or printing
                    if line.startswith("model =") or line.startswith("print("):
                        break
                    class_lines.append(line)
                model_code = "\n".join(class_lines)
                break
                
    if not model_code:
        # If you switched to ResNet, we define a wrapper so the app doesn't crash
        print("⚠️ Note: DeepFakeCNN class not found. Initializing ResNet18 structure...")
        return "RESNET"
        
    exec(model_code, globals())
    return "CUSTOM"

# Define paths
BASE_DIR = Path(__file__).resolve().parent
NOTEBOOK_PATH = os.path.join(BASE_DIR, "deepfake_pytorch_gpu_e2e.ipynb")

# Attempt to load original model code
model_type = load_model_from_notebook(NOTEBOOK_PATH)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# INITIALIZE MODEL
if model_type == "CUSTOM":
    model = DeepFakeCNN().to(device)
else:
    # This ensures your 100% accuracy ResNet model works even if the class extraction fails
    model = models.resnet18()
    model.fc = nn.Linear(model.fc.in_features, 1)
    model = model.to(device)

# Load Weights - UPDATED PATHS TO MATCH YOUR D: DRIVE
weight_paths_to_try = [
    os.path.join(BASE_DIR, "deepfake_detector_v1.pth"), # Local folder check
    r"D:\Khushi\Documents\Deep-trace\Deep-Trace\backend\deepfake_detector_v1.pth", # Your actual save path
    os.path.join(BASE_DIR, "deepfake_pytorch_model.pth") # Original fallback
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
    print("⚠️ WARNING: Pre-trained weights not found! Check your D: drive path.")

# Exact transform logic extracted from notebook
val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]) # Standard for ResNet
])

# ---------------------------------------------------------
# 2. FASTAPI SERVER DEFINITION
# ---------------------------------------------------------
app = FastAPI(title="DeepTrace API", description="DeepFake Validation API Wrapper", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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
        
    temp_path = os.path.join("temp_uploads", f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())
            
        ext = temp_path.lower().split('.')[-1]
        image_pil = None
        
        if ext in ['mp4', 'avi', 'mov', 'mkv']:
            cap = cv2.VideoCapture(temp_path)
            ret, frame = cap.read()
            cap.release()
            if not ret:
                raise HTTPException(status_code=400, detail="Could not read video file.")
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image_pil = Image.fromarray(frame)
        elif ext in ['jpg', 'jpeg', 'png']:
            image_pil = Image.open(temp_path).convert('RGB')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
            
        tensor_img = val_transform(image_pil).unsqueeze(0).to(device)
        
        with torch.no_grad():
            output = model(tensor_img)
            probability = torch.sigmoid(output).item()
                
        # Prediction Logic
        prediction = "FAKE" if probability > 0.5 else "REAL"
        confidence = probability if prediction == "FAKE" else 1.0 - probability
        
        return JSONResponse(content={
            "prediction": prediction,
            "confidence": f"{confidence * 100:.2f}%"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)