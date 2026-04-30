# 🕵️‍♀️ Deep-Trace: Advanced Deepfake Detection System

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg?logo=python&logoColor=white" alt="Python Badge">
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C.svg?logo=pytorch&logoColor=white" alt="PyTorch Badge">
  <img src="https://img.shields.io/badge/CUDA-Enabled-76B900.svg?logo=nvidia&logoColor=white" alt="CUDA Badge">
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8.svg?logo=opencv&logoColor=white" alt="OpenCV Badge">
  <img src="https://img.shields.io/badge/FFmpeg-5CB85C.svg?logo=ffmpeg&logoColor=white" alt="FFmpeg Badge">
  <img src="https://img.shields.io/badge/FastAPI-009688.svg?logo=fastapi&logoColor=white" alt="FastAPI Badge">
</div>

---

## 📖 Description

**Deep-Trace** is a high-performance, machine learning-based system designed to detect deepfake videos and images with precision. It features a robust, end-to-end pipeline that extracts frames from videos and analyzes them using an EfficientNet-B0 CNN model trained in PyTorch. 

Built with scalability and fault-tolerance in mind, Deep-Trace seamlessly handles truncated images, leverages hardware acceleration (CUDA/AMP) for lightning-fast inference, and provides a sleek Single Page Application (SPA) frontend.

## ✨ Features

- **🛡️ Robust Deepfake Detection:** EfficientNet-B0 PyTorch CNN architecture for accurate classification of real vs. manipulated media.
- **⚡ Hardware Acceleration:** Full GPU support (`torch.cuda`) for fast inference and training.
- **🧹 Automated Dataset Cleaning:** Skip corrupted media and handle truncated image files gracefully during preprocessing.
- **🌐 Full-Stack Application:** FastAPI backend wrapper for seamless model inference, paired with a modern, responsive frontend (SPA).

## ⚙️ Tech Stack

- **Core & Deep Learning:** Python, PyTorch, Torchvision
- **Media Processing:** OpenCV, PIL (Pillow)
- **Backend API:** FastAPI, Uvicorn
- **Frontend Interface:** HTML5, Vanilla CSS, Vanilla JavaScript (SPA Architecture)

## 📁 Folder Structure

```text
Deep-Trace/
│
├── backend/                  # FastAPI backend wrapper & training notebooks
│   ├── app.py                # Optional subfolder FastAPI app
│   └── deepfake_pytorch_gpu_e2e.ipynb
│
├── frontend/                 # Modern SPA frontend (HTML/CSS/JS)
│
├── app.py                    # Main FastAPI backend script
├── index.html                # Main SPA frontend dashboard
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

---

## 💻 Setup & Usage Instructions

Follow these steps to set up and run Deep-Trace on your local machine.

### 1. Install Dependencies
Make sure you have Python 3.8+ installed. It is highly recommended to use a virtual environment:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required packages
pip install -r requirements.txt
```

### 2. Run the Backend Server
Start the main FastAPI server located in the root directory:

```bash
python app.py
```
*The API will be available at `http://localhost:8000`. You can verify it is running by visiting `http://localhost:8000/health`.*

### 3. Run the Frontend SPA
Simply open the main `index.html` file in your browser, or serve it using Python's built-in HTTP server:

```bash
python -m http.server 5500
```
*Access the dashboard via `http://localhost:5500` in your web browser.*

---

## 🤝 Author / Credits

Developed by **TEAM - TRUTH BYTES**

MEMBERS:
Tushar Kumar Singh
Anushreya Tomar
Khushi Sharma
Divyanshi Singh

Contributions, issues, and feature requests are highly welcome!
