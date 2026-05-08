import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProductBadge({ product, className }) {
    const { t } = useTranslation("product");

    if (!product) return null;

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {product.isNew && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400">
                    {t("new")}
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
                    {t("outOfStock")}
                </Badge>
            )}
            {product.featured && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400">
                    {t("featured")}
                </Badge>
            )}
        </div>
    );
}
