// src/pages/MarketCreatePage.js
import { useMemo, useState } from "react";
import MarketNav from "../components/MarketNav";
import { createProduct } from "../services/marketApi";

export default function MarketCreatePage() {
    const [name, setName] = useState("");
    const [image_url, setImage] = useState("");
    const [description, setDescription] = useState("");   // 👈 naujas laukas
    const [price, setPrice] = useState("");
    const [msg, setMsg] = useState("");

    const priceNum = useMemo(() => Number(price), [price]);
    const canSubmit =
        name.trim().length > 0 &&
        description.trim().length > 0 &&
        image_url.trim().length > 0 &&
        Number.isFinite(priceNum) &&
        priceNum >= 0;

    async function submit(e) {
        e.preventDefault();
        setMsg("");
        if (!canSubmit) {
            setMsg("Fill in all fields correctly (name, description, image URL, price ≥ 0).");
            return;
        }
        try {
            await createProduct({
                name: name.trim(),
                description: description.trim(),   // 👈 siunčiam
                image_url: image_url.trim(),
                price: priceNum,
            });
            setName(""); setDescription(""); setImage(""); setPrice("");
            setMsg("Product created.");
        } catch (e2) {
            setMsg(e2.message || "Create failed");
        }
    }

    return (
        <main className="market">
            <MarketNav money={0} reservationsCount={0} />
            <h1>Create product</h1>

            <form className="create-form card" onSubmit={submit}>
                <label>Title
                    <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Title" />
                </label>

                <label>Image URL
                    <input value={image_url} onChange={(e)=>setImage(e.target.value)} placeholder="https://…" />
                </label>

                <label>Description
                    <textarea rows={4} value={description} onChange={(e)=>setDescription(e.target.value)}
                              placeholder="Short product description..." />
                </label>

                <label>Price
                    <input type="number" step="0.01" value={price}
                           onChange={(e)=>setPrice(e.target.value)} placeholder="0.00" />
                </label>

                <button className="btn" disabled={!canSubmit}>Create product</button>
                {msg && <p className={/created/i.test(msg) ? "ok" : "error"}>{msg}</p>}
                {!canSubmit && (
                    <p className="muted">required: <code>name, description, image_url, price(>=0)</code></p>
                )}
            </form>
        </main>
    );
}
