import { useStore } from "../store/store";

export default function CartPage() {
    const cart = useStore((s) => s.cart);
    const removeFromCart = useStore((s) => s.removeFromCart);
    const setCartQty = useStore((s) => s.setCartQty);
    const clearCart = useStore((s) => s.clearCart);

    const total = cart.reduce((sum, c) => sum + c.qty * c.price, 0);

    if (!cart.length) {
        return (
            <main className="page">
                <h1>Cart</h1>
                <p>Your cart is empty.</p>
            </main>
        );
    }

    return (
        <main className="page">
            <h1>Cart</h1>

            <section className="cart-list">
                {cart.map((c) => (
                    <article key={c.id} className="cart-item">
                        <img className="thumb" src={c.image} alt={c.title} />
                        <div className="body">
                            <h4 className="title">{c.title}</h4>
                            <div className="meta">
                                <span>€{c.price.toFixed(2)}</span>
                            </div>
                            <div className="qty-row">
                                <button onClick={() => setCartQty(c.id, c.qty - 1)}>-</button>
                                <input
                                    type="number"
                                    min="1"
                                    value={c.qty}
                                    onChange={(e) => setCartQty(c.id, Number(e.target.value))}
                                />
                                <button onClick={() => setCartQty(c.id, c.qty + 1)}>+</button>
                            </div>
                        </div>
                        <div className="right">
                            <div className="line">Subtotal: €{(c.qty * c.price).toFixed(2)}</div>
                            <button className="btn danger" onClick={() => removeFromCart(c.id)}>
                                Remove
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            <footer className="cart-footer">
                <div className="total">Total: €{total.toFixed(2)}</div>
                <button className="btn" onClick={clearCart}>Clear cart</button>
            </footer>
        </main>
    );
}
