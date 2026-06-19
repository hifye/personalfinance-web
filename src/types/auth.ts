export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    refreshTokenExpiresAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export type AuthUser = {
    userId: string;
    email: string;
    name: string;
}