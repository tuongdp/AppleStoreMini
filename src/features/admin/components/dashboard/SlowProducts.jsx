import { Link } from "react-router-dom";
import { useGetSlowProductsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import placeholderImg from "@/assets/images/placeholder/product-placeholder.jpg";

const getFirstImage = (images) => {
    if (!images) return placeholderImg;
    if (Array.isArray(images)) return images[0] || placeholderImg;
    try { return JSON.parse(images)[0] || placeholderImg; } catch { return placeholderImg; }
};

export default function SlowProducts() {
    const { data = [], isLoading } = useGetSlowProductsQuery({ days: 30, limit: 5 });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Tất cả sản phẩm đều có bán</p>;
    }

    return (
        <div className="space-y-1">
            {data.map((product, index) => (
                <Link key={product.id} to={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50">
                    <span className="flex h-5 w-5 items-center justify-center rounded text-xs font-medium bg-muted text-muted-foreground shrink-0">
                        {index + 1}
                    </span>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                        <img src={getFirstImage(product.images)} alt={product.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.categorySlug} · Tồn: {product.totalStock}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <span className={cn("text-sm font-medium", product.soldCount === 0 ? "text-red-500" : "text-muted-foreground")}>
                            {product.soldCount === 0 ? "0 bán" : `${product.soldCount} bán`}
                        </span>
                        <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
