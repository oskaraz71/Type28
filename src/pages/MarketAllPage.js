// src/pages/MarketAllPage.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import MarketNav from "../components/MarketNav";
import { listProducts, myReservations, reserveOne } from "../services/marketApi";
import "./MarketAllPage.css";

// Normalizacija iš API
function norm(p) {
    return {
        id: p._id,
        title: p.name,
        price: Number(p.price || 0),
        img: p.image_url || "",
        isReserved: Boolean(p.is_reserved),
        reservedBy: p.reserved_by ?? null,
        reservedUntil: p.reserved_until ?? null,
        description: p.description || "",
    };
}

// Saugus ID -> string, kad lyginimai būtų stabilūs
const sid = (v) => (v == null ? "" : String(v));

export default function MarketAllPage() {
    const { user, updateUser } = useAuth();

    // bandome visus variantus – tavo backendas skirtingose vietose gal grąžina skirtingus field'us
    const myId = sid(user?._id || user?.id || user?.userId || user?.email);
    const balance = Number(user?.balance ?? user?.money ?? 0);

    const [rows, setRows] = useState([]);                 // visi produktai (normalizuoti)
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [selected, setSelected] = useState(new Set());  // laikom **String(id)**
    const [myResCount, setMyResCount] = useState(0);

    // Užkrova (su refetch helperiu)
    const loadAll = useCallback(async () => {
        setLoading(true); setErr("");
        try {
            const { products } = await listProducts({ page: 1, limit: 20 });
            const mapped = (Array.isArray(products) ? products : []).map(norm);
            setRows(mapped);

            // po refetch'o išvalom "selected" nuo neegzistuojančių id
            setSelected(prev => {
                const next = new Set();
                const ids = new Set(mapped.map(x => sid(x.id)));
                for (const id of prev) if (ids.has(id)) next.add(id);
                return next;
            });

            // subnaviui – mano rezervacijų skaičius (jei endpointas yra)
            try {
                const r = await myReservations();
                const arr = Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : (r?.reservations || []));
                setMyResCount(arr.length);
            } catch {
                // jei 404 – tiesiog praleidžiam
            }
        } catch (e) {
            setErr(e.message || "Load failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    // Pažymėtų suma (Money)
    const money = useMemo(() => {
        if (!rows.length || selected.size === 0) return 0;
        const map = new Map(rows.map(r => [sid(r.id), Number(r.price || 0)]));
        let sum = 0;
        for (const id of selected) sum += Number(map.get(id) || 0);
        return sum;
    }, [selected, rows]);

    const notEnoughForBulk = money > balance;

    // pažymėjimų keitimas – visada su String(id)
    function toggle(id) {
        const key = sid(id);
        setSelected(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

    // Vienetinė rezervacija
    async function onReserveOne(p) {
        setErr("");
        if (!user)         return setErr("Please login to reserve.");
        if (p.isReserved)  return setErr("Product already reserved.");
        if (p.price > balance) {
            return setErr(`Insufficient funds. Need €${p.price.toFixed(2)}, you have €${balance.toFixed(2)}.`);
        }

        try {
            const until = new Date(Date.now() + 24*3600*1000).toISOString(); // +24h
            await reserveOne({ productId: p.id, reservedUntil: until });

            // po sėkmės – refetch iš serverio, kad 100% matytųsi is_reserved/reserved_by
            await loadAll();

            // sumažinam balansą lokaliai (kad Toolbar iškart atsinaujintų)
            const newBalance = balance - Number(p.price || 0);
            if (typeof updateUser === "function") {
                await updateUser({ balance: newBalance, money: newBalance });
            }

            // panaikinam iš pažymėtų, jei buvo
            setSelected(prev => {
                const next = new Set(prev);
                next.delete(sid(p.id));
                return next;
            });
        } catch (e) {
            setErr(e.message || "Reserve failed");
        }
    }

    // Bulk rezervacija
    async function onReserveSelected() {
        if (!user) return setErr("Please login to reserve.");
        if (selected.size === 0) return;
        if (notEnoughForBulk) {
            return setErr(`Insufficient funds for selected items. Selected €${money.toFixed(2)} > balance €${balance.toFixed(2)}.`);
        }

        setErr("");
        try {
            const until = new Date(Date.now() + 24*3600*1000).toISOString();
            let spent = 0;

            // po vieną – saugiau ir tvarkingiau
            for (const idStr of Array.from(selected)) {
                const p = rows.find(x => sid(x.id) === idStr);
                if (!p || p.isReserved) continue;
                if (spent + p.price > balance) throw new Error("Insufficient funds during bulk reservation.");
                await reserveOne({ productId: p.id, reservedUntil: until });
                spent += Number(p.price || 0);
            }

            // refetch – kad atsinaujintų is_reserved/reserved_by
            await loadAll();

            // išvalom pažymėjimus ir sumažinam balansą lokaliai
            setSelected(new Set());
            const newBalance = balance - spent;
            if (typeof updateUser === "function") {
                await updateUser({ balance: newBalance, money: newBalance });
            }
        } catch (e) {
            setErr(e.message || "Bulk reserve failed");
        }
    }

    return (
        <main className="market">
            <MarketNav money={money} reservationsCount={myResCount} balance={balance} />

            <h1>All products</h1>
            {err && <p className="error">Error: {err}</p>}

            {loading ? (
                <p>Loading…</p>
            ) : (
                <>
                    {/* virš grido – pasirinkimų suvestinė ir bulk veiksmas */}
                    <div className="bulkbar" title={notEnoughForBulk ? "Selected exceeds your balance" : ""}>
                        <div>Selected: {selected.size} • Money: €{money.toFixed(2)}</div>
                        <div className="bulk-actions">
                            <button
                                className="btn"
                                disabled={!user || selected.size === 0 || notEnoughForBulk}
                                onClick={onReserveSelected}
                            >
                                {notEnoughForBulk ? "Insufficient funds" : "Reserve selected"}
                            </button>
                        </div>
                    </div>

                    <div className="prod-grid">
                        {rows.map((p) => {
                            const isMine = p.isReserved && sid(p.reservedBy) && myId && sid(p.reservedBy) === myId;
                            const isTakenByOther = p.isReserved && !isMine;
                            const selectable = !p.isReserved; // checkbox tik laisvoms
                            const checked = selected.has(sid(p.id));
                            const singleNotEnough = p.price > balance;

                            // klasės šešėliams
                            const cls =
                                "prod-card card " +
                                (isMine ? "prod--reserved-me" : p.isReserved ? "prod--reserved" : "prod--free");

                            return (
                                <div key={sid(p.id)} className={cls}>
                                    <div className="prod-thumb">
                                        {p.img ? (
                                            <img src={p.img} alt={p.title} />
                                        ) : (
                                            <div className="prod-placeholder">IMG</div>
                                        )}

                                        {/* status indikatoriaus taškas */}
                                        <div
                                            className="status-dot"
                                            style={{
                                                background: isTakenByOther ? "#fca5a5" : isMine ? "#86efac" : "#e5e7eb",
                                            }}
                                        />

                                        {/* checkbox tik laisvoms */}
                                        {selectable && (
                                            <label className="select-dot" title="Select for bulk reserve">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggle(p.id)}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div className="prod-info">
                                        <div className="prod-title" title={p.title}>
                                            {p.title}
                                        </div>
                                        <div className="prod-meta">€{p.price.toFixed(2)}</div>
                                        <p className="prod-desc">{p.description}</p>
                                    </div>

                                    <div className="prod-actions">
                                        <button
                                            className="btn"
                                            disabled={!user || isTakenByOther || singleNotEnough}
                                            onClick={() => onReserveOne(p)}
                                            title={
                                                !user
                                                    ? "Login to reserve"
                                                    : isTakenByOther
                                                        ? "Already reserved"
                                                        : singleNotEnough
                                                            ? `Insufficient funds: need €${p.price.toFixed(2)}`
                                                            : "Reserve"
                                            }
                                        >
                                            {isTakenByOther
                                                ? "Reserved"
                                                : isMine
                                                    ? "Reserved (you)"
                                                    : singleNotEnough
                                                        ? "Not enough €"
                                                        : "Reserve"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </main>
    );
}
