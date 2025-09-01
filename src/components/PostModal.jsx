// src/components/PostModal.jsx
import { useEffect } from "react";

export default function PostModal({ onClose, children }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                display: "grid",
                placeItems: "center",
                padding: 16,
                zIndex: 1000,
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                style={{
                    width: "min(92vw, 820px)",
                    maxHeight: "90vh",
                    overflow: "auto",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 14px 32px rgba(0,0,0,.22)",
                    padding: 16,
                }}
            >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn" onClick={onClose} aria-label="Close">Close</button>
                </div>

                <div style={{ display: "grid", gap: 10 }}>{children}</div>
            </div>
        </div>
    );
}
