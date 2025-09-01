// src/pages/UsersPage.js
import { useEffect, useState } from "react";
import styles from "./Contact.module.css"; // pernaudojam kortelių stilius iš Contact

const API = process.env.REACT_APP_API || "http://localhost:2500";
const API_URL = `${API}/api/blog`;

async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return {};
    try { return await res.json(); } catch { return {}; }
}

function Field({ label, value }) {
    const v = value ?? "—";
    return (
        <div className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={styles.fieldValue}>{v || "—"}</span>
        </div>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            setErr("");
            try {
                console.log("[UsersPage] fetch →", `${API_URL}/users`);
                const res = await fetch(`${API_URL}/users`);
                const data = await safeJson(res);
                console.log("[UsersPage] status", res.status, data);
                if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
                setUsers(Array.isArray(data.users) ? data.users : []);
            } catch (e) {
                console.error("[UsersPage] error:", e);
                setErr(e.message || "Fetch error");
                setUsers([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Users</h1>
                <p>Visi registruoti blog aplikacijos vartotojai.</p>
            </header>

            {loading && <p className={styles.summary}>Loading…</p>}
            {err && <p className={styles.error}>{err}</p>}
            {!loading && !err && <p className={styles.summary}>Iš viso: {users.length}</p>}

            <div className={styles.grid}>
                {users.map((u) => (
                    <div key={u.id} className={styles.card}>
                        <div className={styles.cardHead}>
                            <div className={styles.avatar}>
                                {u.avatar ? <img src={u.avatar} alt="" /> : (u.username || "?").slice(0,1).toUpperCase()}
                            </div>
                            <div className={styles.titleWrap}>
                                <h2 className={styles.username}>{u.username}</h2>
                                <div className={styles.muted}>{u.city}</div>
                            </div>
                        </div>

                        <div className={styles.fields}>
                            <Field label="E-mail" value={u.email} />
                            <Field label="Phone" value={u.phone} />
                            <Field label="Created" value={u.created_at ? new Date(u.created_at).toLocaleString() : ""} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
