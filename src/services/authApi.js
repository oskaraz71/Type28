// src/services/authApi.js
const API_BASE = (process.env.REACT_APP_API || "").replace(/\/$/, "");
const BLOG_API = `${API_BASE}/api/blog`;

async function jsonFetch(url, opts = {}) {
    const r = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
        ...opts,
    });
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!r.ok) throw new Error(data?.message || data?.error || `HTTP ${r.status}`);
    return data;
}

export async function loginApi({ email, password }) {
    // Blogo login body: { email, password }
    return jsonFetch(`${BLOG_API}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export async function registerApi({ email, passwordOne, passwordTwo }) {
    // Blogo register body: { email, passwordOne, passwordTwo }
    return jsonFetch(`${BLOG_API}/register`, {
        method: "POST",
        body: JSON.stringify({ email, passwordOne, passwordTwo }),
    });
}
