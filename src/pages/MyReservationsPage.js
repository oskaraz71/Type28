// pages/MyReservationsPage.jsx
import { useEffect, useState } from 'react';
import { fetchMyReservations, cancelReservation } from '../api/reservations';
import { useStore } from '../store/store';

export default function MyReservationsPage() {
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState('idle');
    const user = useStore((s) => s.user);
    const setUser = useStore((s) => s.setUser);

    useEffect(() => {
        let alive = true;
        setStatus('loading');
        fetchMyReservations()
            .then((data) => { if (alive) { setItems(data); setStatus('success'); } })
            .catch((e) => { if (alive) { setStatus('error'); } });
        return () => { alive = false; };
    }, []);

    const onCancel = async (id, priceEuro) => {
        try {
            await cancelReservation(id);
            setItems((prev) => prev.filter(p => p._id !== id));
            if (user) setUser({ ...user, balance: user.balance + priceEuro });
        } catch (e) {
            alert(e.message);
        }
    };

    if (status === 'loading') return <div>Kraunama...</div>;
    if (status === 'error') return <div>Klaida gaunant rezervacijas</div>;

    return (
        <div className="reservations">
            <h2>Mano rezervacijos</h2>
            {items.length === 0 ? (
                <p>Kol kas neturite rezervacijų.</p>
            ) : (
                <div className="grid">
                    {items.map(p => (
                        <div className="card" key={p._id}>
                            <img src={p.imgUrl} alt={p.title} />
                            <h3>{p.title}</h3>
                            <p>{p.description}</p>
                            <div>€ {p.priceEuro.toFixed(2)}</div>
                            <button onClick={() => onCancel(p._id, p.priceEuro)}>Atšaukti rezervaciją</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
