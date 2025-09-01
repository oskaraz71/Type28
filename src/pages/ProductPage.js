import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useStore } from "../store/store";

function renderStars(rate = 0) {
    // 0–5 žvaigždutės su pusėmis (naudojam pilną/tuščią; jei nori pusinių – praplėsim)
    const full = Math.round(rate);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(full);
}

export default function ProductPage() {
    const { id } = useParams();
    const { state } = useLocation();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [qty, setQty] = useState(1);

    const getProductById = useStore((s) => s.getProductById);
    const fetchSingleProduct = useStore((s) => s.fetchSingleProduct);
    const addToCart = useStore((s) => s.addToCart);

    const initial = state?.product;
    const fromStore = useMemo(() => getProductById(id), [getProductById, id]);
    const product = initial || fromStore;

    useEffect(() => {
        if (product) return;
        let alive = true;
        setLoading(true);
        setErr(null);
        fetchSingleProduct(id)
            .catch((e) => alive && setErr(e.message))
            .finally(() => alive && setLoading(false));
        return () => (alive = false);
    }, [id, product, fetchSingleProduct]);

    if (loading || !product) {
        return (
            <main className="page">
                <h1>Product</h1>
                {err ? <p>Failed to load: {err}</p> : <p>Loading…</p>}
            </main>
        );
    }

    const { title, price, description, category, image, rating } = product;
    const rate = Number(rating?.rate || 0);
    const count = Number(rating?.count || 0);

    const onAdd = () => {
        const q = Math.max(1, Math.floor(Number(qty) || 1));
        addToCart(product, q);
        setQty(1);
    };

    return (
        <main className="page">
            <h1>{title}</h1>

            <div className="product-single">
                <div className="media">
                    <img src={image} alt={title} />
                </div>

                <div className="info">
                    <p className="price">€{Number(price).toFixed(2)}</p>
                    <p className="category"><strong>Category:</strong> {category}</p>

                    {/* RATING */}
                    <div className="rating" aria-label={`Rating ${rate} out of 5 from ${count} reviews`}>
            <span className="stars" style={{ fontSize: 20, letterSpacing: 2 }}>
              {renderStars(rate)}
            </span>
                        <span style={{ marginLeft: 8 }}>
              {rate.toFixed(1)} / 5 · {count} reviews
            </span>
                    </div>

                    <p className="desc">{description}</p>

                    <div className="row">
                        <label htmlFor="qty">Qty:</label>
                        <input
                            id="qty"
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            style={{ width: 80 }}
                        />
                        <button className="btn primary" onClick={onAdd}>
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
