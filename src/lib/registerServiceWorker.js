export function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    if (!import.meta.env.PROD) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .getRegistrations()
                .then((registrations) => {
                    registrations.forEach((registration) => registration.unregister());
                })
                .catch((error) => {
                    console.warn("Service worker cleanup failed:", error);
                });
        });
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
            console.warn("Service worker registration failed:", error);
        });
    });
}
