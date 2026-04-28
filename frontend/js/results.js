export function initResults(appState, navigate) {
    const btnAnother = document.getElementById('btnAnalyzeAnother');
    const btnExport = document.getElementById('btnExportReport');

    // Result elements
    const resCertainty = document.getElementById('resCertainty');
    const resChip = document.getElementById('resChip');
    const resTitle = document.getElementById('resTitle');
    const resDesc = document.getElementById('resDesc');
    const resFilename = document.getElementById('resFilename');
    const vectorSection = document.getElementById('vectorSection');
    const resCircle = document.getElementById('resCircle');

    btnAnother?.addEventListener('click', () => {
        navigate('view-upload');
    });

    btnExport?.addEventListener('click', () => {
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
        if (!appState.result) {
            console.warn('renderResults called but appState.result is empty');
            return;
        }

        const { prediction, confidence } = appState.result;
        const filename = appState.filename || 'unknown_artifact.xyz';
        const isFake = prediction === 'FAKE';

        // Parse confidence — backend sends e.g. "87.50%" or a plain number
        const rawConf = String(confidence).replace('%', '');
        const confidenceNum = parseFloat(rawConf) / 100;

        // Update DOM
        resCertainty.textContent = typeof confidence === 'string' && confidence.includes('%')
            ? confidence
            : `${parseFloat(rawConf).toFixed(2)}%`;
        resFilename.textContent = filename;

        if (isFake) {
            resChip.className = 'chip-fake-lg mb-6';
            resChip.textContent = 'FAKE';
            resTitle.textContent = 'Synthetic Manipulation Detected';
            resDesc.textContent = 'High-probability neural artifacts identified. Spectral analysis reveals non-organic consistency in the digital noise floor.';
            vectorSection?.classList.remove('hidden');
            resCircle?.classList.remove('real');
            resCircle?.classList.add('fake');
        } else {
            resChip.className = 'chip-real-lg mb-6';
            resChip.textContent = 'REAL';
            resTitle.textContent = 'Authentic Artifact';
            resDesc.textContent = 'No synthetic manipulation detected. Temporal consistency and spectral metadata match expected organic patterns.';
            vectorSection?.classList.add('hidden');
            resCircle?.classList.remove('fake');
            resCircle?.classList.add('real');
        }

        // Animate circle — reset first, then animate to final offset
        const circumference = 552.92;
        resCircle.style.transition = 'none';
        resCircle.style.strokeDasharray = circumference;
        resCircle.style.strokeDashoffset = circumference;

        resCircle.getBoundingClientRect(); // force reflow

        const offset = circumference - (confidenceNum * circumference);
        resCircle.style.transition = 'stroke-dashoffset 1s ease';
        setTimeout(() => {
            resCircle.style.strokeDashoffset = offset;
        }, 100);
    };
}