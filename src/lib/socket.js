import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

let instance = null;
let connectResolve = null;
let pendingConnect = null;

export function getSocket() {
    if (instance?.connected) return Promise.resolve(instance);
    if (pendingConnect) return pendingConnect;

    pendingConnect = new Promise((resolve) => {
        if (instance) {
            resolve(instance);
            return;
        }

        const socket = io(SOCKET_URL, {
            path: "/socket.io",
            transports: ["polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
        });

        socket.on("connect_error", () => {
            // silently ignore — socket is optional
        });

        socket.on("connect", () => {
            connectResolve?.();
        });

        instance = socket;
        resolve(socket);
    });

    return pendingConnect;
}

export function disconnectSocket() {
    if (instance) {
        instance.disconnect();
        instance = null;
        pendingConnect = null;
        connectResolve = null;
    }
}
