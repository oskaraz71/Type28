// src/auth/AuthProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, registerApi } from "../services/authApi";

const LS_TOKEN = "blogToken"; // tie patys raktai kaip BlogPage
const LS_USER  = "blogUser";

const Ctx = createContext({
    user: null,
    token: null,
    loading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    updateUser: async () => {},   // 👈 pridėta į kontekstą
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // load iš blogo raktų
    useEffect(() => {
        try {
            const t = localStorage.getItem(LS_TOKEN) || "";
            const raw = localStorage.getItem(LS_USER);
            const u = raw ? JSON.parse(raw) : null;
            if (t) setToken(t);
            if (u) setUser(u);
        } catch {}
        setLoading(false);
    }, []);

    // persist taip pat kaip BlogPage
    useEffect(() => {
        try {
            if (token) localStorage.setItem(LS_TOKEN, token); else localStorage.removeItem(LS_TOKEN);
            if (user)  localStorage.setItem(LS_USER, JSON.stringify(user)); else localStorage.removeItem(LS_USER);
        } catch {}
    }, [user, token]);

    async function login({ email, password }) {
        const d = await loginApi({ email, password }); // { token, user }
        if (!d?.token) throw new Error("Token missing");
        setToken(d.token);
        setUser(d.user || null);
        localStorage.setItem(LS_TOKEN, d.token);
        localStorage.setItem(LS_USER, JSON.stringify(d.user || null));
        return d;
    }

    async function register({ email, passwordOne, passwordTwo }) {
        const d = await registerApi({ email, passwordOne, passwordTwo }); // { token, user }
        if (!d?.token) throw new Error("Token missing");
        setToken(d.token);
        setUser(d.user || null);
        localStorage.setItem(LS_TOKEN, d.token);
        localStorage.setItem(LS_USER, JSON.stringify(d.user || null));
        return d;
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem(LS_TOKEN);
        localStorage.removeItem(LS_USER);
    }

    // ✅ NAUJA: local profile update (kol kas be serverio)
    async function updateUser(patch) {
        setUser((prev) => {
            const next = { ...(prev || {}), ...patch };
            try { localStorage.setItem(LS_USER, JSON.stringify(next)); } catch {}
            return next;
        });
        return { ok: true };
    }

    const value = useMemo(() => ({
        user, token, loading, login, register, logout, updateUser
    }), [user, token, loading]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
