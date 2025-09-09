// Type28/reaktyvas/src/components/ReserveButton.js
import React, { useState } from "react";
import { reserveProduct } from "../services/reservationsApi";
import { useAuth } from "../auth/AuthProvider";

export default function ReserveButton({ product, onReserved }) {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Palaikome abu formatus: backend (Mongo) ir FakeStore
    const pid        = product?._id || product?.id; // _id – Mongo, id – FakeStore
    const price      = Number(product?.priceEuro ?? product?.price ?? 0);
    const reservedBy = product?.reservedBy || null;
    // owner gali būti string (id) arba objektas
    const ownerId    = typeof product?.owner === "object" ? product?.owner?._id : product?.owner;

    const hasUser    = !!user;
    const isOwner    = hasUser && ownerId && String(ownerId) === String(user.id || user._id);
    const isReserved = !!reservedBy;
    const notEnough  = hasUser && price > Number(user?.balance ?? 0);

    const disabled =
        !hasUser || !pid || isOwner || isReserved || notEnough || loading;

    async function onClick(e) {
        e.stopPropagation(); // jeigu mygtukas kortelėje su Link
        e.preventDefault();  // kad neperšoktų į product page, kai spaudi mygtuką

        try {
            setLoading(true);
            const res = await reserveProduct(pid);
            if (typeof res?.newBalance === "number") {
                setUser?.({ ...(user || {}), balance: res.newBalance });
            }
            onReserved?.(pid); // tėvui – refetch arba lokaliai atnaujinti
            alert("Rezervacija sėkminga.");
        } catch (err) {
            alert(String(err.message || err));
        } finally {
            setLoading(false);
        }
    }

    // Jeigu tai FakeStore produktas (neturi _id/owner), rezervaciją draudžiam:
    if (!product?._id) {
        return (
            <button disabled title="Šis produktas iš išorinio API – rezervacija vykdoma tik serverio produktams.">
                Reserve (disabled)
            </button>
        );
    }

    return (
        <button disabled={disabled} onClick={onClick}>
            {!hasUser ? "Login to reserve"
                : isOwner ? "Your product"
                    : isReserved ? "Reserved"
                        : notEnough ? "Not enough €"
                            : loading ? "Reserving..."
                                : "Reserve"}
        </button>
    );
}
