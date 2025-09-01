import { useRef } from "react";
import { useStore } from "../store/store";

// raktų žemėlapis, kad selector‘iai būtų tip-top
const map = {
    apples: { inc: "incApple", set: "setApple", label: "+1 abalys", setLabel: "kiek abaliukų" },
    bananas: { inc: "incBanana", set: "setBanana", label: "+1 bananas", setLabel: "kiek bananų" },
    oranges: { inc: "incOrange", set: "setOrange", label: "+1 lepesinas", setLabel: "Lepesinų kiekis" },
};

export default function FruitControls({ fruit }) {
    const cfg = map[fruit];
    const value = useStore((s) => s[fruit]);
    const inc = useStore((s) => s[cfg.inc]);
    const setVal = useStore((s) => s[cfg.set]);
    const inputRef = useRef(null);

    return (
        <div className="fruit-card">
            <button className="big-btn" onClick={inc}>{cfg.label}</button>

            <div className="set-row">
                <input ref={inputRef} type="number" placeholder={String(value)} />
                <button onClick={() => setVal(inputRef.current?.value)}>pasirinkite kiekį</button>
            </div>

            <p className="muted">{cfg.setLabel}</p>
        </div>
    );
}
