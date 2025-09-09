import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import "./AuthPages.css";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [sub, setSub] = useState(false);
    const [err, setErr] = useState("");

    async function submit(e) {
        e.preventDefault();
        setErr(""); setSub(true);
        try {
            await login({ email: email.trim(), password });
            // kad Toolbar iškart atsinaujintų:
            window.location.href = "/";
        } catch (e2) {
            setErr(e2.message || "Login failed");
        } finally {
            setSub(false);
        }
    }

    return (
        <main className="auth-page">
            <h1>Login</h1>
            <form className="auth-form" onSubmit={submit}>
                <label>Email or username
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} />
                </label>
                <label>Password
                    <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
                </label>
                {err && <p className="error">{err}</p>}
                <button className="btn" disabled={sub}>{sub ? "Please wait…" : "Login"}</button>
            </form>
        </main>
    );
}
