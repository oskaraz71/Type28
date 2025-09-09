import { NavLink } from "react-router-dom";
import { useStore } from "../store/store";
import { useAuth } from "../auth/AuthProvider";

export default function Toolbar() {
    const cart = useStore((s) => s.cart);
    const { user, logout, loading } = useAuth();

    const cartQty = cart.reduce((sum, c) => sum + (c.qty || 0), 0);
    const cartTotal = cart.reduce(
        (sum, c) => sum + (c.qty || 0) * Number(c.price || 0),
        0
    );
    const linkClass = ({ isActive }) =>
        "nav-link" + (isActive ? " active" : "");

    const displayName =
        user?.userName || user?.name || user?.username || user?.email || "";
    const balance = Number(user?.balance ?? user?.money ?? 0);
    const avatarLetter = (displayName || user?.email || "?")
        .charAt(0)
        .toUpperCase();

    return (
        <header className="toolbar">
            <nav className="toolbar-inner">
                <div className="left">
                    <NavLink to="/" className={linkClass} end>
                        Home
                    </NavLink>
                    <NavLink to="/about" className={linkClass}>
                        About
                    </NavLink>
                    <NavLink to="/shop" className={linkClass}>
                        Shop
                    </NavLink>
                    <NavLink to="/news" className={linkClass}>
                        News
                    </NavLink>
                    <NavLink to="/gallery" className={linkClass}>
                        Gallery
                    </NavLink>
                    <NavLink to="/reservations" className={linkClass}>
                        Reservations
                    </NavLink>
                    <NavLink to="/users" className={linkClass}>
                        Users
                    </NavLink>
                    <NavLink to="/blog" className={linkClass}>
                        Blog
                    </NavLink>
                    <NavLink to="/contact" className={linkClass}>
                        Contact
                    </NavLink>
                </div>

                <div
                    className="right"
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                    {loading ? (
                        <span>...</span>
                    ) : user ? (
                        <>
                            <span className="username">{displayName}</span>
                            <span className="balance">€{balance.toFixed(2)}</span>

                            {/* Avataras */}
                            <NavLink
                                to="/profile"
                                title="Profile"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    maxHeight: "50px", // ~90% toolbar aukščio
                                    aspectRatio: "1",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    display: "grid",
                                    placeItems: "center",
                                    border: "1px solid #d1d5db",
                                    background: "#f3f4f6",
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="avatar"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontWeight: 700 }}>{avatarLetter}</span>
                                )}
                            </NavLink>

                            <button className="btn" onClick={logout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkClass}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className={linkClass}>
                                Register
                            </NavLink>
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
