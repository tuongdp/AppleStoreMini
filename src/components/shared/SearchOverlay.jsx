import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SearchOverlay({ open, onClose }) {
    const { t } = useTranslation("product");
    const inputRef = useRef(null);

    const {
        keyword,
        isOpen,
        isLoading,
        suggestions,
        handleKeywordChange,
        handleSearch,
        handleSelectSuggestion,
        handleClear,
    } = useProductSearch();

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            handleClear();
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
        onClose?.();
    };

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        if (open) {
            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60]">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={cn(
                    "absolute inset-x-0 top-0 z-10 border-b border-border bg-card shadow-2xl",
                    "animate-in slide-in-from-top duration-300",
                )}
            >
                <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSubmit} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    ref={inputRef}
                                    value={keyword}
                                    onChange={(e) => handleKeywordChange(e.target.value)}
                                    placeholder={t("search.placeholder")}
                                    className="h-12 rounded-2xl pl-12 pr-12 text-base"
                                />
                                {keyword && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <X className="h-5 w-5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                        <button
                            onClick={onClose}
                            className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label="Đóng"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {isOpen && (
                        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-popover shadow-lg">
                            {suggestions.length === 0 && !isLoading ? (
                                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    {t("search.noResults")}
                                </div>
                            ) : (
                                <div className="py-2">
                                    {suggestions.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                handleSelectSuggestion(product);
                                                onClose?.();
                                            }}
                                            className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted"
                                        >
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted/50 p-1.5">
                                                <img
                                                    src={product.images?.[0] || product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.category}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-medium text-foreground">
                                                {formatPrice(product.price)}
                                            </span>
                                        </button>
                                    ))}

                                    {keyword && (
                                        <div className="border-t border-border px-4 py-3">
                                            <Link
                                                to={`${ROUTES.SEARCH}?q=${encodeURIComponent(keyword)}`}
                                                onClick={() => {
                                                    handleClear();
                                                    onClose?.();
                                                }}
                                                className="flex items-center justify-center gap-1.5 rounded-full bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                                            >
                                                <Search className="h-4 w-4" />
                                                {t("search.viewAll")} &ldquo;{keyword}&rdquo;
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
