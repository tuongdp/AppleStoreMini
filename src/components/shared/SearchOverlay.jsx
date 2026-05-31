import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import ProductSearchSuggestions from "@/features/products/components/ProductSearchSuggestions";
import { useVoiceSearch } from "@/features/products/hooks/useVoiceSearch";
import { cn } from "@/lib/utils";

export default function SearchOverlay({ open, onClose }) {
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const {
        keyword,
        isOpen: hasResults,
        isFetching,
        suggestions,
        groupedSuggestions,
        newsSuggestions,
        handleKeywordChange,
        handleSearch,
        handleSelectSuggestion,
        handleSelectNews,
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

    const { isListening, startListening, stopListening, isSupported } = useVoiceSearch({
        onResult: (text) => {
            handleKeywordChange(text);
            close();
            navigate(`/search?q=${encodeURIComponent(text)}&ai=1`);
        },
    });

    const close = useCallback(() => {
        handleClear();
        onClose?.();
    }, [handleClear, onClose]);

    const closeRef = useRef(close);
    useEffect(() => {
        closeRef.current = close;
    }, [close]);

    const handleSubmit = useCallback(
        (event) => {
            event.preventDefault();
            handleSearch();
            close();
        },
        [handleSearch, close],
    );

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event) => {
            if (event.key === "Escape") closeRef.current();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] animate-in fade-in duration-200">
            <button
                type="button"
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={close}
                aria-label="Đóng tìm kiếm"
            />
            <div className="absolute inset-x-0 top-0 z-10 border-b border-border bg-card shadow-2xl animate-in slide-in-from-top duration-300">
                <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSubmit} className="flex-1">
                            <div className="relative">
                                <Search
                                    aria-hidden="true"
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                                />
                                <label htmlFor="search-input" className="sr-only">
                                    Tìm kiếm sản phẩm
                                </label>
                                <Input
                                    id="search-input"
                                    ref={inputRef}
                                    value={keyword}
                                    onChange={(event) => handleKeywordChange(event.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="h-12 rounded-2xl pl-12 pr-12 text-base transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-foreground/20"
                                    name="overlay-product-search"
                                    autoComplete="off"
                                />
                                {keyword && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        aria-label="Xóa tìm kiếm"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                    >
                                        {isFetching ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <X className="h-5 w-5" />
                                        )}
                                    </button>
                                )}
                                {isSupported ? (
                                    <button
                                        type="button"
                                        onClick={isListening ? stopListening : startListening}
                                        aria-label={isListening ? "Dừng nghe" : "Tìm kiếm bằng giọng nói"}
                                        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${isListening ? "text-red-500 hover:text-red-600" : ""}`}
                                        style={{ right: keyword ? "2.75rem" : "0.75rem" }}
                                    >
                                        {isListening ? (
                                            <span className="relative flex h-4 w-4">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                                <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
                                            </span>
                                        ) : (
                                            <Mic className="h-5 w-5" />
                                        )}
                                    </button>
                                ) : (
                                    <span
                                        className="absolute top-1/2 -translate-y-1/2 text-muted-foreground/40 cursor-not-allowed"
                                        style={{ right: keyword ? "2.75rem" : "0.75rem" }}
                                        title="Trình duyệt không hỗ trợ tìm kiếm giọng nói"
                                        aria-label="Tìm kiếm giọng nói không khả dụng"
                                    >
                                        <Mic className="h-5 w-5" />
                                    </span>
                                )}
                            </div>
                        </form>
                        <button
                            type="button"
                            onClick={close}
                            className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            aria-label="Đóng"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div
                        className={cn(
                            "mt-4 transition-[opacity,transform] duration-300",
                            hasResults
                                ? "translate-y-0 opacity-100"
                                : "pointer-events-none translate-y-2 opacity-0",
                        )}
                    >
                        <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-popover shadow-lg">
                            <ProductSearchSuggestions
                                keyword={keyword}
                                suggestions={suggestions}
                                groupedSuggestions={groupedSuggestions}
                                newsSuggestions={newsSuggestions}
                                isLoading={isFetching}
                                onSelect={(product) => {
                                    handleSelectSuggestion(product);
                                    close();
                                }}
                                onSelectNews={(news) => {
                                    handleSelectNews(news);
                                    close();
                                }}
                                onViewAll={() => {
                                    handleClear();
                                    close();
                                }}
                                className="py-2"
                                itemClassName="gap-4 px-4 py-3"
                                imageSize={48}
                                priceClassName="text-sm"
                                viewAllVariant="button"
                                animated
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
