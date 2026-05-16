import { useEffect, useRef, useCallback } from "react";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export function useSocket(onNewNotification, onNewOrder) {
    const socketRef = useRef(null);

    useEffect(() => {
        let socket;
        const initSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                socket = io(SOCKET_URL, {
                    path: "/socket.io",
                    transports: ["websocket", "polling"],
                    reconnection: true,
                    reconnectionDelay: 5000,
                });

                socket.on("connect", () => {
                    console.log("[Socket] Connected:", socket.id);
                });

                socket.on("connect_error", (err) => {
                    console.warn("[Socket] Error:", err.message);
                });

                socket.on("notification:new", (notifications) => {
                    if (onNewNotification) onNewNotification(notifications);
                });

                socket.on("newOrder", (order) => {
                    if (onNewOrder) onNewOrder(order);
                });

                socketRef.current = socket;
            } catch (e) {}
        };

        initSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    return socketRef;
}

export function useOrderSocket(orderId, onStatusUpdate) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;
        let socket;
        const initSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                socket = io(SOCKET_URL, {
                    path: "/socket.io",
                    transports: ["websocket", "polling"],
                });

                socket.on("orderStatusUpdate", (data) => {
                    if (data.orderId === orderId && onStatusUpdate) {
                        onStatusUpdate(data);
                    }
                });

                socketRef.current = socket;
            } catch (e) {}
        };

        initSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [orderId]);

    return socketRef;
}

