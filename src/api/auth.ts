import api, {clearTokens} from "./client.ts";
import type {LoginRequest, RegisterRequest, TokenResponse} from "@/@types/auth.ts";

export async function login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('auth/login', data);
    return response.data
}

export async function register(data: RegisterRequest): Promise<void> {
    await api.post('auth/register', data);
}

export async function logout(): Promise<void> {
    try {
        await api.post('auth/logout');
    } finally {
        clearTokens();
    }
}