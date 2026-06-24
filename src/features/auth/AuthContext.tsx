import type {AuthUser, TokenResponse} from "@/@types/auth.ts";
import {createContext, type ReactNode, useCallback, useContext, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {clearTokens} from "@/api/client.ts";

interface JwtPayload {
    sub?: string;
    nameid?: string;
    email?: string;
    unique_name?: string;
    name?: string;
    exp?: number;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    signIn: (token: TokenResponse) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getUserFromToken(token: string): AuthUser | null {
    try {
        const payload = jwtDecode<JwtPayload>(token);

        if (payload.exp && payload.exp * 1000 <= Date.now()) {
            return null;
        }

        const userId =
            payload.sub ??
            payload.nameid ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const email =
            payload.email ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        const name =
            payload.unique_name ??
            payload.name ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

        if (!userId || !email || !name) {
            return null;
        }

        return {userId, email, name};
    } catch {
        return null;
    }
}

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        // Inicializa do localStorage se já estiver logado
        const token = localStorage.getItem('access_token');
        return token ? getUserFromToken(token) : null;
    });

    const signIn = useCallback((token: TokenResponse) => {
        localStorage.setItem('access_token', token.accessToken);
        localStorage.setItem('refresh_token', token.refreshToken);
        setUser(getUserFromToken(token.accessToken));
    }, []);

    const signOut = useCallback(() => {
        clearTokens();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{user, isAuthenticated: user != null, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
