import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { productsApi } from "@/store/api/productsApi";
import { getSocket } from "@/lib/socket";

const DEBOUNCE_MS = 2000;

export function useStockRealtime() {
    const dispatch = useDispatch();
    const timerRef = useRef(null);
    const activeRef = useRef(false);

    useEffect(() => {
        if (activeRef.current) return;
        activeRef.current = true;

        let cancelled = false;

        getSocket().then((socket) => {
            if (cancelled) return;

            socket.on("stockUpdate", () => {
                if (timerRef.current) return;

                dispatch(productsApi.util.invalidateTags(["Products"]));

                timerRef.current = setTimeout(() => {
                    timerRef.current = null;
                }, DEBOUNCE_MS);
            });
        });

        return () => {
            cancelled = true;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            activeRef.current = false;
        };
    }, [dispatch]);
}
