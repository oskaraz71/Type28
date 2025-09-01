// src/components/Character.js
import React from "react";

const fallbackImg =
    "https://cdn.pixabay.com/photo/2017/01/31/20/26/monster-2027740_1280.png";

const Character = ({ name, image, hp, isPlayer }) => {
    const barColor =
        hp < 25 ? "red" : hp < 50 ? "orange" : hp < 75 ? "yellow" : "mediumspringgreen";

    const handleImgError = (e) => {
        if (e.currentTarget.src !== fallbackImg) {
            e.currentTarget.src = fallbackImg;
        }
    };

    const safeHP = Math.max(0, Math.min(100, Number.isFinite(hp) ? hp : 0));

    return (
        <div className="container flex-col j-center a-center">
            <img
                src={image || fallbackImg}
                alt={name}
                onError={handleImgError}
                style={{ maxHeight: 225, borderRadius: 10, margin: 20 }}
            />
            <h5 style={{ color: isPlayer ? "#33FFFF" : "hotpink", fontSize: "1.5rem" }}>
                {name}
            </h5>

            <div className="progressWraper">
                <div
                    className="progressFill"
                    style={{ width: `${safeHP}%`, backgroundColor: barColor }}
                />
            </div>

            <p style={{ fontSize: "1.1rem", color: "#fff", marginTop: 8 }}>HP: {safeHP}</p>
        </div>
    );
};

export default Character;
