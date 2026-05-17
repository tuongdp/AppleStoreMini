import { useEffect } from "react";

const OFFLINE_PAGE = "/offline.html";

export default function NetworkStatusNotifier() {
    useEffect(() => {
        const goOfflinePage = () => {
            if (window.location.pathname === OFFLINE_PAGE) return;
            window.location.assign(OFFLINE_PAGE);
        };

        window.addEventListener("offline", goOfflinePage);

        if (!navigator.onLine) {
            goOfflinePage();
        }

        return () => {
            window.removeEventListener("offline", goOfflinePage);
        };
    }, []);

    return null;
}
