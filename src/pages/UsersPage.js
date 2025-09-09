// src/pages/UsersPage.js
import { useEffect, useMemo, useState } from "react";
import styles from "./Users.module.css";

const API_URL = "http://localhost:2500/api/blog";

// helpers
function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return Promise.resolve({});
    return res.json().catch(() => ({}));
}
function getToken() {
    try { return localStorage.getItem("blogToken") || ""; } catch { return ""; }
}
function authHeaders() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}
function fmt(dt) {
    if (!dt) return "";
    try { return new Date(dt).toLocaleString(); } catch { return String(dt); }
}

export default function UsersPage() {
    const [order, setOrder] = useState("desc");
    const [users, setUsers] = useState([]);
    const [me, setMe] = useState(null); // from localStorage
    const [myPokes, setMyPokes] = useState([]);
    const [myPokesTotal, setMyPokesTotal] = useState(0);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("blogUser");
            if (raw) setMe(JSON.parse(raw));
        } catch {}
    }, []);

    useEffect(() => {
        loadUsers(order);
    }, [order]);

    useEffect(() => {
        if (getToken()) loadMyPokes();
        // eslint-disable-next-line
    }, [me?.id]);

    async function loadUsers(ord = "desc") {
        try {
            console.log("[USERS_PAGE] fetch users");
            const res = await fetch(`${API_URL}/users?order=${ord}`, { headers: { ...authHeaders() } });
            const data = await safeJson(res);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            setUsers(Array.isArray(data.users) ? data.users : []);
        } catch (e) {
            console.error(e);
            setUsers([]);
        }
    }

    async function loadMyPokes() {
        try {
            if (!getToken()) return;
            const res = await fetch(`${API_URL}/users/me/pokes`, { headers: { ...authHeaders() } });
            const data = await safeJson(res);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            setMyPokes(Array.isArray(data.items) ? data.items : []);
            setMyPokesTotal(typeof data.count === "number" ? data.count : (data.items?.length || 0));
        } catch (e) {
            console.error("[POKES] load my pokes error:", e);
            setMyPokes([]);
            setMyPokesTotal(0);
        }
    }

    async function togglePoke(u) {
        if (!getToken()) { alert("Login to poke users."); return; }
        if (!u?.id) return;
        if (me?.id && String(me.id) === String(u.id)) { alert("You cannot poke yourself."); return; }
        if (u.poked_by_me) return;

        try {
            const res = await fetch(`${API_URL}/users/${u.id}/poke`, { method: "POST", headers: { ...authHeaders() } });
            const data = await safeJson(res);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);

            // update one card counter + poked_by_me flag
            const newCount = data?.target?.pokes_count;
            setUsers(prev => prev.map(x =>
                x.id === u.id
                    ? { ...x, pokes_count: typeof newCount === "number" ? newCount : (x.pokes_count || 0) + 1, poked_by_me: true }
                    : x
            ));

            // refresh right panel from server payload (instant)
            if (data.myPokes?.items) {
                setMyPokes(data.myPokes.items);
                setMyPokesTotal(data.myPokes.count ?? data.myPokes.items.length);
            } else {
                // fallback
                loadMyPokes();
            }
        } catch (e) {
            if (/already poked/i.test(String(e.message))) {
                // sync UI anyway
                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, poked_by_me: true } : x));
            } else {
                console.error("[POKE] toggle error:", e);
                alert(String(e.message || e));
            }
        }
    }

    const sortedMyPokes = useMemo(
        () => [...myPokes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        [myPokes]
    );

    return (
        <div className="page">
            <h1>Users</h1>
            <p className="muted">Blog aplikacijos registruoti vartotojai.</p>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <label style={{ fontSize: 14, color: "#6b7280", marginRight: 8 }}>Sort:</label>
                <select value={order} onChange={e => setOrder(e.target.value)}>
                    <option value="desc">Newest → Oldest</option>
                    <option value="asc">Oldest → Newest</option>
                </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                {/* left: users grid */}
                <div className="grid">
                    {users.map(u => (
                        <div key={u.id} className="card" style={{ position: "relative" }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 9999, background: "linear-gradient(135deg,#a78bfa,#f0abfc)",
                                    color: "#fff", fontWeight: 700, display: "grid", placeItems: "center"
                                }}>
                                    {(u.userName || "u").slice(0,1).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 400 }}>{u.userName}</div>
                                    <div className="muted" style={{ fontSize: 12 }}>{u.city }</div>
                                </div>
                                <div style={{ marginLeft: "auto" }}>
                                    <span className="badge">{u.pokes_count || 0}</span>
                                </div>
                            </div>

                            <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
                                <div style={{ display: "grid", gap: 6 }}>
                                    <div className="input muted" style={{ pointerEvents: "none" }}>{u.email}</div>
                                    <div className="input muted" style={{ pointerEvents: "none" }}>{u.phone || "—"}</div>
                                    <div className="input muted" style={{ pointerEvents: "none" }}>{fmt(u.created_at)}</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className="btn"
                                    onClick={() => togglePoke(u)}
                                    disabled={u.poked_by_me || (me?.id && String(me.id) === String(u.id))}
                                    title={u.poked_by_me ? "Already poked" : "Poke"}
                                >
                                    Poke
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* right: my pokes + profile */}
                <div style={{ display: "grid", gap: 16 }}>
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>My pokes</h3>
                        <div className="muted" style={{ marginBottom: 8 }}>Total: {myPokesTotal}</div>
                        <div style={{ maxHeight: 280, overflow: "auto", display: "grid", gap: 8 }}>
                            {sortedMyPokes.length === 0 ? (
                                <div className="muted">—</div>
                            ) : (
                                sortedMyPokes.map(p => (
                                    <div key={p.id} className="input" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 9999, background: "rgba(167,139,250,.5)",
                                            fontSize: 12, fontWeight: 700, color: "#fff", display: "grid", placeItems: "center"
                                        }}>
                                            {(p.from_name || "U").slice(0,1).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>
                                                {p.from_name || "user"}{p.from_email ? <span className="muted"> • {p.from_email}</span> : null}
                                            </div>
                                        </div>
                                        <div className="muted" style={{ whiteSpace: "nowrap", fontSize: 12 }}>{fmt(p.created_at)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* profile editor (keičiam tik FE dalį – backend PUT /users/me jau yra) */}
                    <ProfileBox />
                </div>
            </div>
        </div>
    );
}

function ProfileBox() {
    const [phone, setPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [city, setCity] = useState("Vilnius");
    const [about, setAbout] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => { setMsg(""); }, [phone, avatar, city, about]);

    async function saveProfile() {
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ phone, avatar_url: avatar, city, about }),
            });
            const data = await safeJson(res);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            setMsg("Saved.");
        } catch (e) {
            setMsg(String(e.message || e));
        }
    }

    return (
        <div className="card">
            <h3 style={{ marginTop: 0 }}>My profile</h3>
            <div style={{ display: "grid", gap: 8 }}>
                <input className="input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                <input className="input" placeholder="Avatar URL" value={avatar} onChange={e => setAvatar(e.target.value)} />
                <input className="input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                <textarea className="textarea" placeholder="About" rows={4} value={about} onChange={e => setAbout(e.target.value)} />
                <div><button className="btn" onClick={saveProfile}>Save</button></div>
                {msg && <div className={"muted " + (/\bsaved\b/i.test(msg) ? "ok" : "err")}>{msg}</div>}
            </div>
        </div>
    );
}
