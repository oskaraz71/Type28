// React project: src/auth/AuthProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, registerApi, meApi } from "../services/authApi";

const AuthContext = createContext({
    user: null,
    token: null,
    loading: false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
});

// LocalStorage raktas
const LS_KEY = "auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // įkeliam iš localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.token) {
                    setToken(parsed.token);
                    setUser(parsed.user || null);
                }
            }
        } catch {}
        setLoading(false);
    }, []);

    // išsaugom į localStorage
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify({ user, token }));
    }, [user, token]);

    async function login({ email, password }) {
        const data = await loginApi({ email, password }); // tikimės { user, token }
        setUser(data.user || null);
        setToken(data.token || null);
        return data;
    }

    async function register({ username, email, password }) {
        const data = await registerApi({ username, email, password }); // { user, token } ar pan.
        setUser(data.user || null);
        setToken(data.token || null);
        return data;
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem(LS_KEY);
    }

    // Pasirinktinai – pasitikrinimas /api/auth/me (jei turi endpointą)
    async function refresh() {
        if (!token) return null;
        try {
            const data = await meApi(token);
            setUser(data?.user || null);
            return data;
        } catch {
            logout();
            return null;
        }
    }

    const value = useMemo(
        () => ({ user, token, loading, login, register, logout, refresh }),
        [user, token, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
