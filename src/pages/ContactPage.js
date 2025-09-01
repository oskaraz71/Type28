// src/pages/ContactPage.js
import React, { useState } from "react";
import styles from "./Contact.module.css";

// jei naudoji env – REACT_APP_API; jei ne, krenta į localhost:2500
const API_URL = process.env.REACT_APP_API || "http://localhost:2500";

/** saugus JSON, jei netyčia ateitų HTML */
async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return {};
    try {
        return await res.json();
    } catch {
        return {};
    }
}

/** suvienodiname gautų žmonių laukus */
function normalize(u, i) {
    const email = u.email ?? u["e-mail"] ?? u.contact?.email ?? "";
    const phone = u.phone ?? u.phoneNumber ?? u.telephone ?? u.mobile ?? u.cell ?? "";
    const name = u.name || u.fullName || u.username || `user${i + 1}`;
    const addr =
        u.address ||
        [u.street, u.address1, u.addressLine].filter(Boolean).join(" ") ||
        u.location?.street ||
        "";

    return {
        id: u.id || u._id || u.uuid || u.username || i,
        username: u.username || name.split(" ")[0],
        name,
        jobTitle: u.jobTitle || u.occupation || u.job || u.company?.title || "",
        email,
        phone,
        gender: u.gender || u.sex || "",
        age: u.age ?? u.dob?.age ?? "",
        address: addr,
        city: u.city || u.location?.city || "",
        avatar: u.avatar || u.photo || u.picture || u.image?.avatar || "",
    };
}

// ⛔️ ŠITŲ DVIŲ LOGŲ NEBŪTŲ (jie kėlė klaidą):
// console.log("[Contact] sample raw:", raw[0]);
// console.log("[Contact] normalized:", normalized[0]);

function Field({ label, value }) {
    const v = value ?? "—";
    return (
        <div className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={styles.fieldValue}>{v || "—"}</span>
        </div>
    );
}

export default function ContactPage() {
    const [amount, setAmount] = useState(5);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        setStatus("");
        try {
            const url = `${API_URL}/generatePerson/${Number(amount)}`;
            console.log("[Contact] fetchUsers →", { url });
            const res = await fetch(url);

            const data = await safeJson(res);
            console.log("[Contact] response:", res.status, data);

            if (!res.ok || data.ok === false) {
                throw new Error(data.message || `HTTP ${res.status}`);
            }

            const raw = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : [];
            console.log("[Contact] sample raw:", raw[0]);

            const normalized = raw.map(normalize);
            console.log("[Contact] normalized[0]:", normalized[0]);

            setUsers(normalized);
            setStatus(`Gauta ${normalized.length} vnt.`);
        } catch (e) {
            console.error("[Contact] fetchUsers error:", e);
            setError(e.message || "Fetch error");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const n = Number(amount);
        if (!Number.isFinite(n) || n < 1 || n > 500) {
            setError("Įveskite skaičių 1..500");
            return;
        }
        fetchUsers();
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Generate Users</h1>
                <p>Atsitiktinių vartotojų generatorius (serveris: faker).</p>
            </header>

            <form className={styles.controls} onSubmit={handleSubmit}>
                <label className={styles.amountLabel}>
                    Kiek?
                    <input
                        type="number"
                        min={1}
                        max={500}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </label>
                <button className={styles.button} type="submit" disabled={loading}>
                    {loading ? "Kraunama..." : "Gauti"}
                </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}
            {status && <p className={styles.summary}>{status}</p>}

            <div className={styles.grid}>
                {users.map((u) => (
                    <div key={u.id} className={styles.card}>
                        <div className={styles.cardHead}>
                            <div className={styles.avatar}>
                                {u.avatar ? (
                                    <img src={u.avatar} alt="" />
                                ) : (
                                    (u.username || "?").slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <div className={styles.titleWrap}>
                                <h2 className={styles.username}>{u.name}</h2>
                                <div className={styles.muted}>{u.jobTitle || u.username}</div>
                            </div>
                        </div>

                        <div className={styles.fields}>
                            <Field label="Age" value={u.age} />
                            <Field label="Gender" value={u.gender} />
                            <Field label="Phone" value={u.phone} />
                            <Field label="E-mail" value={u.email} />
                            <Field label="Address" value={u.address} />
                            <Field label="City" value={u.city} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
