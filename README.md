# 🕵️‍♀️Deep-Trace: Advanced Deepfake Detection System

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg?logo=python&logoColor=white" alt="Python Badge">
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C.svg?logo=pytorch&logoColor=white" alt="PyTorch Badge">
  <img src="https://img.shields.io/badge/CUDA-Enabled-76B900.svg?logo=nvidia&logoColor=white" alt="CUDA Badge">
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8.svg?logo=opencv&logoColor=white" alt="OpenCV Badge">
  <img src="https://img.shields.io/badge/FFmpeg-5CB85C.svg?logo=ffmpeg&logoColor=white" alt="FFmpeg Badge">
  <img src="https://img.shields.io/badge/FastAPI-009688.svg?logo=fastapi&logoColor=white" alt="FastAPI Badge">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</div>

---

## 📖 Description

**Deep-Trace** is a high-performance, machine learning-based system designed to detect deepfake videos with precision. It features a robust, end-to-end pipeline that extracts frames from videos, automatically cleans the dataset by removing corrupted media, and analyzes the frames using a state-of-the-art CNN model trained in PyTorch. 

Built with scalability and fault-tolerance in mind, Deep-Trace seamlessly handles truncated images, leverages hardware acceleration (CUDA/AMP) for lightning-fast training, and provides a sleek Single Page Application (SPA) frontend for real-time inference.

## ✨ Features

- **🛡️ Robust Deepfake Detection:** State-of-the-art PyTorch CNN architecture for accurate classification of real vs. manipulated media.
- **⚡ Hardware Acceleration:** Full GPU support (`torch.cuda`) with Automatic Mixed Precision (AMP), `cudnn.benchmark`, and `channels_last` memory layout for a 2–5x training speedup.
- **🧹 Automated Dataset Cleaning:** Intelligent pre-extraction validation using FFmpeg/ffprobe to skip corrupted videos, alongside safe PIL configurations (`ImageFile.LOAD_TRUNCATED_IMAGES = True`) to handle truncated image files gracefully.
- **🚀 High-Performance Data Loading:** Optimized PyTorch `DataLoader` with `pin_memory=True` and `persistent_workers=True` to eliminate I/O bottlenecks.
- **🌐 Full-Stack Application:** FastAPI backend wrapper for seamless model inference, paired with a modern, modular JavaScript Single Page Application (SPA) for the frontend.
- **☁️ Google Colab Ready:** Standardized setup scripts to easily mount Google Drive and train the model in the cloud without code modifications.

## ⚙️ Tech Stack

- **Core & Deep Learning:** Python, PyTorch, Torchvision
- **Media Processing:** OpenCV, FFmpeg, PIL (Pillow)
- **Backend API:** FastAPI, Uvicorn
- **Frontend Interface:** HTML5, Vanilla CSS, Vanilla JavaScript (SPA Architecture)

## 🔄 Project Workflow

1. **Video Ingestion:** Videos are uploaded via the web interface or API.
2. **Pre-Extraction Validation:** FFmpeg/ffprobe verifies video integrity before processing.
3. **Frame Extraction:** Valid videos are split into high-quality image frames using optimized FFmpeg commands.
4. **Dataset Cleaning:** The automated validation utility scans for and removes corrupted/truncated images.
5. **Model Training / Inference:** 
   - *Training:* Data is passed through a highly optimized PyTorch DataLoader to train the CNN model using AMP.
   - *Inference:* The FastAPI backend processes the frames and returns a "Real" or "Fake" prediction.

## 🛠️ Installation

Follow these steps to set up Deep-Trace on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/DivyanshiSingh07/Deep-Trace.git
cd Deep-Trace
```

### 2. Install Dependencies
Make sure you have Python 3.8+ installed. It is recommended to use a virtual environment.
```bash
pip install -r requirements.txt
```

*Note: For GPU support, ensure you have the correct CUDA toolkit installed for your PyTorch version.*

### 3. Setup Dataset Path
Place your training and testing videos in the `data/` directory.

## 💻 Usage Instructions

### Running the Backend Server
Start the FastAPI server to expose the model as a black-box service:
```bash
cd backend
uvicorn app:main --reload
```
*The API will be available at `http://localhost:8000`.*

### Running the Frontend SPA
Serve the modernized frontend interface:
```bash
cd frontend
python -m http.server 3000
```
*Access the dashboard via `http://localhost:3000` in your web browser.*

### Example API Request
You can test the detection pipeline directly via cURL:
```bash
curl -X POST "http://localhost:8000/detect" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/test_video.mp4"
```

## ☁️ Google Colab Support

Deep-Trace is fully compatible with Google Colab for free GPU training.

1. Upload the `Deep-Trace` folder to your Google Drive.
2. Open the provided `Colab_Training.ipynb` notebook.
3. Run the setup cell to mount your drive and configure paths automatically:
```python
from google.colab import drive
drive.mount('/content/drive')
%cd /content/drive/MyDrive/Deep-Trace
```
4. Execute the pipeline as-is. The code automatically detects the Colab environment and utilizes the available T4/A100 GPU (`torch.cuda.is_available()`).

## 📁 Folder Structure

```text
Deep-Trace/
│
├── backend/                  # FastAPI backend wrapper & inference logic
├── frontend/                 # Modern SPA frontend (HTML/CSS/JS)
├── models/                   # PyTorch CNN definitions & saved .pth weights
├── core/                     # Data pipeline, frame extraction, & training loops
├── data/                     # Video dataset and extracted frames
├── utils/                    # Dataset validation and cleaning scripts
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

## 🖨️ Output Explanation

During training or API inference, Deep-Trace provides clear, structured logging. 

**Sample Training Log:**
```text
[INFO] Device detected: cuda:0 (NVIDIA GeForce RTX 3050)
[INFO] cudnn.benchmark enabled for optimal performance.
[INFO] Starting pre-extraction integrity check...
[INFO] Found 2 corrupted videos. Skipping...
[INFO] Epoch 1/20 | Train Loss: 0.4512 | Val Acc: 88.5% | Time: 45s
[INFO] Epoch 2/20 | Train Loss: 0.3105 | Val Acc: 92.1% | Time: 43s
...
[SUCCESS] Model weights saved to models/deep_trace_v1.pth
```

**Sample API Response:**
```json
{
  "filename": "test_video.mp4",
  "status": "success",
  "prediction": "Deepfake",
  "confidence": 98.4,
  "frames_analyzed": 45
}
```

## 🔧 Troubleshooting

- **GPU Not Detected:** Ensure NVIDIA drivers and CUDA toolkit match your PyTorch installation. Run `python -c "import torch; print(torch.cuda.is_available())"` to verify.
- **Corrupted Image Errors (PIL):** Deep-Trace automatically configures `ImageFile.LOAD_TRUNCATED_IMAGES = True`. If you still face crashes during data loading, run the standalone validation script in `utils/` to purge unreadable files.
- **FFmpeg Not Found:** Ensure FFmpeg is installed on your system and added to your system's PATH variable.
- **Out of Memory (OOM):** Reduce the `batch_size` in the training configuration or ensure `pin_memory=False` if system RAM is limited.

## 🔮 Future Improvements

- Add support for Vision Transformers (ViT) to capture complex spatial and temporal artifacts.
- Implement real-time webcam streaming detection directly in the frontend SPA.
- Containerize the application using Docker for one-click deployments.

## 🤝 Author / Credits

Developed by **TEAM - TRUTH BYTES**. 
MEMBERS:
Tushar Kumar Singh
Anushreya Tomar
Khushi Sharma
Divyanshi Singh

Contributions, issues, and feature requests are highly welcome! Feel free to check the [issues page](https://github.com/DivyanshiSingh07/Deep-Trace/issues) if you want to contribute.
