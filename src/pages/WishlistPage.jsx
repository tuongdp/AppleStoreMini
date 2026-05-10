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
    const items = useSelector(selectWishlistItems);
    const count = useSelector(selectWishlistCount);

    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <Heart className="h-5 w-5 text-foreground" />
                <h2 className="text-xl font-semibold text-foreground">
                    {"Yêu thích"}
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
                    title={"wishlist"}
                    description={"Lưu những sản phẩm bạn yêu thích để mua sau"}
                    actionLabel={"Tiếp tục mua sắm"}
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
