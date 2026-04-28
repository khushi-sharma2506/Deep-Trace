const API_URL = 'http://localhost:8000';

export async function healthCheck() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
            throw new Error('Health check failed');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error (Health Check):', error);
        return { status: 'error', gpu_active: false, weights_loaded: false };
    }
}

export async function predict(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error (${response.status}): ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error (Predict):', error);
        throw error;
    }
}