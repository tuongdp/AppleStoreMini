import { Link } from "react-router-dom";
import { Newspaper, Search } from "lucide-react";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";
import { formatPrice, parseJsonField, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { getNewsHref, groupProductsByCategory } from "@/features/products/utils/searchResults";

function getProductImage(product) {
    return product.image || parseJsonField(product.images)?.[0] || productPlaceholder;
}

export default function ProductSearchSuggestions({
    keyword,
    suggestions,
    groupedSuggestions,
    newsSuggestions = [],
    isLoading,
    onSelect,
    onSelectNews,
    onViewAll,
    className,
    itemClassName,
    imageSize = 40,
    priceClassName = "text-xs",
    viewAllVariant = "link",
    animated = false,
}) {
    const productGroups = groupedSuggestions || groupProductsByCategory(suggestions);
    const hasProducts = productGroups.some((group) => group.products.length > 0);
    const hasNews = newsSuggestions.length > 0;

    if (!hasProducts && !hasNews && !isLoading) {
        return (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                {"Không tìm thấy kết quả phù hợp"}
            </div>
        );
    }

    return (
        <div className={cn("py-1.5", className)}>
            {hasProducts && (
                <div>
                    <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {"Sản phẩm"}
                    </div>
                    {productGroups.map((group, groupIndex) => (
                        <div key={group.category}>
                            <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                                {group.category}{" "}
                                <span className="font-normal">({group.products.length})</span>
                            </div>
                            {group.products.map((product, index) => (
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
                                                animationDelay: `${Math.min((groupIndex + index) * 40, 300)}ms`,
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
                        </div>
                    ))}
                </div>
            )}

            {hasNews && (
                <div className={cn(hasProducts && "mt-1 border-t border-border pt-1")}>
                    <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {"Tin tức"}
                    </div>
                    {newsSuggestions.map((news) => (
                        <Link
                            key={news.id || news._id || news.slug}
                            to={getNewsHref(news)}
                            onClick={() => onSelectNews?.(news)}
                            className={cn(
                                "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                itemClassName,
                            )}
                        >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Newspaper className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="line-clamp-1 text-sm font-medium text-foreground">
                                    {news.title}
                                </span>
                                <span className="line-clamp-1 text-xs text-muted-foreground">
                                    {news.category || news.excerpt || "Tin tức"}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}

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
