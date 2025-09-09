// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ p }) {
    const id = p.id || p._id;
    return (
        <article className="product-card">
            <div className="product-card__imgwrap">
                <img src={p.image_url} alt={p.name} className="product-card__img" />
            </div>

            <div className="product-card__body">
                <h3 className="product-card__title">{p.name}</h3>
                <div className="product-card__price">€ {Number(p.price || 0).toFixed(2)}</div>
                <div className="product-card__actions">
                    <Link className="btn" to={`/shop/product/${id}`}>View</Link>
                    <Link className="btn btn--ghost" to={`/shop/product/${id}?reserve=1`}>Reserve</Link>
                </div>
            </div>
        </article>
    );
}
