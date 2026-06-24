import { useEffect, useRef } from "react";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export function useOrderSocket(orderId, onStatusUpdate) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        let socket;
        let cancelled = false;

        const init = async () => {
            try {
                const { io } = await import("socket.io-client");
                if (cancelled) return;
                socket = io(SOCKET_URL, {
                    path: "/socket.io",
                    transports: ["polling"],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 3000,
                });
                socketRef.current = socket;

                socket.on("connect_error", () => {});

                socket.on("orderStatusUpdate", (data) => {
                    if (data.orderId === orderId || data.orderCode === orderId) {
                        onStatusUpdate?.(data);
                    }
                });

                socket.on("orderUpdated", (data) => {
                    if (data.orderId === orderId || data.orderCode === orderId) {
                        onStatusUpdate?.({ ...data, type: "updated" });
                    }
                });
            } catch { /* socket is optional */ }
        };

        init();

        return () => {
            cancelled = true;
            if (socket) {
                socket.off("orderStatusUpdate");
                socket.off("orderUpdated");
                socket.disconnect();
            }
        };
    }, [orderId, onStatusUpdate]);

    return socketRef;
}
