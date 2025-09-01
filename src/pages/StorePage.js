import { useEffect } from "react";
import { useStore } from "../store/store";
import ProductCard from "../components/ProductCard";

export default function StorePage() {
    const products = useStore((s) => s.products);
    const status = useStore((s) => s.productsStatus);
    const error = useStore((s) => s.productsError);
    const fetchProducts = useStore((s) => s.fetchProducts);

    useEffect(() => {
        if (status === "idle") fetchProducts();
    }, [status, fetchProducts]);

    if (status === "loading") {
        return (
            <main className="page">
                <h1>Store</h1>
                <p>Loading products…</p>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="page">
                <h1>Store</h1>
                <p>Failed to load products: {error}</p>
            </main>
        );
    }

    return (
        <main className="page store">
            <h1>Store</h1>
            <section className="grid">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </section>
        </main>
    );
}
