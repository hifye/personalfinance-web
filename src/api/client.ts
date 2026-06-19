import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Injeta o access token em toda requisição
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tenta refresh quando recebe 401
api.interceptors.response.use(response => response, async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Usa axios direto, não a instância, para evitar loop infinito
                const {data} = await api.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
                    refreshToken
                });
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);

            } catch {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export default api;
