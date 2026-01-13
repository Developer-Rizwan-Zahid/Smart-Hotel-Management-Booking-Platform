"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, refreshToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            const decoded = JSON.parse(jsonPayload);

            // Map JWT claims to User object
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || "Guest";

            return {
                id: decoded.sub || decoded.nameid,
                email: decoded.email || decoded.unique_name,
                role: Array.isArray(role) ? role[0] : role
            };
        } catch (e) {
            console.error("Failed to decode token", e);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedUser = decodeToken(token);
            setUser(decodedUser);
        }
        setLoading(false);
    }, []);

    const login = (token: string, refreshToken: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        const decodedUser = decodeToken(token);
        setUser(decodedUser);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
