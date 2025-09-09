// src/pages/AboutPage.js
import { useEffect, useState, useCallback, useRef } from "react";
import { socket, connectSocket } from "../socket";
import { useAuth } from "../auth/AuthProvider";

export default function AboutPage() {
    const { user } = useAuth();
    const username =
        (typeof user?.username === "string" && user.username.trim()) ||
        (typeof user?.name === "string" && user.name.trim()) ||
        (typeof user?.email === "string" && user.email.split("@")[0]) ||
        null;
    const userId = user?._id || user?.id || null;

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [sid, setSid] = useState(socket.id);
    const [serverTime, setServerTime] = useState(null);
    const [fooEvents, setFooEvents] = useState([]);
    const [lastPong, setLastPong] = useState(null);
    const [fooInput, setFooInput] = useState("");

    // PUBLIC CHAT
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const chatEndRef = useRef(null);

    // USERS + PRIVATE CHAT
    const [users, setUsers] = useState([]); // [{socket_id, userId, username}]
    const [selectedUser, setSelectedUser] = useState(null);
    const [pmInput, setPmInput] = useState("");
    const [pmLog, setPmLog] = useState([]);
    const pmEndRef = useRef(null);

    // kad “join/register” siųstume tik kartą per prisijungimą
    const joinedOnceRef = useRef(false);
    const lastSidRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        pmEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [pmLog]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setSid(socket.id);
            lastSidRef.current = socket.id;

            if (username && !joinedOnceRef.current) {
                socket.emit("chat:join", { userId, username });
                socket.emit("registerUser", { username, userId });
                joinedOnceRef.current = true;
            }
        }
        function onDisconnect() {
            setIsConnected(false);
            setSid(null);
            joinedOnceRef.current = false; // kad po kito connect vėl prisiregistruotume
        }

        // misc
        function onFoo(value) {
            setFooEvents((prev) => [{ value, at: Date.now() }, ...prev].slice(0, 50));
        }
        function onPong(data) {
            setLastPong(data.now);
        }
        function onServerTime(data) {
            setServerTime(data.now);
        }

        // PUBLIC CHAT
        function onChatHistory(hist) {
            setMessages(hist || []);
        }
        function onChatMessage(msg) {
            setMessages((prev) => [...prev, msg]);
        }
        function onChatSystem(evt) {
            const text = evt.type === "join"
                ? `${evt.username} prisijungė prie chat'o`
                : "sistemos įvykis";
            setMessages((prev) => [
                ...prev,
                { id: "sys:" + evt.ts, userId: "system", username: "system", text, ts: evt.ts },
            ]);
        }

        // USERS + PM
        function onUsersList(list) {
            setUsers(Array.isArray(list) ? list : []);
        }
        function onPrivateMessage(msg) {
            const peerSid = msg.from.socket_id === socket.id ? msg.to.socket_id : msg.from.socket_id;
            if (!selectedUser || selectedUser.socket_id !== peerSid) {
                const found = (Array.isArray(users) ? users : []).find((u) => u.socket_id === peerSid);
                const peer = found || {
                    socket_id: peerSid,
                    userId: msg.from.socket_id === socket.id ? null : msg.from.userId,
                    username: msg.from.socket_id === socket.id ? "(recipient)" : (msg.from.username || "User"),
                };
                setSelectedUser(peer);
                setPmLog([msg]);
            } else {
                setPmLog((prev) => [...prev, msg]);
            }
        }

        // Listeners
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("foo", onFoo);
        socket.on("pong", onPong);
        socket.on("server:time", onServerTime);

        socket.on("chat:history", onChatHistory);
        socket.on("chat:message", onChatMessage);
        socket.on("chat:system", onChatSystem);

        socket.on("usersList", onUsersList);
        socket.on("chat:private:message", onPrivateMessage);

        // start connect once
        if (!socket.connected) {
            connectSocket();
        } else {
            onConnect(); // jei jau prijungta (pvz. iš kito puslapio)
        }

        return () => {
            // 👉 TIK nuimam listenerius – NEBEKVIEČIAM socket.disconnect()
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("foo", onFoo);
            socket.off("pong", onPong);
            socket.off("server:time", onServerTime);

            socket.off("chat:history", onChatHistory);
            socket.off("chat:message", onChatMessage);
            socket.off("chat:system", onChatSystem);

            socket.off("usersList", onUsersList);
            socket.off("chat:private:message", onPrivateMessage);
        };
    }, [username, userId]); // <-- tik nuo user tapatybės

    const sendFoo = useCallback(() => {
        const value = (fooInput || "").trim() || `foo-${Date.now()}`;
        socket.emit("foo", value);
        setFooInput("");
    }, [fooInput]);

    const sendPing = useCallback(() => {
        socket.emit("ping", { at: Date.now() });
    }, []);

    // Public chat send
    const sendChat = useCallback(() => {
        if (!user || !isConnected || !username) return;
        const text = chatInput.trim();
        if (!text) return;
        socket.emit("chat:message", text);
        setChatInput("");
    }, [chatInput, isConnected, user, username]);

    const onChatKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendChat();
        }
    };

    // Private chat send
    const sendPrivate = useCallback(() => {
        if (!user || !isConnected || !username || !selectedUser) return;
        const text = pmInput.trim();
        if (!text) return;
        socket.emit("chat:private:send", {
            toSocketId: selectedUser.socket_id,
            text,
        });
        setPmInput("");
    }, [pmInput, isConnected, user, username, selectedUser]);

    const onPmKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrivate();
        }
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "3fr 1fr",
        gap: 16,
        alignItems: "start",
    };
    const panel = { border: "1px solid #ccc", borderRadius: 8, background: "#fafafa" };
    const userItem = (active) => ({
        padding: "8px 10px",
        borderRadius: 8,
        border: active ? "1px solid #2bb673" : "1px solid #ddd",
        background: active ? "#eafff3" : "#fff",
        cursor: "pointer",
    });

    return (
        <main className="page" style={gridStyle}>
            <section>
                <h1>Live Chat</h1>
                {user && username && (
                    <p style={{ marginTop: -6, marginBottom: 8, color: "#555" }}>
                        Prisijungęs kaip: <strong>{username}</strong>
                    </p>
                )}

                {!user || !username ? (
                    <p>Prisijunkite, kad matytumėte ir rašytumėte į chat.</p>
                ) : (
                    <>
                        <div style={{ ...panel, height: 350, padding: 12, overflowY: "auto" }}>
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #ddd",
                                        borderRadius: 10,
                                        padding: 10,
                                        marginBottom: 10,
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <strong style={{ color: "#222" }}>{m.username}</strong>
                                        <span style={{ fontSize: 12, color: "#666" }}>{new Date(m.ts).toLocaleTimeString()}</span>
                                    </div>
                                    <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={onChatKey}
                                placeholder="Rašykite žinutę…"
                                style={{ flex: 1 }}
                                disabled={!isConnected || !username}
                            />
                            <button className="btn" onClick={sendChat} disabled={!isConnected || !username}>
                                Siųsti
                            </button>
                        </div>

                        <h2 style={{ marginTop: 18 }}>
                            {selectedUser ? `Private chat with: ${selectedUser.username}` : "Private chat"}
                        </h2>

                        <div style={{ ...panel, height: 350, padding: 12, overflowY: "auto" }}>
                            {pmLog.length === 0 && (
                                <div style={{ color: "#777" }}>
                                    {selectedUser ? "Nėra žinučių – parašykite pirmas." : "Pasirinkite vartotoją iš dešinės."}
                                </div>
                            )}
                            {pmLog.map((m) => {
                                const isMine = m.from?.socket_id === socket.id;
                                return (
                                    <div
                                        key={m.id}
                                        style={{
                                            background: isMine ? "#e9f9f1" : "#fff",
                                            border: "1px solid #ddd",
                                            borderRadius: 10,
                                            padding: 10,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <strong style={{ color: "#222" }}>{m.from?.username || "User"}</strong>
                                            <span style={{ fontSize: 12, color: "#666" }}>{new Date(m.ts).toLocaleTimeString()}</span>
                                        </div>
                                        <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                                    </div>
                                );
                            })}
                            <div ref={pmEndRef} />
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <input
                                type="text"
                                value={pmInput}
                                onChange={(e) => setPmInput(e.target.value)}
                                onKeyDown={onPmKey}
                                placeholder={selectedUser ? `Žinutė ${selectedUser.username}…` : "Pirma pasirinkite vartotoją"}
                                style={{ flex: 1 }}
                                disabled={!isConnected || !username || !selectedUser}
                            />
                            <button className="btn" onClick={sendPrivate} disabled={!isConnected || !username || !selectedUser}>
                                Siųsti
                            </button>
                        </div>
                    </>
                )}
            </section>

            <aside>
                <h2>Connected users</h2>
                <div style={{ ...panel, padding: 12, marginBottom: 12 }}>
                    {users.length === 0 && <div style={{ color: "#777" }}>Nėra prisijungusių</div>}
                    <div style={{ display: "grid", gap: 8 }}>
                        {users.map((u) => (
                            <div
                                key={u.socket_id}
                                style={userItem(selectedUser?.socket_id === u.socket_id)}
                                onClick={() => {
                                    setSelectedUser(u);
                                    setPmLog([]);
                                }}
                                title={`Pradėti PM su ${u.username}`}
                            >
                                {u.username}
                            </div>
                        ))}
                    </div>
                </div>

                <h2>About Connect</h2>
                <section>
                    <p>Status: <strong>{isConnected ? "connected" : "disconnected"}</strong></p>
                    <p>Socket ID: {sid || "—"}</p>
                    <p>Server time: {serverTime ? new Date(serverTime).toLocaleTimeString() : "—"}</p>
                    <p>Last pong: {lastPong ? new Date(lastPong).toLocaleTimeString() : "—"}</p>

                    <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                        <button className="btn" onClick={() => connectSocket()} disabled={isConnected}>Connect</button>
                        <button className="btn" onClick={() => socket.disconnect()} disabled={!isConnected}>Disconnect</button>
                        <button className="btn" onClick={sendPing} disabled={!isConnected}>Send ping</button>
                    </div>
                </section>

                <hr />

                <section>
                    <h2>Žinutė serveriui</h2>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input value={fooInput} onChange={(e) => setFooInput(e.target.value)} placeholder="Žinutė 'WhatsUp !' serveriui" />
                        <button className="btn" onClick={sendFoo} disabled={!isConnected}>Siųsti</button>
                    </div>

                    <ul>
                        {fooEvents.map((e, i) => (
                            <li key={i}>{new Date(e.at).toLocaleTimeString()} — {String(e.value)}</li>
                        ))}
                    </ul>
                </section>
            </aside>
        </main>
    );
}
