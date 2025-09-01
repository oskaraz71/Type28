// === News API client (base: http://156.67.83.41:1111) ===
const API_BASE = "http://156.67.83.41:1111";

async function jfetch(url, opts = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
        ...opts,
    });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { success: false, message: text }; }
    if (!res.ok || data?.success === false) {
        const msg = data?.message || res.statusText || "Request failed";
        throw new Error(msg);
    }
    return data;
}

export const newsApi = {
    // Auth
    createAccount: ({ name, passwordOne, passwordTwo }) =>
        jfetch(`${API_BASE}/createaccount`, { method: "POST", body: JSON.stringify({ name, passwordOne, passwordTwo }) }),
    login: ({ name, password }) =>
        jfetch(`${API_BASE}/login`, { method: "POST", body: JSON.stringify({ name, password }) }), // returns {secretKey}
    // Posts
    getAllPosts: () => jfetch(`${API_BASE}/getallposts`, { method: "GET" }), // -> { success, data: [...] }
    getUserPosts: (name) => jfetch(`${API_BASE}/getuserposts/${encodeURIComponent(name)}`, { method: "GET" }),
    getSinglePost: (name, id) =>
        jfetch(`${API_BASE}/getsinglepost/${encodeURIComponent(name)}/${encodeURIComponent(id)}`, { method: "GET" }),
    createPost: ({ secretKey, title, image, description }) =>
        jfetch(`${API_BASE}/createpost`, { method: "POST", body: JSON.stringify({ secretKey, title, image, description }) }),
    updatePost: ({ secretKey, id, title, image, description }) =>
        jfetch(`${API_BASE}/updatepost`, { method: "POST", body: JSON.stringify({ secretKey, id, title, image, description }) }),
    deletePost: ({ secretKey, id }) =>
        jfetch(`${API_BASE}/deletepost`, { method: "POST", body: JSON.stringify({ secretKey, id }) }),
};
