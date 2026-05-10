import { Package } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import ProductCard from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/ProductCardSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export default function ProductGrid({
    products = [],
    isLoading = false,
    skeletonCount = 12,
    className,
}) {
    const { t } = useTranslation("product");

    if (isLoading) {
        return (
            <ProductGridSkeleton count={skeletonCount} className={className} />
        );
    }

    if (products.length === 0) {
        return (
            <EmptyState
                icon={Package}
                title={t("empty.products")}
                description={t("empty.productsDesc")}
            />
        );
    }

    return (
        <div
            className={cn(
                "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4",
                className,
            )}
        >
            {products.map((product) => (
                <ProductCard
                    key={product._id || product.id}
                    product={product}
                />
            ))}
        </div>
    );
}
