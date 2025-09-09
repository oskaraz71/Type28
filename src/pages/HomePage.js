// src/pages/HomePage.js
import { useEffect, useState, useCallback } from "react";
import { socket, connectSocket } from "../socket";
import { useAuth } from "../auth/AuthProvider";

const COLS = 10;
const SIZE = 100;
const CELL_PX = 48;

export default function HomePage() {
    const { user } = useAuth();
    const username =
        (user?.username && String(user.username).trim()) ||
        (user?.name && String(user.name).trim()) ||
        (user?.email && String(user.email).split("@")[0]) ||
        null;
    const userId = user?._id || user?.id || null;

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [board, setBoard] = useState(Array.from({ length: SIZE }, () => ({ color: "", hp: 0 })));
    const [picker, setPicker] = useState("#8fd3a8");
    const [myColor, setMyColor] = useState("");
    const [hovered, setHovered] = useState(-1);

    const isReady = Boolean(user && username && isConnected);
    const canPlay = Boolean(isReady && myColor);

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
            if (username) socket.emit("chat:join", { userId, username });
        };
        const onDisconnect = () => setIsConnected(false);

        const onBoardState = (arr) => {
            if (Array.isArray(arr) && arr.length === SIZE) setBoard(arr);
        };
        const onMe = (payload) => setMyColor(payload?.color || "");

        const onGameOver = () => {
            console.log("[BOARD] gameover");
        };
        const onReset = () => {
            setMyColor("");
            setBoard(Array.from({ length: SIZE }, () => ({ color: "", hp: 0 })));
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("board:state", onBoardState);
        socket.on("player:me", onMe);
        socket.on("board:gameover", onGameOver);
        socket.on("board:reset", onReset);

        if (!socket.connected) connectSocket();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("board:state", onBoardState);
            socket.off("player:me", onMe);
            socket.off("board:gameover", onGameOver);
            socket.off("board:reset", onReset);
        };
    }, [username, userId]);

    const lockColor = useCallback(() => {
        if (!isReady) return;
        if (!picker || !/^#?[0-9a-fA-F]{3,8}$/.test(picker)) return;
        const hex = picker.startsWith("#") ? picker : "#" + picker;
        socket.emit("player:setColor", { color: hex });
    }, [picker, isReady]);

    const clickCell = useCallback((index) => {
        if (!canPlay) return;
        const cell = board[index];
        if (!cell) return;

        if (!cell.color || cell.hp <= 0) {
            socket.emit("board:claim", { index });
        } else if (cell.color !== myColor) {
            socket.emit("board:attack", { index });
        }
    }, [board, canPlay, myColor]);

    const handleKey = (e, index) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            clickCell(index);
        }
    };

    const layout = {
        display: "grid",
        gridTemplateColumns: myColor ? "1fr 2fr" : "1fr",
        gap: 20,
        alignItems: "start",
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, ${CELL_PX}px)`,
        gap: 10,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: "#fff",
    };

    const cellStyle = (cell, isHovered) => ({
        width: CELL_PX,
        height: CELL_PX,
        borderRadius: 10,
        border: `1px solid ${cell.color ? "#bfc4ca" : "#d6d8dc"}`,
        backgroundColor: cell.color || "#f5f7fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 600,
        color: cell.color ? "#111" : "#666",
        cursor: canPlay ? "pointer" : "not-allowed",
        userSelect: "none",
        outline: "none",
        backgroundImage: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        boxShadow: isHovered
            ? "0 8px 18px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)"
            : "0 1px 3px rgba(0,0,0,0.08)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition:
            "transform 120ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease",
    });

    return (
        <main className="page" style={layout}>
            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fafafa",
                }}
            >
                <h2 style={{ marginTop: 0 }}>Žaidėjas</h2>

                <div style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
                    Status: <strong>{isConnected ? "connected" : "disconnected"}</strong>
                    <br />
                    {user && username ? (
                        <>Prisijungęs kaip: <strong>{username}</strong></>
                    ) : (
                        <>Prisijunkite, kad dalyvautumėte žaidime</>
                    )}
                </div>

                {!myColor ? (
                    <>
                        <div style={{ display: "grid", gap: 10, width: 220, marginBottom: 8 }}>
                            <input
                                type="color"
                                value={picker}
                                onChange={(e) => setPicker(e.target.value)}
                                aria-label="Pasirinkite spalvą"
                                style={{ width: "100%", height: 44, borderRadius: 8, border: "1px solid #ccc" }}
                                disabled={!isReady}
                            />
                            <input
                                type="text"
                                value={picker}
                                onChange={(e) => setPicker(e.target.value)}
                                placeholder="#RRGGBB"
                                style={{ height: 36, borderRadius: 8, border: "1px solid #ccc", padding: "0 10px" }}
                                disabled={!isReady}
                            />
                        </div>
                        <button className="btn" onClick={lockColor} disabled={!isReady}>
                            Set color
                        </button>
                        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                            Spalvą galima pasirinkti tik vieną kartą. Gridas atsiras po pasirinkimo.
                        </p>
                    </>
                ) : (
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: 10,
                            background: "#fff",
                        }}
                    >
            <span
                style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "1px solid #bbb",
                    background: myColor,
                }}
                aria-label="Jūsų spalva"
            />
                        <span style={{ fontSize: 14 }}>Jūsų spalva užrakinta</span>
                    </div>
                )}
            </section>

            {myColor && (
                <section>
                    <h2 style={{ marginTop: 0 }}>Live Board</h2>
                    <div style={gridStyle}>
                        {board.map((cell, i) => (
                            <div
                                key={i}
                                role="button"
                                tabIndex={0}
                                onClick={() => clickCell(i)}
                                onKeyDown={(e) => handleKey(e, i)}
                                style={cellStyle(cell, hovered === i)}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(-1)}
                                onFocus={() => setHovered(i)}
                                onBlur={() => setHovered(-1)}
                                title={cell.color ? `HP: ${cell.hp}` : "Tuščias"}
                                aria-label={cell.color ? `Langelis, HP ${cell.hp}` : "Tuščias langelis"}
                            >
                                {cell.hp > 0 ? cell.hp : ""}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
