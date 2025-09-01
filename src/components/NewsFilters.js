import { useState } from "react";
import { useNewsStore } from "../store/newsStore";

export default function NewsFilters({ onFilter }) {
    const { favorites } = useNewsStore();
    const [mode, setMode] = useState("all");

    const handle = (val) => {
        setMode(val);
        onFilter(val);
    };

    return (
        <div className="filters">
            <button
                className={mode === "all" ? "active" : ""}
                onClick={() => handle("all")}
            >
                All
            </button>
            <button
                className={mode === "fav" ? "active" : ""}
                onClick={() => handle("fav")}
            >
                Favorites ({favorites.length})
            </button>
        </div>
    );
}
