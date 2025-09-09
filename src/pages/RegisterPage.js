import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import "./AuthPages.css";

export default function RegisterPage() {
    const { register } = useAuth();
    const [email, setEmail] = useState("");
    const [passwordOne, setPasswordOne] = useState("");
    const [passwordTwo, setPasswordTwo] = useState("");
    const [sub, setSub] = useState(false);
    const [err, setErr] = useState("");

    async function submit(e) {
        e.preventDefault();
        setErr("");
        if (passwordOne !== passwordTwo) return setErr("Passwords do not match.");
        setSub(true);
        try {
            await register({ email: email.trim(), passwordOne, passwordTwo });
            window.location.href = "/";
        } catch (e2) {
            setErr(e2.message || "Registration failed");
        } finally {
            setSub(false);
        }
    }

    return (
        <main className="auth-page">
            <h1>Register</h1>
            <form className="auth-form" onSubmit={submit}>
                <label>Email
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} />
                </label>
                <label>Password
                    <input type="password" value={passwordOne} onChange={(e)=>setPasswordOne(e.target.value)} />
                </label>
                <label>Repeat password
                    <input type="password" value={passwordTwo} onChange={(e)=>setPasswordTwo(e.target.value)} />
                </label>
                {err && <p className="error">{err}</p>}
                <button className="btn" disabled={sub}>{sub ? "Please wait…" : "Create account"}</button>
            </form>
        </main>
    );
}
