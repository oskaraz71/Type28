import React, { useMemo, useState, useEffect, useRef } from "react";
import {useStore} from "zustand/react";

/**
 * Props:
 * - onRegister(username, email, password)
 * - users?: [{ username, email }]
 */
export default function RegisterForm({ onRegister, users = [] }) {
    const [username, setUsername] = useState("");
    const [email, setEmail]       = useState("");
    const [p1, setP1]             = useState("");
    const [p2, setP2]             = useState("");

    const [err, setErr]           = useState("");
    const [success, setSuccess]   = useState("");
    const [submitting, setSubmitting] = useState(false);

    const redirectTimer = useRef(null);

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);


    const rules = useMemo(() => {
        const startsUpper = /^[A-Z]/.test(p1);
        const hasDigit    = /\d/.test(p1);
        return { startsUpper, hasDigit };
    }, [p1]);

    const passwordsMatch = useMemo(() => (p1 && p2 ? p1 === p2 : false), [p1, p2]);


    useEffect(() => { if (err) setErr(""); }, [username, email, p1, p2]);
    useEffect(() => { if (success) setSuccess(""); }, [username, email, p1, p2]);

    useEffect(() => {
        return () => {
            if (redirectTimer.current) clearTimeout(redirectTimer.current);
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (submitting) return;

        const u = username.trim();
        const m = email.trim();

        if (u.length < 4)  return setErr("Username must be at least 4 symbols.");
        if (u.length > 15) return setErr("Username must be 15 symbols or less.");
        if (users.some(x => (x.username || "").toLowerCase() === u.toLowerCase()))
            return setErr("Username already exists.");

        if (!emailOk(m)) return setErr("Enter a valid email address.");
        if (users.some(x => (x.email || "").toLowerCase() === m.toLowerCase()))
            return setErr("Email already in use.");

        if (!passwordsMatch)    return setErr("Passwords do not match.");
        if (!rules.startsUpper) return setErr("Password must start with an upper-case letter.");
        if (!rules.hasDigit)    return setErr("Password must contain at least one number.");
        console.log("Users before register:", users);
        // Viskas ok tada -----
        setErr("");
        setSubmitting(true);

        // jei onRegister yra async arba rašo į local/server – tegu spėja užsibaigti
        try {
            const maybePromise = onRegister(u, m, p1);
            if (maybePromise?.then) {
                maybePromise.then(() => {
                    setSuccess("Registration successful! Redirecting to News...");
                    redirectTimer.current = setTimeout(() => {
                        window.location.href = "/news";
                    }, 2000);
                }).catch((e) => {
                    setSubmitting(false);
                    setErr(e?.message || "Registration failed. Try again.");
                });
            } else {
                setSuccess("Registration successful! Redirecting to News...");
                redirectTimer.current = setTimeout(() => {
                    window.location.href = "/news";
                }, 2000);
            }
        } catch (e) {
            setSubmitting(false);
            setErr(e?.message || "Registration failed. Try again.");
        }
    };

    // Aktyvacija , kai viskas zjb------
    const canSubmit = useMemo(() => {
        if (!username || !email || !p1 || !p2) return false;
        if (!emailOk(email)) return false;
        if (!rules.startsUpper || !rules.hasDigit) return false;
        if (!passwordsMatch) return false;
        return true;
    }, [username, email, p1, p2, rules, passwordsMatch]);

    const color = (ok) => (ok ? "#15803d" : "#b91c1c"); // green/rose

    return (
        <div className="form-container">
            <h1>Register</h1>

            <form onSubmit={submit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="reg-username">Username</label>
                    <input
                        id="reg-username"
                        className="input"
                        placeholder="username"
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        autoComplete="username"
                        required
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reg-email">Email</label>
                    <input
                        id="reg-email"
                        className="input"
                        placeholder="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        type="email"
                        autoComplete="email"
                        required
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reg-pass1">Password 1</label>
                    <input
                        id="reg-pass1"
                        className="input"
                        placeholder="password 1"
                        type="password"
                        value={p1}
                        onChange={(e)=>setP1(e.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reg-pass2">Password 2</label>
                    <input
                        id="reg-pass2"
                        className="input"
                        placeholder="password 2"
                        type="password"
                        value={p2}
                        onChange={(e)=>setP2(e.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={submitting}
                    />
                </div>

                {/* aktyvios formos  taisyklės */}
                <ul style={{ margin: "6px 0 10px 16px", fontSize: 14, listStyle: "disc" }}>
                    <li style={{ color: color(rules.startsUpper) }}>
                        Prasideda didžiąja raide
                    </li>
                    <li style={{ color: color(rules.hasDigit) }}>
                        Turi bent vieną skaičių
                    </li>
                    <li style={{ color: color(passwordsMatch) }}>
                        Abu slaptažodžiai sutampa
                    </li>
                </ul>

                {err && <p className="form-error" role="alert">{err}</p>}
                {success && (
                    <p className="form-success" role="status">
                        {success}
                    </p>
                )}

                <button
                    className="btn block"
                    type="submit"
                    disabled={!canSubmit || submitting}
                >
                    {submitting ? "Please wait..." : "REGISTER"}
                </button>
            </form>
        </div>
    );
}
