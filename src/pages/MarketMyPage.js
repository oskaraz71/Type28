import { useEffect, useMemo, useState } from "react";
import MarketNav from "../components/MarketNav";
import { myReservations, cancelReservation } from "../services/marketApi";

export default function MarketMyPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true); setErr("");
            try {
                const r = await myReservations();
                const arr = Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : (r?.reservations || []));
                setRows(arr);
            } catch (e) { setErr(e.message || "Load failed"); }
            finally { setLoading(false); }
        })();
    }, []);

    const total = useMemo(() => {
        return rows.reduce((s, r) => s + Number(r.product?.price ?? r.price ?? 0), 0);
    }, [rows]);

    async function onCancel(id) {
        if (!window.confirm("Cancel this reservation?")) return;
        try {
            await cancelReservation(id);
            setRows(prev => prev.filter(x => (x.id || x._id) !== id));
        } catch (e) { alert(e.message || "Cancel failed"); }
    }

    return (
        <main className="market">
            <MarketNav money={0} reservationsCount={rows.length} />
            <h1>My reserved products</h1>
            {err && <p className="error">Error: {err}</p>}
            {loading ? <p>Loading…</p> : rows.length === 0 ? (
                <p className="muted">No reservations yet.</p>
            ) : (
                <>
                    <div className="res-list">
                        {rows.map((r) => {
                            const id = r.id || r._id || "";
                            const p = r.product || {};
                            return (
                                <div key={id} className="res-item card">
                                    <div className="res-left">
                                        <div className="thumb">
                                            {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="prod-placeholder">IMG</div>}
                                        </div>
                                        <div className="info">
                                            <div className="title">{p.name || r.title}</div>
                                            <div className="meta">€{Number(p.price ?? r.price ?? 0).toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div className="res-right">
                                        <button className="btn btn--ghost" onClick={()=>onCancel(id)}>Cancel reservation</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="total-box card">Total amount of reservations: €{total.toFixed(2)}</div>
                </>
            )}
        </main>
    );
}
