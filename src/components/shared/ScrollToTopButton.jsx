import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_THRESHOLD = 400; // px

export default function ScrollToTopButton() {
    const { t } = useTranslation("common");
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
            aria-label={t("scrollToTop")}
            className={cn(
                "fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted hover:scale-110 active:scale-95",
                visible
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "translate-y-4 opacity-0 pointer-events-none",
            )}
        >
            <ArrowUp className="h-4 w-4 text-foreground" />
        </button>
    );
}
