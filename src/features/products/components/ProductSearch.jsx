import { useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import ProductSearchSuggestions from "@/features/products/components/ProductSearchSuggestions";

export default function ProductSearch({ autoFocus = false, onClose }) {
    const inputRef = useRef(null);

    const {
        keyword,
        isOpen,
        isLoading,
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
        if (autoFocus) inputRef.current?.focus();
    }, [autoFocus]);

    const handleSubmit = (event) => {
        event.preventDefault();
        handleSearch();
        onClose?.();
    };

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        ref={inputRef}
                        value={keyword}
                        onChange={(event) => handleKeywordChange(event.target.value)}
                        placeholder="Tìm kiếm sản phẩm…"
                        className="h-10 rounded-full pl-9 pr-9"
                        aria-label="Tìm kiếm sản phẩm"
                        name="product-search"
                        autoComplete="off"
                        data-testid="product-search-input"
                    />
                    {keyword && (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Xóa tìm kiếm"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                    <ProductSearchSuggestions
                        keyword={keyword}
                        suggestions={suggestions}
                        groupedSuggestions={groupedSuggestions}
                        newsSuggestions={newsSuggestions}
                        isLoading={isLoading}
                        onSelect={(product) => {
                            handleSelectSuggestion(product);
                            onClose?.();
                        }}
                        onSelectNews={(news) => {
                            handleSelectNews(news);
                            onClose?.();
                        }}
                        onViewAll={() => {
                            handleClear();
                            onClose?.();
                        }}
                    />
                </div>
            )}
        </div>
    );
}
