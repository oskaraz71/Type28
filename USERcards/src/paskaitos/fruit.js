import React, { useState } from "react";
import "./App.css";

const allFruits = [
    { id: "frt_a1b2", name: "Apple", emoji: "🍎" },
    { id: "frt_k9x4", name: "Banana", emoji: "🍌" },
    { id: "frt_u7n8", name: "Grapes", emoji: "🍇" },
    { id: "frt_z3q1", name: "Watermelon", emoji: "🍉" },
    { id: "frt_m6r5", name: "Pineapple", emoji: "🍍" },
    { id: "frt_t8j2", name: "Peach", emoji: "🍑" },
    { id: "frt_v4p9", name: "Cherry", emoji: "🍒" },
    { id: "frt_x1w6", name: "Strawberry", emoji: "🍓" },
    { id: "frt_y7l0", name: "Lemon", emoji: "🍋" },
    { id: "frt_n2d3", name: "Kiwi", emoji: "🥝" },
];

function App() {
    const [available, setAvailable] = useState(allFruits);
    const [selected, setSelected] = useState([]);

    const moveToSelected = (fruit) => {
        setAvailable(available.filter((f) => f.id !== fruit.id));
        setSelected([...selected, fruit]);
    };

    const removeFromSelected = (fruit) => {
        setSelected(selected.filter((f) => f.id !== fruit.id));
        setAvailable([...available, fruit]);
    };

    return (
        <div className="container">
            <div className="left-panel">
                <h2>ALL FRUITS LIST</h2>
                <div className="grid">
                    {available.map((fruit) => (
                        <div
                            key={fruit.id}
                            className="grid-item"
                            onClick={() => moveToSelected(fruit)}
                        >
                            {fruit.emoji}
                        </div>
                    ))}
                </div>
            </div>

            <div className="right-panel">
                <h2>Selected FRUITS</h2>
                <div className="selected-list">
                    {selected.map((fruit) => (
                        <div key={fruit.id} className="selected-item">
                            <span className="emoji">{fruit.emoji}</span>
                            <span className="name">{fruit.name}</span>
                            <button onClick={() => removeFromSelected(fruit)}>✕</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
