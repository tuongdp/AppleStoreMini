import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAccessToken } from "@/store/authSlice";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");
const PING_INTERVAL_MS = 30000;

export default function VisitorPresenceTracker() {
    const token = useSelector(selectAccessToken);

    useEffect(() => {
        let socket;
        let pingTimer;
        let cancelled = false;

        const connect = async () => {
            try {
                const { io } = await import("socket.io-client");
                if (cancelled) return;

                socket = io(SOCKET_URL, {
                    path: "/socket.io",
                    transports: ["websocket", "polling"],
                    reconnection: true,
                    reconnectionDelay: 5000,
                    auth: token ? { token } : undefined,
                });

                pingTimer = setInterval(() => {
                    socket?.emit("visitor:ping");
                }, PING_INTERVAL_MS);
            } catch {
                // Presence is informational only; never block the app if socket loading fails.
            }
        };

        connect();

        return () => {
            cancelled = true;
            if (pingTimer) clearInterval(pingTimer);
            socket?.disconnect();
        };
    }, [token]);

    return null;
}
