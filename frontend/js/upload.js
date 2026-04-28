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

    // Highlight dropzone on drag
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        handleFiles(e.dataTransfer.files);
    }, false);

    // Handle browse click
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file input change
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    // Remove file — reset to empty state
    removeBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        emptyState.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        errorBox.classList.add('hidden');
    });

    // Handle Analyze button click
    analyzeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentFile) return;

        // Set loading state
        analyzeBtn.disabled = true;
        analyzeBtnText.textContent = 'Analyzing...';
        analyzeBtnIcon.textContent = 'autorenew';
        analyzeBtnIcon.classList.add('animate-spin');
        scanline.classList.remove('hidden');
        errorBox.classList.add('hidden');

        try {
            const data = await predict(currentFile);

            // Store results in shared state
            appState.file = currentFile;
            appState.filename = currentFile.name;
            appState.result = data;
            // Ensure the result view is definitely not hidden by CSS
            document.getElementById('view-result').classList.remove('hidden');
            // Navigate — navigate() handles all view visibility
            navigate('view-result');

        } catch (error) {
            console.error('Analysis failed:', error);
            errorBox.textContent = error.message || 'An error occurred during analysis.';
            errorBox.classList.remove('hidden');
        } finally {
            // Reset loading state
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

        // Validate file type
        const validTypes = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            errorBox.textContent = 'Invalid file type. Please upload MP4, MOV, JPG, or PNG.';
            errorBox.classList.remove('hidden');
            return;
        }

        // Validate file size (100MB max)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            errorBox.textContent = 'File too large. Maximum size is 100MB.';
            errorBox.classList.remove('hidden');
            return;
        }

        currentFile = file;

        // Show preview
        emptyState.classList.add('hidden');
        previewContainer.classList.remove('hidden');

        filenameDisplay.textContent = file.name;
        filesizeDisplay.textContent = `${(file.size / (1024 * 1024)).toFixed(1)} MB • ${file.type.split('/')[0].toUpperCase()}`;
    }
}