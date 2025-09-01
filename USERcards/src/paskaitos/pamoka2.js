import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
    const cookie1 =
        "https://images.cdn.us-central1.gcp.commercetools.com/4e5a974e-1287-4368-811f-41d06eb6c548/Chocolate%20Chip%20Silo%20-t71xMOs7.png";
    const cookie2 =
        "https://www.breadsmith.com/wp-content/uploads/2023/12/Chocolate-White-Chocolate-Chip-Cookie.png";

    const [count, setCount] = useState(0);
    const [power, setPower] = useState(1);
    const [bgColor, setBgColor] = useState("#ffffff");
    const [cookieImg, setCookieImg] = useState(cookie1);
    const [isSpinning, setIsSpinning] = useState(false);
    const [autoClickActive, setAutoClickActive] = useState(false);

    useEffect(() => {
        let interval;
        if (autoClickActive) {
            interval = setInterval(() => {
                setCount(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [autoClickActive]);

    const tryPurchase = (price, action) => {
        if (count >= price) {
            setCount(prev => prev - price);
            action();
        }
    };

    const changeBgColor = () => {
        const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        setBgColor(randomColor);
    };

    const toggleCookieImage = () => {
        setCookieImg(prev => (prev === cookie1 ? cookie2 : cookie1));
    };

    const toggleSpin = () => {
        setIsSpinning(prev => !prev);
    };

    const activateAutoClick = () => {
        setAutoClickActive(true);
    };

    return (
        <div className="app" style={{ backgroundColor: bgColor }}>
            <div className="left">
                <img
                    src={cookieImg}
                    alt="cookie"
                    className={`cookie-img ${isSpinning ? "spin" : ""}`}
                    onClick={() => setCount(count + power)}
                />
                <div className="counter">€: {count}</div>
            </div>

            <div className="right">
                <button onClick={() => tryPurchase(5, () => setPower(2))}>
                    2 points per click (5€)
                </button>
                <button onClick={() => tryPurchase(10, () => setPower(3))}>
                    3 points per click (10€)
                </button>
                <button onClick={() => tryPurchase(15, changeBgColor)}>
                    change bg color (15€)
                </button>
                <button onClick={() => tryPurchase(20, toggleCookieImage)}>
                    change cookie img (20€)
                </button>
                <button onClick={() => tryPurchase(30, toggleSpin)}>
                    make cookie spin (30€)
                </button>
                <button onClick={() => tryPurchase(50, activateAutoClick)}>
                    start autoclick (50€)
                </button>
            </div>
        </div>
    );
}

export default App;
