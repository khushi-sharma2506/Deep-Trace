import { predict } from './api.js';

export function initUpload(appState, navigate) {
    const dropzone = document.getElementById('uploadDropzone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const emptyState = document.getElementById('emptyState');
    const errorBox = document.getElementById('uploadError');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const browseBtn = document.getElementById('browseBtn');
    const filenameDisplay = document.getElementById('filenameDisplay');
    const filesizeDisplay = document.getElementById('filesizeDisplay');
    const removeBtn = document.getElementById('removeBtn');
    const scanline = document.getElementById('scanline');
    const analyzeBtnText = document.getElementById('analyzeBtnText');
    const analyzeBtnIcon = document.getElementById('analyzeBtnIcon');

    let currentFile = null;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight dropzone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, false);

    // Handle browse click
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle input change
    fileInput.addEventListener('change', function(e) {
        handleFiles(this.files);
    });

    // Remove file
    removeBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        emptyState.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        errorBox.classList.add('hidden');
    });

    // Handle Analyze button
    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        // Set Loading State
        analyzeBtn.disabled = true;
        analyzeBtnText.textContent = 'Analyzing...';
        analyzeBtnIcon.textContent = 'autorenew';
        analyzeBtnIcon.classList.add('animate-spin');
        scanline.classList.remove('hidden');
        errorBox.classList.add('hidden');

        try {
            const data = await predict(currentFile);
            
            // Update global state
            appState.file = currentFile;
            appState.filename = currentFile.name;
            appState.result = data;

            // Reset upload UI for next time
            removeBtn.click();
            
            // Navigate to results
            navigate('view-result');
        } catch (error) {
            errorBox.textContent = error.message || 'An error occurred during analysis.';
            errorBox.classList.remove('hidden');
        } finally {
            // Remove Loading State
            analyzeBtn.disabled = false;
            analyzeBtnText.textContent = 'Analyze File';
            analyzeBtnIcon.textContent = 'arrow_forward';
            analyzeBtnIcon.classList.remove('animate-spin');
            scanline.classList.add('hidden');
        }
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        errorBox.classList.add('hidden');

        // Validate type
        const validTypes = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            errorBox.textContent = 'Invalid file type. Please upload MP4, MOV, JPG, or PNG.';
            errorBox.classList.remove('hidden');
            return;
        }

        // Validate size (100MB limit)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            errorBox.textContent = 'File too large. Maximum size is 100MB.';
            errorBox.classList.remove('hidden');
            return;
        }

        currentFile = file;
        
        // Show preview state
        emptyState.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        
        filenameDisplay.textContent = file.name;
        filesizeDisplay.textContent = `${(file.size / (1024 * 1024)).toFixed(1)} MB • ${file.type.split('/')[0].toUpperCase()}`;

        // Generate actual media preview
        const previewArea = previewContainer.querySelector('.relative');
        if (previewArea) {
            // Clear old preview content (keep scanline)
            const oldPreview = previewArea.querySelector('.preview-media');
            if (oldPreview) oldPreview.remove();
            const oldPlaceholder = previewArea.querySelector('div:first-child');
            if (oldPlaceholder) oldPlaceholder.style.display = 'none';

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    img.className = 'preview-media';
                    img.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:var(--radius-md);';
                    img.onerror = () => {
                        // Fallback if image is broken
                        img.remove();
                        if (oldPlaceholder) oldPlaceholder.style.display = '';
                    };
                    previewArea.insertBefore(img, previewArea.firstChild);
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.className = 'preview-media';
                video.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:var(--radius-md);';
                video.muted = true;
                video.playsInline = true;
                video.preload = 'metadata';
                video.onloadeddata = () => video.currentTime = 1; // Seek to 1s for thumbnail
                video.onerror = () => {
                    video.remove();
                    if (oldPlaceholder) oldPlaceholder.style.display = '';
                };
                previewArea.insertBefore(video, previewArea.firstChild);
            }
        }
    }
}
