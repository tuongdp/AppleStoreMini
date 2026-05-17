import { useEffect, useRef } from "react";
import { toast } from "sonner";

const OFFLINE_TOAST_ID = "network-offline";

export default function NetworkStatusNotifier() {
    const wasOfflineRef = useRef(typeof navigator !== "undefined" ? !navigator.onLine : false);

    useEffect(() => {
        const handleOffline = () => {
            wasOfflineRef.current = true;
            toast.error("Mất kết nối mạng", {
                id: OFFLINE_TOAST_ID,
                description: "Vui lòng kiểm tra kết nối internet của bạn.",
                duration: Infinity,
            });
        };

        const handleOnline = () => {
            toast.dismiss(OFFLINE_TOAST_ID);
            if (wasOfflineRef.current) {
                toast.success("Đã kết nối mạng lại");
            }
            wasOfflineRef.current = false;
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        if (!navigator.onLine) {
            handleOffline();
        }

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    return null;
}
