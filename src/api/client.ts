import axios from 'axios';
import type {InternalAxiosRequestConfig} from 'axios';
import type {TokenResponse} from "@/@types/auth.ts";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

if (!API_URL) {
    throw new Error('Missing VITE_API_URL. Check your .env file and restart the Vite dev server.');
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

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
        const originalRequest = error.config as RetryableRequestConfig | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Usa axios direto, não a instância, para evitar loop infinito
                const {data} = await axios.post<TokenResponse>(`${API_URL}/auth/refresh-token`, {
                    refreshToken
                });
                localStorage.setItem('access_token', data.accessToken);
                localStorage.setItem('refresh_token', data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
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
