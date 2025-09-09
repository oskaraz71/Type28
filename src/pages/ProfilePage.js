// src/pages/ProfilePage.js
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import "./ProfilePage.css";

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ username:"", email:"", phone:"", avatar:"", money:0 });
    const [initial, setInitial] = useState(null);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        const f = {
            username: user.username || user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
            money: Number(user.balance ?? user.money ?? 0),
        };
        setForm(f);
        setInitial(f);
    }, [user]);

    const change = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

    const patch = useMemo(() => {
        if (!initial) return {};
        const p = {};
        for (const k of Object.keys(initial)) {
            if (String(form[k]) !== String(initial[k])) p[k] = form[k];
        }
        return p;
    }, [form, initial]);

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (!user) return setError("Please login");
        if (!initial) return;

        if (Object.keys(patch).length === 0) {
            setStatus("success"); // nieko nekeista – laikom sėkme
            return;
        }
        try {
            setStatus("saving");
            await updateUser(patch); // siunčiam TIK pakeistus
            setStatus("success");
            setInitial(form); // atnaujinam bazinę būseną
        } catch (e2) {
            setError(e2.message || "Failed to save");
            setStatus("error");
        }
    }

    if (!user) return <main className="profile-page"><h1>My profile</h1><p>Please login.</p></main>;

    return (
        <main className="profile-page">
            <h1>My profile</h1>
            <form className="profile-form" onSubmit={submit}>
                <div className="grid2">
                    <label>Username
                        <input value={form.username} onChange={change("username")} />
                    </label>
                    <label>Email
                        <input type="email" value={form.email} onChange={change("email")} />
                    </label>
                    <label>Phone
                        <input value={form.phone} onChange={change("phone")} />
                    </label>
                    <label>Avatar URL
                        <input value={form.avatar} onChange={change("avatar")} placeholder="https://..." />
                    </label>
                    <label>Money (€)
                        <input type="number" step="0.01" value={form.money} onChange={change("money")} />
                    </label>
                </div>

                {error && <p className="error">Error: {error}</p>}
                {status === "success" && <p className="ok">Saved.</p>}

                <div className="actions">
                    <button className="btn" disabled={status==="saving"}>
                        {status==="saving" ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </main>
    );
}
