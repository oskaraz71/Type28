const API_BASE = (process.env.REACT_APP_API || "").replace(/\/$/, "");
const LS_TOKEN = "blogToken";

function getToken() {
    try { return localStorage.getItem(LS_TOKEN) || ""; } catch { return ""; }
}

async function jsonFetch(url, opts = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const r = await fetch(url, { ...opts, headers });
    const text = await r.text();
    let data = null; try { data = text ? JSON.parse(text) : null; } catch {}
    if (!r.ok) throw new Error(data?.error || data?.message || `HTTP ${r.status}`);
    return data;
}

// PRODUCTS
export async function listProducts({ page = 1, limit = 20 } = {}) {
    const res = await jsonFetch(`${API_BASE}/api/products?page=${page}&limit=${limit}`);
    // tavo struktūra: { success, page, limit, total, count, products: [...] }
    const arr = Array.isArray(res?.products) ? res.products : [];
    return { meta: { page: res.page, limit: res.limit, total: res.total, count: res.count }, products: arr };
}

export async function createProduct({ name, image_url, price }) {
    return jsonFetch(`${API_BASE}/api/products`, {
        method: "POST",
        body: JSON.stringify({ name, image_url, price: Number(price) }),
    });
}

// RESERVATIONS
export async function reserveOne({ productId, reservedUntil }) {
    // minimalus payload: { productId, reservedUntil }
    return jsonFetch(`${API_BASE}/api/reservations`, {
        method: "POST",
        body: JSON.stringify({ productId, reservedUntil }),
    });
}

export async function cancelReservation(reservationId) {
    return jsonFetch(`${API_BASE}/api/reservations/${encodeURIComponent(reservationId)}`, {
        method: "DELETE",
    });
}

export async function myReservations() {
    // bandome kelis: /mine, ?me=true, / (su tokenu serveris vis tiek grąžins mano)
    const paths = ["/api/reservations/mine", "/api/reservations?me=true", "/api/reservations"];
    let last = null;
    for (const p of paths) {
        try { return await jsonFetch(`${API_BASE}${p}`); }
        catch (e) {
            last = e;
            if (/HTTP 401|HTTP 403/.test(String(e))) throw e;
            if (!/HTTP 404/.test(String(e))) throw e;
        }
    }
    throw last || new Error("Reservations endpoint not found");
}
