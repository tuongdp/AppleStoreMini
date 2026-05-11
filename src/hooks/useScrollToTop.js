import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Detect xem user đã scroll xuống quá threshold chưa — dùng cho Navbar
export function useScrolled(threshold = 50) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY > threshold;
                    setIsScrolled((prev) => prev !== scrolled ? scrolled : prev);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);

    return isScrolled;
}

// Tự động scroll lên đầu trang khi đổi route — gắn vào RootLayout
export function useScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);
}
