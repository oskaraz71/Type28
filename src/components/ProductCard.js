import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
    return (
        <Link
            to={`/shop/product/${product.id}`}
            state={{ product }}                          //prekė iš nufetchinto sarašo
            className="card-link"
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div className="card product-card">
                <div className="product-media">
                    <img src={product.image} alt={product.title} loading="lazy" />
                </div>
                <div className="product-body">
                    <h4 className="title">{product.title}</h4>
                    <div className="meta">
                        <span className="price">${Number(product.price).toFixed(2)}</span>
                        <span className="category">{product.category}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
