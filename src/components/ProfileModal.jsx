// src/components/ProfileModal.jsx
import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react";
import "./ProfileModal.css";

export default function ProfileModal({ open, onClose }) {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ username:"", email:"", phone:"", avatar:"", money:0 });
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !user) return;
        setForm({
            username: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
            money: Number(user.money ?? user.balance ?? 0),
        });
        setStatus("idle"); setError("");
    }, [open, user]);

    if (!open) return null;

    const change = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

    async function submit(e) {
        e.preventDefault();
        setStatus("submitting"); setError("");
        try {
            const patch = {
                username: form.username,
                email: form.email,
                phone: form.phone,
                avatar: form.avatar,
                money: Number(form.money), // backend’e gali būti 'balance' – prireikus pakeisiu
            };
            await updateUser(patch);
            setStatus("success");
            setTimeout(() => onClose?.(), 600);
        } catch (e2) {
            setError(e2.message || "Failed to update profile");
            setStatus("error");
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
                <header className="modal__header">
                    <h3>My profile</h3>
                    <button className="x" onClick={onClose}>×</button>
                </header>

                <form className="modal__body" onSubmit={submit}>
                    <div className="grid2">
                        <label>Username<input value={form.username} onChange={change("username")} required /></label>
                        <label>Email<input type="email" value={form.email} onChange={change("email")} required /></label>
                        <label>Phone<input value={form.phone} onChange={change("phone")} /></label>
                        <label>Avatar URL<input value={form.avatar} onChange={change("avatar")} /></label>
                        <label>Money (€)<input type="number" step="0.01" value={form.money} onChange={change("money")} /></label>
                    </div>

                    {error && <p className="error">{error}</p>}
                    {status === "success" && <p className="ok">Saved.</p>}

                    <footer className="modal__footer">
                        <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
                        <button className="btn" disabled={status==="submitting"}>{status==="submitting" ? "Saving…" : "Save changes"}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
