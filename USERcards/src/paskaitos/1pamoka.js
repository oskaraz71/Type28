import React, { useState } from "react";

function App() {
    const [color, setColor] = useState("pink");

    return (
        <div style={styles.container}>

        <div style={{ ...styles.box, backgroundColor: color }}></div>


    <div style={styles.buttons}>
    <button style={styles.button} onClick={() => setColor("red")}>Red</button>
    <button style={styles.button} onClick={() => setColor("blue")}>Blue</button>
    <button style={styles.button} onClick={() => setColor("yellow")}>Yellow</button>
    </div>
    </div>
);
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem"
    },
    box: {
        width: "300px",
        height: "80px",
        borderRadius: "15px"
    },
    buttons: {
        display: "flex",
        gap: "2rem"
    },
    button: {
        padding: "1rem 2rem",
        borderRadius: "10px",
        border: "1px solid black",
        fontSize: "1rem",
        cursor: "pointer"
    }
};

export default App;
