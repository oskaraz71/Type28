// client/src/components/Toolbar.js
import { NavLink, useLocation } from "react-router-dom";
import { useStore } from "../store/store";

export default function Toolbar() {
    const location = useLocation();

    const cart = useStore((s) => s.cart);
    const newsUser = useStore((s) => s.newsUser);
    const newsLogout = useStore((s) => s.newsLogout);

    const cartQty = cart.reduce((sum, c) => sum + (c.qty || 0), 0);
    const cartTotal = cart.reduce((sum, c) => sum + (c.qty || 0) * Number(c.price || 0), 0);

    const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

    return (
        <header className="toolbar">
            <nav className="toolbar-inner">
                <div className="left">
                    <NavLink to="/" className={linkClass} end>Home</NavLink>
                    <NavLink to="/about" className={linkClass}>About</NavLink>
                    <NavLink to="/shop" className={linkClass}>Shop</NavLink>
                    <NavLink to="/news" className={linkClass}>News</NavLink>
                    <NavLink to="/gallery" className={linkClass}>Gallery</NavLink>
                    <NavLink to="/colors" className={linkClass}>Colors</NavLink>
                    <NavLink to="/users" className={linkClass}>Users</NavLink>
                    <NavLink to="/blog" className={linkClass}>Blog</NavLink>
                    <NavLink to="/contact" className={linkClass}>Contact</NavLink>
                </div>

                <div className="right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {newsUser ? (
                        <>
                            <span className="username">{newsUser.name}</span>
                            <button className="btn" onClick={newsLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkClass}>Login</NavLink>
                            <NavLink to="/register" className={linkClass}>Register</NavLink>
                        </>
                    )}

                    <NavLink to="/shop/cart" className="cart-link">
                        Cart ({cartQty}) €{cartTotal.toFixed(2)}
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}
