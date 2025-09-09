import { io } from "socket.io-client";

// URL nustatymas:
// - Dev režime (localhost) -> http://localhost:2500
// - Produkcijoje -> tas pats origin kaip ir puslapio (pvz., https://oskaraz.lt)
const URL =
    (import.meta && import.meta.env && import.meta.env.VITE_SOCKET_URL) ||
    (window.location.hostname === "localhost"
        ? "http://localhost:2500"
        : window.location.origin);

export const socket = io(URL, {
    autoConnect: false,             // jungsimės iš AboutPage mount'o
    transports: ["websocket", "polling"],
    withCredentials: false,
});

// Jei kada reikės token'o:
export function connectSocket(token) {
    if (token) socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
}


