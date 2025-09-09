// src/lib/api.js
export const API_BASE = process.env.REACT_APP_API || "http://localhost:2500";

export const api = {
    products: {
        list: () => `${API_BASE}/api/products`,
        one: (id) => `${API_BASE}/api/products/${encodeURIComponent(id)}`
    },
    reservations: {
        create: () => `${API_BASE}/api/reservations`
    }
};
