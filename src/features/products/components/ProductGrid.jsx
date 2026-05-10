import { Package } from "lucide-react";
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
    if (isLoading) {
        return (
            <ProductGridSkeleton count={skeletonCount} className={className} />
        );
    }

    if (products.length === 0) {
        return (
            <EmptyState
                icon={Package}
                title={"products"}
                description={"productsDesc"}
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
