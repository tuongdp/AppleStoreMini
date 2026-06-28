import { useEffect } from "react";
import { useSelector } from "react-redux";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export function useAdminRealtime(onEvent) {
    const token = useSelector((state) => state.auth.accessToken);

    useEffect(() => {
        if (!token) return;
        let socket;
        let cancelled = false;

        const init = async () => {
            try {
                const { io } = await import("socket.io-client");
                if (cancelled) return;
                socket = io(SOCKET_URL, {
                    path: "/socket.io",
                    transports: ["polling"],
                    auth: { token },
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 3000,
                });

                socket.on("connect_error", () => {
                    // silently ignore, socket is optional
                });

                socket.on("connect", () => {
                    socket.on("newOrder", () => onEvent?.("newOrder"));
                    socket.on("orderStatusUpdate", () => onEvent?.("orderStatusUpdate"));
                    socket.on("orderUpdated", () => onEvent?.("orderUpdated"));
                    socket.on("productUpdated", () => onEvent?.("productUpdated"));
                    socket.on("productDeleted", () => onEvent?.("productDeleted"));
                    socket.on("reviewCreated", () => onEvent?.("reviewCreated"));
                    socket.on("stockUpdate", () => onEvent?.("stockUpdate"));
                });
            } catch { /* optional */ }
        };

        init();

        return () => {
            cancelled = true;
            if (socket) socket.disconnect();
        };
    }, [onEvent, token]);
}

