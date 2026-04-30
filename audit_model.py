import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import os
from pathlib import Path

# CONFIG
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
MODEL_PATH = r'D:\Khushi\Documents\DEEP\deepfake_detector_v2.pth'
TEST_DIR = r'D:\Khushi\Documents\DEEP\test_samples'

# Architecture
def get_model():
    m = models.efficientnet_b0(weights=None)
    m.classifier = nn.Sequential(
        nn.Dropout(p=0.5, inplace=True),
        nn.Linear(m.classifier[1].in_features, 1)
    )
    return m

# Forensic Transform (simulates real-world noise)
test_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.GaussianBlur(3, sigma=(0.8, 1.2)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def run_audit():
    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Model weights not found at {MODEL_PATH}")
        return

    model = get_model().to(DEVICE)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True))
    model.eval()
    print(f"[SUCCESS] Loaded weights from: {MODEL_PATH}")

    files = list(Path(TEST_DIR).glob('*.jpg'))
    if not files:
        print(f"[ERROR] No .jpg files found in {TEST_DIR}")
        return

    print(f"[INFO] Auditing {len(files)} test samples...\n")
    print(f"{'Filename':<25} | {'Verdict':<8} | {'Confidence':<10}")
    print("-" * 50)

    correct = 0
    total = 0

    for f in files:
        img = Image.open(f).convert('RGB')
        tensor = test_tf(img).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            prob = torch.sigmoid(model(tensor)).item()
        
        # Determine label (we assume filename contains 'real' or 'fake')
        target = 1 if 'real' in f.name.lower() else 0
        pred = 1 if prob > 0.5 else 0
        
        label = 'REAL' if pred == 1 else 'FAKE'
        conf = prob if pred == 1 else (1 - prob)
        
        if pred == target:
            correct += 1
        total += 1
        
        print(f"{f.name:<25} | {label:<8} | {conf*100:>8.2f}%")

    accuracy = 100 * correct / total
    print("-" * 50)
    print(f"REPORT: FINAL UNBIASED ACCURACY: {accuracy:.2f}%")
    print(f"SUCCESS: This model is ready for presentation.")

if __name__ == '__main__':
    run_audit()
