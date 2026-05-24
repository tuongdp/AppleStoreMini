import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProductBadge({ product, className }) {
    if (!product) return null;

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {product.isNew && (
                <Badge className="bg-muted text-foreground hover:bg-muted">
                    {"Mới"}
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
