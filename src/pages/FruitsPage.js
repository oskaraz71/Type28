import React from "react";
import FruitSummary from "../components/FruitSummary";
import FruitControls from "../components/FruitControls";

export default function FruitsPage() {
    return (
        <div className="page">
            <h1>Vaisiai</h1>

            {/* comp1 */}
            <FruitSummary />

            <div className="cards">
                {/* comp2 / comp3 / comp4 */}
                <FruitControls fruit="apples" />
                <FruitControls fruit="bananas" />
                <FruitControls fruit="oranges" />
            </div>
        </div>
    );
}
