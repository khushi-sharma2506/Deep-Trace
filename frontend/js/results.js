export function initResults(appState, navigate) {
    const btnAnother = document.getElementById('btnAnalyzeAnother');
    const btnExport = document.getElementById('btnExportReport');
    
    // Result elements okay
    const resCertainty = document.getElementById('resCertainty');
    const resChip = document.getElementById('resChip');
    const resTitle = document.getElementById('resTitle');
    const resDesc = document.getElementById('resDesc');
    const resFilename = document.getElementById('resFilename');
    const vectorSection = document.getElementById('vectorSection');
    const resCircle = document.getElementById('resCircle');

    btnAnother.addEventListener('click', () => {
        // State reset handled by app.js or upload.js
        navigate('view-upload');
    });

    btnExport.addEventListener('click', () => {
        // Simple toast implementation without external dependencies
        const existingToast = document.getElementById('toastMsg');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.textContent = 'Report export coming soon';
        toast.className = 'fixed bottom-6 right-6 bg-surface-container-high text-on-surface px-6 py-3 rounded-lg shadow-lg border border-outline-variant/20 z-50 transition-opacity font-label text-sm';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    });

    return function renderResults() {
        if (!appState.result) return;

        const { prediction, confidence } = appState.result;
        const filename = appState.filename || 'unknown_artifact.xyz';
        const isFake = prediction === 'FAKE';
        
        // Update DOM
        resCertainty.textContent = `${(confidence * 100).toFixed(1)}%`;
        resFilename.textContent = filename;
        
        if (isFake) {
            resChip.className = 'chip-fake-lg mb-6';
            resChip.textContent = 'FAKE';
            resTitle.textContent = 'Synthetic Manipulation Detected';
            resDesc.textContent = 'High-probability neural artifacts identified. Spectral analysis reveals non-organic consistency in the digital noise floor.';
            vectorSection.classList.remove('hidden');
            resCircle.classList.remove('real');
            resCircle.classList.add('fake');
        } else {
            resChip.className = 'chip-real-lg mb-6';
            resChip.textContent = 'REAL';
            resTitle.textContent = 'Authentic Artifact';
            resDesc.textContent = 'No synthetic manipulation detected. Temporal consistency and spectral metadata match expected organic patterns.';
            vectorSection.classList.add('hidden'); // Hide vectors for REAL to keep it clean
            resCircle.classList.remove('fake');
            resCircle.classList.add('real');
        }

        // Animate Circle
        // 2 * Math.PI * R (where R=88) = 552.92
        const circumference = 552.92;
        resCircle.style.strokeDasharray = circumference;
        // Start empty
        resCircle.style.strokeDashoffset = circumference;
        
        // Trigger reflow
        resCircle.getBoundingClientRect();
        
        // Animate to confidence level
        const offset = circumference - (confidence * circumference);
        setTimeout(() => {
            resCircle.style.strokeDashoffset = offset;
        }, 100);
    };
}
