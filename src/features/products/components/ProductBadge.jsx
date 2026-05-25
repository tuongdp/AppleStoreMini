import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    getProductMarketingBadge,
    getProductMarketingBadgeClassName,
} from "@/features/products/utils/productMarketingBadge";

export default function ProductBadge({ product, className }) {
    if (!product) return null;

    const marketingBadge = getProductMarketingBadge(product);

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {marketingBadge && (
                <Badge
                    className={getProductMarketingBadgeClassName(marketingBadge.tone)}
                    title={marketingBadge.title}
                >
                    {marketingBadge.label}
                </Badge>
            )}
            {product.salePrice && product.salePrice < product.price && (
                <Badge variant="destructive">
                    -
                    {Math.round(
                        ((product.price - product.salePrice) / product.price) *
                            100,
                    )}
                    %
                </Badge>
            )}
            {!product.inStock && (
                <Badge variant="outline" className="text-muted-foreground">
                    {"Hết hàng"}
                </Badge>
            )}
            {product.featured && (
                <Badge className="bg-foreground text-background hover:bg-foreground/90">
                    {"Nổi bật"}
                </Badge>
            )}
        </div>
    );
}
