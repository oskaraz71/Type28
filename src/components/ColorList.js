import React from "react";
import { useStore } from "../store/store";

export default function ColorList() {
    const items = useStore((s) => s.items);
    const removeItem = useStore((s) => s.removeItem);

    return (
        <div className="card">
            <h3>Push,Upd,del</h3>
            <div className="stack">
                {items.map((it) => (
                    <div
                        key={it.id}
                        className="pill"
                        style={{ background: it.color }}
                        title={it.color}
                    >
                        <span>{it.name}</span>
                        <button className="x" onClick={() => removeItem(it.id)}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
