import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_THRESHOLD = 400;

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > SHOW_THRESHOLD);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            className={cn(
                "fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 shadow-md backdrop-blur-sm transition-[background-color,opacity,transform] duration-300 hover:scale-110 hover:bg-muted active:scale-95",
                visible
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "translate-y-4 opacity-0 pointer-events-none",
            )}
        >
            <ArrowUp className="h-4 w-4 text-foreground" />
        </button>
    );
}
