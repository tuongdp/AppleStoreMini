import { useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import { formatPrice, parseJsonField } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SearchOverlay({ open, onClose }) {
    const inputRef = useRef(null);

    const {
        keyword,
        isOpen: hasResults,
        isFetching,
        suggestions,
        handleKeywordChange,
        handleSearch,
        handleSelectSuggestion,
        handleClear,
    } = useProductSearch();

    useEffect(() => {
        let timer;
        if (open) {
            timer = setTimeout(() => inputRef.current?.focus(), 150);
            document.body.style.overflow = "hidden";
        } else {
            handleClear();
            document.body.style.overflow = "";
        }
        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "";
        };
    }, [open, handleClear]);

    const close = useCallback(() => {
        handleClear();
        onClose?.();
    }, [handleClear, onClose]);

    const closeRef = useRef(close);
    useEffect(() => { closeRef.current = close; }, [close]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        handleSearch();
        close();
    }, [handleSearch, close]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") closeRef.current();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={close}
            />
            <div
                className="absolute inset-x-0 top-0 z-10 border-b border-border bg-card shadow-2xl animate-in slide-in-from-top duration-300"
            >
                <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSubmit} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <label htmlFor="search-input" className="sr-only">
                                    Tìm kiếm sản phẩm
                                </label>
                                <Input
                                    id="search-input"
                                    ref={inputRef}
                                    value={keyword}
                                    onChange={(e) => handleKeywordChange(e.target.value)}
                                    placeholder={"Tìm kiếm sản phẩm..."}
                                    className="h-12 rounded-2xl pl-12 pr-12 text-base transition-all duration-200 focus-visible:ring-2 focus-visible:ring-foreground/20"
                                />
                                {keyword && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        aria-label="Xóa tìm kiếm"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {isFetching ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <X className="h-5 w-5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                        <button
                            onClick={close}
                            className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label="Đóng"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div
                        className={cn(
                            "mt-4 transition-all duration-300",
                            hasResults
                                ? "translate-y-0 opacity-100"
                                : "translate-y-2 opacity-0 pointer-events-none",
                        )}
                    >
                        <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-popover shadow-lg">
                            {!hasResults && !isFetching ? (
                                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    {"Không tìm thấy sản phẩm"}
                                </div>
                            ) : (
                                <div className="py-2">
                                    {suggestions.map((product, i) => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                handleSelectSuggestion(product);
                                                close();
                                            }}
                                            className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted animate-in fade-in slide-in-from-bottom-1"
                                            style={{ animationDelay: `${Math.min(i * 40, 300)}ms`, animationFillMode: "both" }}
                                        >
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted/50 p-1.5">
                                                <img
                                                    src={parseJsonField(product.images)?.[0] || product.image}
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
                                                    close();
                                                }}
                                                className="flex items-center justify-center gap-1.5 rounded-full bg-foreground py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 hover:scale-[1.02]"
                                            >
                                                <Search className="h-4 w-4" />
                                                {"Xem tất cả kết quả cho"} {"\u201C"}{keyword}{"\u201D"}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
