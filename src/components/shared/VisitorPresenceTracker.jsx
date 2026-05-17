import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken } from "@/store/authSlice";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");
const PING_INTERVAL_MS = 30000;
const VISITOR_ID_KEY = "asm_visitor_id";

const getVisitorId = () => {
    try {
        const existing = localStorage.getItem(VISITOR_ID_KEY);
        if (existing) return existing;

        const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(VISITOR_ID_KEY, id);
        return id;
    } catch {
        return null;
    }
};

export default function VisitorPresenceTracker() {
    const token = useSelector(selectAccessToken);
    let location;
    try {
        location = useLocation();
    } catch (e) {
        return null;
    }
    const socketRef = useRef(null);
    const pathRef = useRef("/");

    useEffect(() => {
        let socket;
        let pingTimer;
        let cancelled = false;

        const connect = async () => {
            try {
                const { io } = await import("socket.io-client");
                if (cancelled) return;
                const visitorId = getVisitorId();

                socket = io(SOCKET_URL, {
                    path: "/socket.io",
                    transports: ["websocket", "polling"],
                    reconnection: true,
                    reconnectionDelay: 5000,
                    auth: token ? { token } : undefined,
                    query: {
                        presence: "visitor",
                        ...(visitorId ? { visitorId } : {}),
                    },
                });
                socketRef.current = socket;
                socket.on("connect", () => {
                    socket.emit("visitor:page", { path: pathRef.current });
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
            if (socketRef.current === socket) socketRef.current = null;
            socket?.disconnect();
        };
    }, [token]);

    useEffect(() => {
        const path = `${location.pathname}${location.search || ""}`;
        pathRef.current = path;
        socketRef.current?.emit("visitor:page", { path });
    }, [location.pathname, location.search]);

    return null;
}
