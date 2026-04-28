import { initUpload } from './upload.js';
import { initResults } from './results.js';
import { healthCheck } from './api.js';

const appState = {
    file: null,
    filename: null,
    result: null
};

export function navigate(viewId) {
    // Hide ALL views strictly
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden'); // Ensure hidden is applied
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
        window.scrollTo(0, 0);
    }

    if (viewId === 'view-result' && typeof window.renderResultsFn === 'function') {
        window.renderResultsFn();
    }
}
/*export function navigate(viewId) {
    // Hide ALL views — remove active AND restore hidden
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    // Deactivate nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'text-primary');
    });

    // Show target view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Highlight active nav link
    const activeLink = document.querySelector(`.top-nav [data-view="${viewId}"]`);
    if (activeLink) {
        activeLink.classList.add('active', 'text-primary');
    }

    // Trigger result rendering when navigating to results view
    if (viewId === 'view-result' && typeof window.renderResultsFn === 'function') {
        window.renderResultsFn();
    }
}*/

document.addEventListener('DOMContentLoaded', async () => {
    const health = await healthCheck();
    if (!health.weights_loaded && health.status !== 'error') {
        const banner = document.getElementById('healthBanner');
        if (banner) banner.classList.remove('hidden');
    }

    initUpload(appState, navigate);
    window.renderResultsFn = initResults(appState, navigate);

    // Global listener for all data-view elements
    document.querySelectorAll('[data-view]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = e.currentTarget.getAttribute('data-view');
            navigate(targetView);
        });
    });

    const startBtn = document.getElementById('startAnalysisBtn');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigate('view-upload');
        });
    }

    navigate('view-landing');
    document.getElementById('copyYear').textContent = new Date().getFullYear();
});