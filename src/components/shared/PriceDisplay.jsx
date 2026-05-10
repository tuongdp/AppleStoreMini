import { cn, formatPrice, calcDiscount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
export default function PriceDisplay({
    price,
    salePrice,
    size = "md",
    showBadge = false,
    showSaved = false,
    className,
}) {
    const effectivePrice = salePrice && salePrice < price ? salePrice : price;
    const hasDiscount = salePrice && salePrice < price;
    const discount = hasDiscount ? calcDiscount(price, salePrice) : 0;
    const saved = hasDiscount ? price - salePrice : 0;

    const sizes = {
        sm: { current: "text-sm font-medium", original: "text-xs" },
        md: { current: "text-base font-semibold", original: "text-sm" },
        lg: { current: "text-xl font-semibold", original: "text-sm" },
        xl: { current: "text-3xl font-bold", original: "text-base" },
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <span className={cn("text-foreground", sizes[size].current)}>
                {formatPrice(effectivePrice)}
            </span>

            {hasDiscount && (
                <span className={cn("text-muted-foreground line-through", sizes[size].original)}>
                    {formatPrice(price)}
                </span>
            )}

            {hasDiscount && showBadge && (
                <Badge variant="destructive" className="text-xs">
                    -{discount}%
                </Badge>
            )}

            {hasDiscount && showSaved && (
                <span className="text-xs text-green-600 dark:text-green-400">
                    {"Giảm "}{formatPrice(saved)}
                </span>
            )}
        </div>
    );
}
