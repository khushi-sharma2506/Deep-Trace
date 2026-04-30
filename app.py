# E:\Khushi\env_ai\Scripts\python.exe app.py
import os, uuid, cv2
from pathlib import Path
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# CONFIG
WEIGHT_FILE = 'deepfake_detector_v2.pth'
THRESHOLD = 0.5  # Standard threshold for balanced detection
FRAMES_TO_SAMPLE = 12

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'[INFO] Device: {device}')

# Architecture MUST match notebook exactly
def get_model():
    m = models.efficientnet_b0(weights=None)
    m.classifier = nn.Sequential(
        nn.Dropout(p=0.5, inplace=True),
        nn.Linear(m.classifier[1].in_features, 1)
    )
    return m

model = get_model().to(device)
print('[INFO] Architecture: EfficientNet-B0 (Forensic Edition)')

BASE_DIR = Path(__file__).resolve().parent
weight_path = BASE_DIR / WEIGHT_FILE

weights_loaded = False
if weight_path.exists():
    try:
        # Load weights directly without the wrapper prefix
        state_dict = torch.load(weight_path, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
        model.eval()
        weights_loaded = True
        print(f'[INFO] Weights loaded successfully: {weight_path}')
    except Exception as e:
        print(f'[WARN] Weight load failed: {e}')
else:
    print(f'[WARN] Weight file not found: {weight_path}')

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_image(pil_img: Image.Image) -> float:
    tensor = val_transform(pil_img).unsqueeze(0).to(device)
    with torch.no_grad():
        # sigmoid(output) because BCEWithLogitsLoss was used
        return torch.sigmoid(model(tensor)).item()

def extract_frames(video_path: str, n: int = 12) -> list:
    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    def to_pil(frame):
        return Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if total <= 1:
        ret, frame = cap.read(); cap.release()
        return [to_pil(frame)] if ret else []
    indices = [int((total - 1) * i / (n + 1)) for i in range(1, n + 1)]
    frames = []
    for idx in sorted(list(set(indices))):
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret and frame is not None:
            frames.append(to_pil(frame))
    cap.release()
    return frames

app = FastAPI(title='DeepTrace API')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

import tempfile
TEMP_DIR = Path(tempfile.gettempdir()) / 'deeptrace_uploads'
TEMP_DIR.mkdir(exist_ok=True)

IMAGE_EXTS = {'jpg', 'jpeg', 'png', 'webp'}
VIDEO_EXTS = {'mp4', 'avi', 'mov', 'mkv'}

@app.get('/health')
def health():
    return {
        'status': 'ok',
        'device': str(device),
        'gpu_active': torch.cuda.is_available(),
        'weights_loaded': weights_loaded,
        'model_type': 'efficientnet_b0_v2',
        'threshold': THRESHOLD
    }

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, 'No file uploaded.')
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in IMAGE_EXTS | VIDEO_EXTS:
        raise HTTPException(400, f"Unsupported format '{ext}'.")
    tmp = TEMP_DIR / f'{uuid.uuid4()}_{file.filename}'
    try:
        tmp.write_bytes(await file.read())
        if ext in VIDEO_EXTS:
            frames = extract_frames(str(tmp), FRAMES_TO_SAMPLE)
            if not frames: raise HTTPException(400, 'Could not read frames.')
            probs = [predict_image(f) for f in frames]
            probability = sum(probs) / len(probs)
            frames_n = len(probs)
        else:
            probability = predict_image(Image.open(tmp).convert('RGB'))
            frames_n = 1
        
        prediction = 'REAL' if probability > THRESHOLD else 'FAKE'
        confidence = probability if prediction == 'REAL' else 1.0 - probability
        
        return JSONResponse({
            'prediction': prediction,
            'confidence': round(confidence * 100, 2),
            'frames_analyzed': frames_n,
            'raw_probability': round(probability, 4),
            'status': 'success'
        })
    except Exception as e:
        print(f'[ERROR] {e}')
        raise HTTPException(500, str(e))
    finally:
        if tmp.exists(): tmp.unlink()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000, reload=False)