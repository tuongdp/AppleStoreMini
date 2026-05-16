import { useEffect, useRef, useCallback } from "react";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useSocket(onNewNotification) {
    const socketRef = useRef(null);

    useEffect(() => {
        const initSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                const socket = io(SOCKET_URL, {
                    path: "/socket.io",
                    transports: ["websocket", "polling"],
                    reconnection: true,
                    reconnectionDelay: 5000,
                });

                socket.on("connect", () => {
                    console.log("[Socket] Connected:", socket.id);
                });

                socket.on("notification:new", (notifications) => {
                    if (onNewNotification) onNewNotification(notifications);
                });

                socket.on("disconnect", () => {
                    console.log("[Socket] Disconnected");
                });

                socketRef.current = socket;
            } catch (e) {
                console.warn("[Socket] Failed to connect:", e.message);
            }
        };

        initSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return socketRef;
}
