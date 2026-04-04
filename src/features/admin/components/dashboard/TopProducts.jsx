import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatNumber } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ✅ images có thể là JSON string (MySQL)
const getFirstImage = (images) => {
    if (!images) return "";
    if (Array.isArray(images)) return images[0] || "";
    try {
        return JSON.parse(images)[0] || "";
    } catch {
        return "";
    }
};

export default function TopProducts() {
    const { t } = useTranslation("admin");

    const { data, isLoading } = useGetProductsQuery({
        sort: "best_seller",
        limit: 5,
        page: 1,
    });

    // ✅ getProductsQuery transformResponse → { products, pagination }
    const products = data?.products ?? [];

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    {t("table.noData")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div className="mb-3 grid grid-cols-12 gap-4 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-5">{t("product.name")}</div>
                <div className="col-span-2 text-center">
                    {t("product.soldCount")}
                </div>
                <div className="col-span-2 text-center">
                    {t("product.status")}
                </div>
                <div className="col-span-2 text-right">
                    {t("product.price")}
                </div>
            </div>

            {products.map((product, index) => (
                // ✅ MySQL integer id
                <Link
                    key={product.id}
                    to={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                    className="grid grid-cols-12 items-center gap-4 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                    <div className="col-span-1">
                        <span
                            className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                index === 0 &&
                                    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                                index === 1 &&
                                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                index === 2 &&
                                    "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
                                index > 2 && "bg-muted text-muted-foreground",
                            )}
                        >
                            {index + 1}
                        </span>
                    </div>

                    <div className="col-span-5 flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-1">
                            <img
                                // ✅ parse JSON string nếu cần
                                src={getFirstImage(product.images)}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                                {product.name}
                            </p>
                            {/* ✅ BE trả categorySlug — không phải category */}
                            <p className="text-xs text-muted-foreground">
                                {product.categorySlug}
                            </p>
                        </div>
                    </div>

                    <div className="col-span-2 text-center">
                        <span className="text-sm text-foreground">
                            {formatNumber(product.soldCount ?? 0)}
                        </span>
                    </div>

                    <div className="col-span-2 flex justify-center">
                        <span
                            className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                product.inStock
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                            )}
                        >
                            {product.inStock
                                ? t("product.inStock")
                                : t("product.inactive")}
                        </span>
                    </div>

                    <div className="col-span-2 text-right">
                        <span className="text-sm font-medium text-foreground">
                            {formatPrice(product.price)}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
