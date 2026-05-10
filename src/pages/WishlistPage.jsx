import { useTranslation } from "@/i18n/useTranslation";
import { useSelector } from "react-redux";
import { Heart, HeartOff } from "lucide-react";
import {
    selectWishlistItems,
    selectWishlistCount,
} from "@/store/wishlistSlice";
import ProductCard from "@/components/shared/ProductCard";
import EmptyState from "@/components/shared/EmptyState";
import { ROUTES } from "@/lib/constants";

export default function WishlistPage() {
    const { t } = useTranslation();
    const items = useSelector(selectWishlistItems);
    const count = useSelector(selectWishlistCount);

    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <Heart className="h-5 w-5 text-foreground" />
                <h2 className="text-xl font-semibold text-foreground">
                    {t("nav.wishlist")}
                </h2>
                {count > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                        ({count})
                    </span>
                )}
            </div>

            {/* Content */}
            {items.length === 0 ? (
                <EmptyState
                    icon={HeartOff}
                    title={t("empty.wishlist")}
                    description={t("empty.wishlistDesc")}
                    actionLabel={t("btn.continueShopping")}
                    actionHref={ROUTES.PRODUCTS}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((product) => (
                        <ProductCard
                            key={product._id || product.id}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
