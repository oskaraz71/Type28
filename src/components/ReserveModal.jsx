// src/components/ReserveModal.jsx
import { useMemo, useState } from "react";
import { api } from "../lib/api";
import "./ReserveModal.css";

export default function ReserveModal({ open, onClose, product, defaultUser }) {
    const [name, setName] = useState(defaultUser?.name || "");
    const [email, setEmail] = useState(defaultUser?.email || "");
    const [phone, setPhone] = useState(defaultUser?.phone || "");
    const [date, setDate] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState("");

    const [status, setStatus] = useState("idle"); // idle|submitting|success|error
    const [error, setError] = useState("");
    const canSubmit = useMemo(() =>
            open && product && name && email && date && from && to && Number(qty) > 0
        ,[open, product, name, email, date, from, to, qty]);

    if (!open) return null;

    async function submit(e) {
        e.preventDefault();
        if (!canSubmit || status === "submitting") return;
        setStatus("submitting");
        setError("");

        try {
            const payload = {
                product: String(product.id || product._id),
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                date,          // YYYY-MM-DD
                time_from: from, // HH:mm
                time_to: to,     // HH:mm
                qty: Number(qty),
                note: note || ""
            };

            const r = await fetch(api.reservations.create(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const text = await r.text();
            let json = null; try { json = text ? JSON.parse(text) : null; } catch {}

            if (!r.ok) {
                const msg = json?.error || json?.message || `HTTP ${r.status}`;
                throw new Error(msg);
            }

            setStatus("success");
            // pasirinktinai: uždaryti po sekundės
            setTimeout(() => onClose?.(), 1000);
        } catch (e2) {
            setError(e2.message || "Failed to create reservation");
            setStatus("error");
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <header className="modal__header">
                    <h3>Reserve: {product?.name}</h3>
                    <button className="x" onClick={onClose}>×</button>
                </header>

                <form className="modal__body" onSubmit={submit}>
                    <div className="grid2">
                        <label>Full name<input value={name} onChange={(e)=>setName(e.target.value)} required /></label>
                        <label>Email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
                        <label>Phone<input value={phone} onChange={(e)=>setPhone(e.target.value)} /></label>
                        <label>Date<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required /></label>
                        <label>From<input type="time" value={from} onChange={(e)=>setFrom(e.target.value)} required /></label>
                        <label>To<input type="time" value={to} onChange={(e)=>setTo(e.target.value)} required /></label>
                        <label>Qty<input type="number" min={1} value={qty} onChange={(e)=>setQty(e.target.value)} required /></label>
                        <label>Note<textarea value={note} onChange={(e)=>setNote(e.target.value)} rows={3} /></label>
                    </div>

                    {error && <p className="error">Error: {error}</p>}
                    {status === "success" && <p className="ok">Reservation created.</p>}

                    <footer className="modal__footer">
                        <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn" disabled={!canSubmit || status === "submitting"}>
                            {status === "submitting" ? "Submitting…" : "Create reservation"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
