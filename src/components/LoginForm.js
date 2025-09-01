import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";

/**
 * Props (nebūtini):
 * - onLogin?: (username: string, password: string) => Promise<void> | void
 *
 * Jei onLogin nepaduotas, bus kviečiamas zustand newsLogin({name,password}).
 */
export default function LoginForm({ onLogin }) {
    const navigate    = useNavigate();
    const storeLogin  = useStore((s) => s.newsLogin); // fallback, jei onLogin nėra

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr]           = useState("");
    const [busy, setBusy]         = useState(false);

    const canSubmit = useMemo(() => {
        return username.trim().length >= 4 && username.trim().length <= 15 && password.length > 0;
    }, [username, password]);

    const submit = async (e) => {
        e.preventDefault();
        setErr("");

        const u = username.trim();

        if (u.length < 4)  return setErr("Username must be at least 4 symbols.");
        if (u.length > 15) return setErr("Username must be 15 symbols or less.");
        if (!password)     return setErr("Password is required.");

        try {
            setBusy(true);
            if (typeof onLogin === "function") {
                await onLogin(u, password);
            } else {
                // default – naudojam tavo API per zustand
                await storeLogin({ name: u, password });
            }
            navigate("/news");
        } catch (e2) {
            setErr(e2?.message || "Login failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="form-container">
            <h1>Login</h1>

            <form onSubmit={submit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        placeholder="yourname"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        className="input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>
                {err && <p className="form-error" role="alert">{err}</p>}

                <button className="btn block" type="submit" disabled={!canSubmit || busy}>
                    {busy ? "Logging in…" : "Login"}
                </button>
            </form>
        </div>
    );
}
