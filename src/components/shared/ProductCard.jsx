import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Flame } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toggleWishlist, selectIsInWishlist } from "@/store/wishlistSlice";
import { toggleAuthModal, toggleCartDrawer } from "@/store/uiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { formatPrice, calcDiscount, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

import productPlaceholder from "@/assets/images/placeholder/product-placeholder.jpg";

const LOW_STOCK_THRESHOLD = 5;
const NEW_PRODUCT_DAYS = 30;

function isNewProduct(createdAt) {
    if (!createdAt) return false;
    const age = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return age <= NEW_PRODUCT_DAYS;
}

export default function ProductCard({ product }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isInWishlist = useSelector(
        selectIsInWishlist(product._id || product.id),
    );

    const hasFlashSale = !!product.flashSale?.salePrice;

    const effectivePrice = hasFlashSale
        ? product.flashSale.salePrice
        : product.salePrice && product.salePrice < product.price
            ? product.salePrice
            : product.price;

    const originalPrice = hasFlashSale
        ? product.flashSale.originalPrice
        : product.price;

    const discount = hasFlashSale
        ? calcDiscount(product.flashSale.originalPrice, product.flashSale.salePrice)
        : calcDiscount(product.price, effectivePrice);

    const showDiscount = hasFlashSale
        ? product.flashSale.salePrice < product.flashSale.originalPrice
        : product.salePrice && product.salePrice < product.price;

    const stock = product.stock ?? null;
    const isOutOfStock = !product.inStock || stock === 0;
    const isLowStock =
        !isOutOfStock &&
        stock !== null &&
        stock > 0 &&
        stock <= LOW_STOCK_THRESHOLD;

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (isOutOfStock) return;
        dispatch(
            addToCart({
                product,
                variantId: product.variantId,
                quantity: 1,
            }),
        );
        dispatch(toggleCartDrawer(true));
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            dispatch(toggleAuthModal(true));
            return;
        }
        dispatch(toggleWishlist(product));
    };

    return (
        <Card className="group overflow-hidden border-transparent bg-muted/30 transition-all duration-200 hover:border-border hover:shadow-md">
            {/* Image */}
            <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
                <div
                    className="relative overflow-hidden bg-white p-4 dark:bg-muted/10"
                    style={{ aspectRatio: "4/3" }}
                >
                    {/* Badges */}
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
                        {hasFlashSale && (
                            <Badge className="flex items-center gap-1 border-0 bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-sm">
                                <Flame className="h-3 w-3" />
                                {t("flashSale.flashSale", { defaultValue: "FLASH SALE" })}
                            </Badge>
                        )}
                        {isOutOfStock && (
                            <Badge
                                variant="outline"
                                className="border-red-200 bg-red-50 text-[10px] text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                            >
                                {t("product.outOfStock")}
                            </Badge>
                        )}
                        {!isOutOfStock && showDiscount && (
                            <Badge
                                variant="destructive"
                                className="text-[10px]"
                            >
                                -{discount}%
                            </Badge>
                        )}
                        {!isOutOfStock && isLowStock && (
                            <Badge className="bg-amber-100 text-[10px] text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400">
                                {t("product.lowStock", {
                                    defaultValue: "Còn {{count}} sản phẩm",
                                    count: stock,
                                })}
                            </Badge>
                        )}
                        {!isOutOfStock && isNewProduct(product.createdAt) && (
                            <Badge variant="secondary" className="text-[10px]">
                                {t("product.new")}
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist button */}
                    <button
                        onClick={handleToggleWishlist}
                        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110"
                        aria-label="Thêm vào yêu thích"
                    >
                        <Heart
                            className={cn(
                                "h-3.5 w-3.5 transition-colors",
                                isInWishlist
                                    ? "fill-red-500 text-red-500"
                                    : "text-muted-foreground",
                            )}
                        />
                    </button>

                    {/* Overlay mờ khi hết hàng */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 z-[5] bg-background/50 backdrop-blur-[1px]" />
                    )}

                    {/* Product image */}
                    <img
                        src={
                            product.images?.[0] ||
                            product.image ||
                            productPlaceholder
                        }
                        alt={product.name}
                        className={cn(
                            "h-full w-full object-contain transition-transform duration-500",
                            !isOutOfStock && "group-hover:scale-105",
                            isOutOfStock && "opacity-60",
                        )}
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = productPlaceholder;
                        }}
                    />
                </div>
            </Link>

            {/* Info */}
            <CardContent className="p-3 text-center">
                <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {product.category}
                </div>

                <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
                    <h3 className="line-clamp-1 text-sm font-semibold transition-colors hover:text-apple-blue">
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                    {isOutOfStock ? (
                        <span className="text-xs text-muted-foreground">
                            {t("product.contactToOrder", {
                                defaultValue: "Liên hệ để đặt hàng",
                            })}
                        </span>
                    ) : (
                        <>
                            <span className={cn(
                                "text-sm font-semibold",
                                hasFlashSale ? "text-destructive" : "text-foreground",
                            )}>
                                {formatPrice(effectivePrice)}
                            </span>
                            {(!hasFlashSale ? product.price > effectivePrice : showDiscount) && (
                                <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(hasFlashSale ? originalPrice : product.price)}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="justify-center p-3">
                <Button
                    size="sm"
                    variant={isOutOfStock ? "outline" : "default"}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="h-8 w-full gap-1.5 rounded-full text-xs transition-transform active:scale-95"
                >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {isOutOfStock
                        ? t("product.outOfStock")
                        : t("btn.addToCart")}
                </Button>
            </CardFooter>
        </Card>
    );
}
