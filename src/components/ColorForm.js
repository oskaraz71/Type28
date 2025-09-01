import React, { useRef } from "react";
import { useStore } from "../store/store";

export default function ColorForm() {
    const addItem = useStore((s) => s.addItem);
    const nameRef = useRef(null);
    const colorRef = useRef(null);

    const onAdd = () => {
        const name = nameRef.current?.value?.trim();
        const color = colorRef.current?.value?.trim();
        if (!name || !color) return;
        addItem({ name, color });
        nameRef.current.value = "";
        colorRef.current.value = "#9b59b6"; // reset optional
    };

    return (
        <div className="card">
            <h3>Inputas</h3>
            <div className="row">
                <input ref={colorRef} type="color" defaultValue="#9b59b6" />
                <input ref={nameRef} type="text" placeholder="name" />
            </div>
            <button onClick={onAdd}>add</button>
        </div>
    );
}
