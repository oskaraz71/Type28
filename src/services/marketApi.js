// client/src/services/marketApi.js

// API bazė: iš .env arba localhost
export const API_BASE =
    process.env.REACT_APP_API ||
    "http://localhost:2500";

// Ištraukiam JWT iš localStorage (priderink prie savo AuthProvider rakto)
function getToken() {
    try {
        return (
            localStorage.getItem("authToken") ||
            localStorage.getItem("blogToken") ||
            ""
        );
    } catch {
        return "";
    }
}

// Bendras JSON fetch helperis (su geresniu klaidų tvarkymu)
// - NENAUDOJA "Content-Type" per GET (kad neprovokuotų preflight be reikalo)
// - Aiškiai išskiria tinklo klaidas ir HTTP klaidas
async function jsonFetch(url, opts = {}) {
    const token = getToken();

    const method = (opts.method || "GET").toUpperCase();
    const hasBody = !!opts.body;

    const headers = {
        Accept: "application/json",
        // Content-Type tik jei yra body ir ne GET
        ...(method !== "GET" && hasBody ? { "Content-Type": "application/json" } : {}),
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const init = {
        method,
        headers,
        // body paliekam tik jei tikrai siunčiam ir ne GET
        ...(method !== "GET" && hasBody ? { body: opts.body } : {}),
    };

    let resp;
    try {
        resp = await fetch(url, init);
    } catch (e) {
        console.error("[jsonFetch] NETWORK ERROR →", { url, method, error: e });
        throw new Error(`Network error: ${e.message}`);
    }

    const ct = resp.headers.get("content-type") || "";
    const text = await resp.text();

    let data = null;
    if (ct.includes("application/json")) {
        try { data = text ? JSON.parse(text) : null; }
        catch (e) {
            console.warn("[jsonFetch] Bad JSON payload →", { url, status: resp.status, text });
            data = null;
        }
    } else {
        // jei ne JSON – grąžinam plain tekstą (gali prireikti debugui)
        data = text || null;
    }

    if (!resp.ok) {
        const msg = (data && typeof data === "object" ? (data.error || data.message) : null) || `HTTP ${resp.status}`;
        console.error("[jsonFetch] HTTP ERROR →", { url, status: resp.status, data });
        throw new Error(msg);
    }

    return data;
}

/* ---------- PRODUCTS ---------- */

export async function listProducts({ page = 1, limit = 20 } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    return jsonFetch(`${API_BASE}/api/products?${q.toString()}`);
}

export async function createProduct({ name, description, image_url, price }) {
    return jsonFetch(`${API_BASE}/api/products`, {
        method: "POST",
        body: JSON.stringify({
            name: String(name || "").trim(),
            description: String(description || "").trim(),
            image_url: String(image_url || "").trim(),
            price: Number(price),
        }),
    });
}

/* ---------- RESERVATIONS ---------- */

export async function myReservations() {
    return jsonFetch(`${API_BASE}/api/reservations/mine`);
}

// Tikimasi, kad backendas grąžins { ok, product, balance }
export async function reserveOne({ productId, reservedUntil }) {
    return jsonFetch(`${API_BASE}/api/reservations`, {
        method: "POST",
        body: JSON.stringify({ productId, reservedUntil }),
    });
}

export async function cancelReservation(productId) {
    return jsonFetch(`${API_BASE}/api/reservations/${encodeURIComponent(productId)}`, {
        method: "DELETE",
    });
}

/* ---------- WALLET (pasirinktinai) ---------- */

export async function deposit(amount, note = "") {
    return jsonFetch(`${API_BASE}/api/wallet/deposit`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount), note: String(note || "").trim() }),
    });
}
