import { useState, useEffect, useRef, useMemo } from "react";

export function useIntersectionObserver(options = {}) {
    const ref = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);

    const stableOptions = useMemo(() => ({
        threshold: 0.1,
        ...options,
    }), [options.threshold, options.root, options.rootMargin]);

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
            stableOptions,
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [stableOptions]);

    return { ref, isIntersecting, hasIntersected };
}
