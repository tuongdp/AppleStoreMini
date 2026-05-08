import { useState, useEffect, useRef } from "react";

export function useIntersectionObserver(options = {}) {
    const ref = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting) setHasIntersected(true);
            },
            {
                threshold: 0.1,
                ...options,
            },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [options]);

    return { ref, isIntersecting, hasIntersected };
}
