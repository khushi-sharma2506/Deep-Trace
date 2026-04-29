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
    const resAuditId = document.getElementById('resAuditId');

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

    // ── Color + label config for 4-tier classification ──────────────
    const LABEL_CONFIG = {
        'Fake': {
            chipClass: 'chip-fake-lg',
            circleClass: 'fake',
            color: '#ff6b6b',
            title: 'Synthetic Manipulation Detected',
            desc: 'High-probability neural artifacts identified. Spectral analysis reveals non-organic consistency in the digital noise floor.',
            showVectors: true,
        },
        'Likely Fake': {
            chipClass: 'chip-likely-fake-lg',
            circleClass: 'likely-fake',
            color: '#ffaa33',
            title: 'Possible Manipulation Detected',
            desc: 'Moderate-probability artifacts detected. Some features suggest synthetic modification, but further verification is recommended.',
            showVectors: true,
        },
        'Likely Real': {
            chipClass: 'chip-likely-real-lg',
            circleClass: 'likely-real',
            color: '#7ecf7e',
            title: 'Likely Authentic Artifact',
            desc: 'Low-probability manipulation indicators. Temporal consistency and spectral metadata are mostly consistent with organic patterns.',
            showVectors: false,
        },
        'Real': {
            chipClass: 'chip-real-lg',
            circleClass: 'real',
            color: '#00daf3',
            title: 'Authentic Artifact Verified',
            desc: 'No synthetic manipulation detected. Temporal consistency and spectral metadata match expected organic patterns.',
            showVectors: false,
        },
    };

    return function renderResults() {
        if (!appState.result) return;

        const { score, label } = appState.result;
        const filename = appState.filename || 'unknown_artifact.xyz';
        const config = LABEL_CONFIG[label] || LABEL_CONFIG['Fake'];

        // Update DOM
        resCertainty.textContent = `${score}%`;
        resFilename.textContent = filename;

        // Audit ID
        if (resAuditId) {
            resAuditId.textContent = `#DT-${Math.floor(Math.random() * 10000)}`;
        }

        // Chip label + styling — show label with score
        resChip.className = `${config.chipClass} mb-6`;
        resChip.textContent = `${label} (${score}%)`;

        // Title + description
        resTitle.textContent = config.title;
        resDesc.textContent = config.desc;

        // Detection vectors section (only shown for fake/likely fake)
        if (config.showVectors) {
            vectorSection.classList.remove('hidden');
        } else {
            vectorSection.classList.add('hidden');
        }

        // Circle stroke color — remove all old classes, add new one
        resCircle.classList.remove('fake', 'likely-fake', 'likely-real', 'real');
        resCircle.classList.add(config.circleClass);

        // Animate Circle
        // 2 * Math.PI * R (where R=88) = 552.92
        const circumference = 552.92;
        resCircle.style.strokeDasharray = circumference;
        // Start empty
        resCircle.style.strokeDashoffset = circumference;
        
        // Trigger reflow
        resCircle.getBoundingClientRect();
        
        // Animate to score level (score is 0-100, normalize to 0-1)
        const normalizedScore = score / 100;
        const offset = circumference - (normalizedScore * circumference);
        setTimeout(() => {
            resCircle.style.strokeDashoffset = offset;
        }, 100);
    };
}
