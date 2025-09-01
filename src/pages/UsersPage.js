// client/src/pages/UsersPage.js
import { useEffect, useState } from "react";
import styles from "./Users.module.css";

const API_URL = process.env.REACT_APP_API || "http://localhost:2500";

async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return {};
    try { return await res.json(); } catch { return {}; }
}

function Card({ u }) {
    const dt = u.created_at ? new Date(u.created_at).toLocaleString() : "";
    return (
        <div className={styles.card}>
            <div className={styles.cardHead}>
                <div className={styles.avatar}>
                    {u.avatar ? <img src={u.avatar} alt="" /> : (u.userName || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className={styles.titleWrap}>
                    <h3 className={styles.username}>{u.userName}</h3>
                    <div className={styles.muted}>{u.email}</div>
                </div>
            </div>

            <div className={styles.fields}>
                <div className={styles.field}><span className={styles.fieldLabel}>Telephone</span><span className={styles.fieldValue}>{u.phone || "—"}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>Created</span><span className={styles.fieldValue}>{dt || "—"}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>Total likes</span><span className={styles.fieldValue}>{u.likes_count || 0}</span></div>
            </div>
        </div>
    );
}

export default function UsersPage() {
    const [order, setOrder] = useState("desc");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => { load(); }, [order]);

    async function load() {
        setLoading(true);
        setErr("");
        try {
            console.log("[USERS_PAGE] fetch users");
            const res = await fetch(`${API_URL}/api/blog/users?order=${order}`);
            const data = await safeJson(res);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            setUsers(Array.isArray(data.users) ? data.users : []);
        } catch (e) {
            console.error(e);
            setErr(e.message || "Fetch error");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Users</h1>
                <div className={styles.controls}>
                    <label>
                        Order:&nbsp;
                        <select value={order} onChange={(e) => setOrder(e.target.value)}>
                            <option value="desc">Newest → Oldest</option>
                            <option value="asc">Oldest → Newest</option>
                        </select>
                    </label>
                </div>
            </header>

            {loading && <p className={styles.info}>Loading…</p>}
            {err && <p className={styles.error}>{err}</p>}

            <div className={styles.grid}>
                {users.map((u) => <Card key={u.id} u={u} />)}
            </div>
        </div>
    );
}
