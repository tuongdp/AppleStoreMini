import { useEffect, useRef } from "react";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export function useOrderSocket(orderId, onStatusUpdate) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        let socket;
        let cancelled = false;

        const initSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                if (cancelled) return;
                socket = io(SOCKET_URL, { path: "/socket.io", transports: ["websocket", "polling"] });
                socket.on("orderStatusUpdate", (data) => {
                    if (data.orderId === orderId) onStatusUpdate?.(data);
                });
                socketRef.current = socket;
            } catch {
                // Socket is optional for order detail; polling/API data remains the source of truth.
            }
        };

        initSocket();

        return () => {
            cancelled = true;
            if (socket) {
                socket.off("orderStatusUpdate");
                socket.disconnect();
            }
        };
    }, [orderId, onStatusUpdate]);

    return socketRef;
}
