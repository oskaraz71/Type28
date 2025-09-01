import { useParams, Link } from "react-router-dom";

const USERS = [
    { username: "alice",   label: "Alice",   bg: "#fde68a", fg: "#1f2937" }, // amber-200
    { username: "bob",     label: "Bob",     bg: "#bae6fd", fg: "#0f172a" }, // sky-200
    { username: "charlie", label: "Charlie", bg: "#fecdd3", fg: "#111827" }, // rose-200
    { username: "diana",   label: "Diana",   bg: "#bbf7d0", fg: "#052e16" }, // green-200
];

export default function ColorPage() {
    const { username } = useParams();
    const user =
        USERS.find(u => u.username === username) ??
        { username, label: "Unknown", bg: "#e5e7eb", fg: "#111827" };

    return (
        <main className="page" style={{ background: user.bg }}>
            <h1 style={{ color: user.fg, marginBottom: 8 }}>User: {user.label}</h1>
            <p style={{ color: user.fg, opacity: 0.8, marginBottom: 16 }}>
                Background changes by <code>/user/:username</code>.
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {USERS.map(u => (
                    <Link
                        key={u.username}
                        to={`/user/${u.username}`}
                        style={{
                            padding: "3px 10px",
                            borderRadius: 8,
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            color: "#111827",
                            textDecoration: "none",
                        }}
                    >
                        {u.label}
                    </Link>
                ))}
            </div>
        </main>
    );
}
