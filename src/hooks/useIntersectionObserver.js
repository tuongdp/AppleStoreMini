import { useState, useEffect, useRef } from "react";

export function useIntersectionObserver(options = {}) {
    const ref = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);

    const { root = null, rootMargin = "0px", threshold = 0.1 } = options;

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let prevState = false;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting !== prevState) {
                    prevState = entry.isIntersecting;
                    setIsIntersecting(entry.isIntersecting);
                }
                if (entry.isIntersecting) setHasIntersected(true);
            },
            { root, rootMargin, threshold },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [root, rootMargin, threshold]);

    return { ref, isIntersecting, hasIntersected };
}
