// src/pages/ProductPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import ReserveModal from "../components/ReserveModal";
import "./ProductPage.css";

export default function ProductPage() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const openReserve = params.get("reserve") === "1";

    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [reserveOpen, setReserveOpen] = useState(openReserve);

    useEffect(() => setReserveOpen(openReserve), [openReserve]);

    useEffect(() => {
        let alive = true;
        setStatus("loading");
        fetch(api.products.one(id))
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(data => { if (!alive) return; setProduct(data?.data || data); setStatus("success"); })
            .catch(e => { if (!alive) return; setError(e.message || "Failed to load"); setStatus("error"); });
        return () => { alive = false; };
    }, [id]);

    const price = useMemo(() => Number(product?.price || 0).toFixed(2), [product]);

    return (
        <main className="page product-page">
            {status === "loading" && <p>Loading…</p>}
            {status === "error" && <p className="error">Failed to load: {error}</p>}
            {status === "success" && product && (
                <>
                    <div className="product">
                        <div className="product__imgwrap">
                            <img className="product__img" src={product.image_url} alt={product.name} />
                        </div>
                        <div className="product__body">
                            <h1>{product.name}</h1>
                            <div className="product__price">€ {price}</div>
                            {product.description && (
                                <p className="product__desc">{product.description}</p>
                            )}
                            <div className="actions">
                                <button className="btn" onClick={() => setReserveOpen(true)}>Reserve</button>
                            </div>
                        </div>
                    </div>

                    <ReserveModal
                        open={reserveOpen}
                        onClose={() => setReserveOpen(false)}
                        product={product}
                    />
                </>
            )}
        </main>
    );
}
