import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import ProductSearchSuggestions from "@/features/products/components/ProductSearchSuggestions";
import { useVoiceSearch } from "@/features/products/hooks/useVoiceSearch";

export default function NavbarSearch({ onClose }) {
    const inputRef = useRef(null);
    const navigate = useNavigate();

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

    const { isListening, startListening, stopListening, isSupported } = useVoiceSearch({
        onResult: (text) => {
            handleKeywordChange(text);
            onClose?.();
            navigate(`/search?q=${encodeURIComponent(text)}&ai=1`);
        },
    });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        handleSearch();
        onClose?.();
    };

    return (
        <div className="relative w-full max-w-md">
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
                        className="h-9 rounded-full pl-9 pr-9 text-sm"
                        aria-label="Tìm kiếm sản phẩm"
                        name="navbar-product-search"
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
                    {isSupported && (
                        <button
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            aria-label={isListening ? "Dừng nghe" : "Tìm kiếm bằng giọng nói"}
                            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${isListening ? "text-red-500 hover:text-red-600" : ""}`}
                            style={{ right: keyword ? "2.25rem" : "0.75rem" }}
                        >
                            {isListening ? (
                                <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                                </span>
                            ) : (
                                <Mic className="h-4 w-4" />
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
