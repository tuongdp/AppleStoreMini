import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import { formatPrice, parseJsonField } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function ProductSearch({ autoFocus = false, onClose }) {
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
        if (autoFocus) inputRef.current?.focus();
    }, [autoFocus]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
        onClose?.();
    };

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={keyword}
                        onChange={(e) => handleKeywordChange(e.target.value)}
                        placeholder={"Tìm kiếm sản phẩm..."}
                        className="h-10 rounded-full pl-9 pr-9"
                    />
                    {keyword && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <X className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions */}
            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                    {suggestions.length === 0 && !isLoading ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                            {"Không tìm thấy sản phẩm"}
                        </div>
                    ) : (
                        <div className="py-1.5">
                            {suggestions.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => {
                                        handleSelectSuggestion(product);
                                        onClose?.();
                                    }}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                                >
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/50 p-1">
                                        <img
                                            src={
                                                parseJsonField(product.images)?.[0] ||
                                                product.image
                                            }
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
                                    <span className="shrink-0 text-xs font-medium text-foreground">
                                        {formatPrice(product.price)}
                                    </span>
                                </button>
                            ))}
                            {keyword && (
                                <div className="border-t border-border px-3 py-2">
                                    <Link
                                        to={`${ROUTES.SEARCH}?q=${encodeURIComponent(keyword)}`}
                                        onClick={() => {
                                            handleClear();
                                            onClose?.();
                                        }}
                                        className="flex items-center justify-center text-xs font-medium text-apple-blue hover:opacity-70"
                                    >
                                        {"Xem tất cả kết quả cho"} &ldquo;{keyword}
                                        &rdquo;
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
