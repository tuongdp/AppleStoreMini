import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";
import { formatPrice, parseJsonField, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

function getProductImage(product) {
    return product.image || parseJsonField(product.images)?.[0] || productPlaceholder;
}

export default function ProductSearchSuggestions({
    keyword,
    suggestions,
    isLoading,
    onSelect,
    onViewAll,
    className,
    itemClassName,
    imageSize = 40,
    priceClassName = "text-xs",
    viewAllVariant = "link",
    animated = false,
}) {
    if (!suggestions.length && !isLoading) {
        return (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                {"Không tìm thấy sản phẩm"}
            </div>
        );
    }

    return (
        <div className={cn("py-1.5", className)}>
            {suggestions.map((product, index) => (
                <button
                    key={product.id || product._id || product.slug}
                    type="button"
                    onClick={() => onSelect(product)}
                    className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        animated && "animate-in fade-in slide-in-from-bottom-1",
                        itemClassName,
                    )}
                    style={
                        animated
                            ? {
                                animationDelay: `${Math.min(index * 40, 300)}ms`,
                                animationFillMode: "both",
                            }
                            : undefined
                    }
                    data-testid="product-search-suggestion"
                >
                    <span
                        className="shrink-0 overflow-hidden rounded-lg bg-muted/50 p-1"
                        style={{ width: imageSize, height: imageSize }}
                    >
                        <ResponsiveImage
                            src={getProductImage(product)}
                            fallbackSrc={productPlaceholder}
                            alt={product.name || ""}
                            width={imageSize}
                            height={imageSize}
                            className="h-full w-full object-contain"
                        />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                            {product.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {product.category}
                        </span>
                    </span>

                    <span className={cn("shrink-0 font-medium text-foreground", priceClassName)}>
                        {formatPrice(product.price)}
                    </span>
                </button>
            ))}

            {keyword && (
                <div className="border-t border-border px-3 py-2">
                    <Link
                        to={`${ROUTES.SEARCH}?q=${encodeURIComponent(keyword)}`}
                        onClick={onViewAll}
                        className={cn(
                            "flex items-center justify-center gap-1.5 text-xs font-medium text-apple-blue transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                            viewAllVariant === "button" &&
                                "rounded-full bg-foreground py-2.5 text-sm text-background transition-[opacity,transform] hover:scale-[1.02] hover:opacity-90",
                        )}
                    >
                        {viewAllVariant === "button" && <Search className="h-4 w-4" />}
                        {"Xem tất cả kết quả cho"} &ldquo;{keyword}&rdquo;
                    </Link>
                </div>
            )}
        </div>
    );
}
