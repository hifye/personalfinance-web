import type {AuthUser, TokenResponse} from "../../types/auth.ts";
import {createContext, type ReactNode, useCallback, useContext, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {clearTokens} from "../../api/client.ts";

interface JwtPayload {
    sub: string;
    email: string;
    unique_name: string;
    exp: number;
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
        return {
            userId: payload.sub,
            email: payload.email,
            name: payload.unique_name
        };
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
        localStorage.setItem('access_token', token.access_token);
        localStorage.setItem('refresh_token', token.refresh_token);
        setUser(getUserFromToken(token.access_token));
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