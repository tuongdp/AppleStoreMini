import { useEffect, useRef } from "react";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export function useSocket(onNewNotification, onNewOrder, onChatEvent) {
    const callbacks = useRef({ onNewNotification, onNewOrder, onChatEvent });
    callbacks.current = { onNewNotification, onNewOrder, onChatEvent };

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

                socket.on("notification:new", (data) => { callbacks.current.onNewNotification?.(data); });
                socket.on("newOrder", (data) => { callbacks.current.onNewOrder?.(data); });
                socket.on("chat:newRequest", (data) => { callbacks.current.onChatEvent?.("newRequest", data); });
                socket.on("chat:message", (data) => { callbacks.current.onChatEvent?.("message", data); });
            } catch (e) {}
        };
        initSocket();
        return () => { if (socket) socket.disconnect(); };
    }, []);

    return null;
}

export function useOrderSocket(orderId, onStatusUpdate) {
    const socketRef = useRef(null);
    useEffect(() => {
        if (!orderId) return;
        let socket;
        const initSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                socket = io(SOCKET_URL, { path: "/socket.io", transports: ["websocket", "polling"] });
                socket.on("orderStatusUpdate", (data) => { if (data.orderId === orderId && onStatusUpdate) onStatusUpdate(data); });
                socketRef.current = socket;
            } catch (e) {}
        };
        initSocket();
        return () => { if (socket) socket.disconnect(); };
    }, [orderId]);
    return socketRef;
}

export function useChatSocket(conversationId, onMessage) {
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;
    const socketRef = useRef(null);
    useEffect(() => {
        if (!conversationId) return;
        let socket;
        const initSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                socket = io(SOCKET_URL, { path: "/socket.io", transports: ["websocket", "polling"] });
                socket.on(`chat:message:${conversationId}`, (data) => { onMessageRef.current?.(data); });
                socketRef.current = socket;
            } catch (e) {}
        };
        initSocket();
        return () => { if (socket) socket.disconnect(); };
    }, [conversationId]);
    return socketRef;
}
