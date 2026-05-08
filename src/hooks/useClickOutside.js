import { useEffect, useRef } from "react";

export function useClickOutside(handler) {
    const ref = useRef();
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handlerRef.current(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, []);

    return ref;
}
