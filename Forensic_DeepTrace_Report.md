# 🛡️ Forensic DeepTrace — Technical Project Report

## 1. Project Overview
**DeepTrace** is a professional-grade forensic deepfake detection portal designed to identify synthetic media with high reliability. The system focuses on **Zero-Bias** training and **Real-World Calibration** to provide investigators with a trustworthy analysis tool.

## 2. Technical Architecture
The system uses a **Full-Stack AI** approach:
*   **Frontend**: Vanilla HTML5/CSS3 with a premium "Glassmorphism" design.
*   **Backend**: FastAPI (Python) for high-performance asynchronous API handling.
*   **AI Engine**: PyTorch-based **EfficientNet-B0** (Forensic Edition).
*   **Hardware**: Optimized for NVIDIA RTX GPUs (CUDA accelerated).

## 3. Dataset & Bias Mitigation
One of the core innovations of DeepTrace is its **Unbiased Training Strategy**:
*   **Source**: Celeb-DF (v2) high-quality deepfake dataset.
*   **Zero-Bias Split**: We implemented a strict **Video-Level Split**. This means a person seen in the training set is *never* seen in the validation set. This prevents the model from "cheating" by memorizing faces.
*   **Balanced Sampling**: Exactly 1:1 ratio between Real and Fake frames (3,200 training samples total).

## 4. Forensic Performance
The model is tuned to the **Forensic Gold Standard**:
*   **Target Accuracy**: 95.0% - 96.5%.
*   **Why not 100%?**: In real-world forensics, a 100% accuracy usually indicates overfitting (memorization). Our model uses **Label Smoothing (0.1)** and **Gaussian Blur** to ensure it works on real, compressed social media videos, not just perfect lab samples.
*   **Confidence Threshold**: We use a strict **0.8 Forensic Threshold**. A media file is only classified as "Real" if the AI is extremely certain, prioritizing the detection of potential fakes.

## 5. System Workflow
1.  **Upload**: User uploads a video or image via the web portal.
2.  **Extraction**: The backend extracts **12 key frames** from the video for analysis.
3.  **Inference**: Each frame is processed by the EfficientNet-B0 model.
4.  **Calibration**: Results are averaged and calibrated against the Forensic Noise Factor.
5.  **Report**: The user receives a detailed confidence score and forensic verdict.

## 6. How to Run
1.  Start the API: `python app.py`
2.  Launch the UI: Open `index.html`
3.  View Training: Check `deepfake_pytorch_gpu_e2e.ipynb`

---
*Created for Forensic Project Presentation — April 2026*
