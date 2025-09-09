// src/pages/StorePage.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import "./StorePage.css";

export default function StorePage() {
    const [rows, setRows] = useState([]);
    const [status, setStatus] = useState("idle"); // idle|loading|success|error
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        setStatus("loading");
        fetch(api.products.list())
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(data => { if (!alive) return; setRows(Array.isArray(data) ? data : (data?.data || [])); setStatus("success"); })
            .catch(e => { if (!alive) return; setError(e.message || "Failed to load"); setStatus("error"); });
        return () => { alive = false; };
    }, []);

    return (
        <main className="page store">
            <h1>Store</h1>
            {status === "loading" && <p>Loading products…</p>}
            {status === "error" && <p className="error">Failed to load: {error}</p>}

            <section className="grid">
                {rows.map(p => <ProductCard key={p.id || p._id} p={p} />)}
            </section>

            {status === "success" && rows.length === 0 && <p className="muted">No products yet.</p>}
        </main>
    );
}
