import { Link } from "react-router-dom";
import { Heart, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist, selectIsInWishlist } from "@/store/wishlistSlice";
import { toggleAuthModal } from "@/store/uiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { productsApi } from "@/store/api/productsApi";
import { formatPrice, cn, parseJsonField } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import ResponsiveImage from "@/components/shared/ResponsiveImage";

import { productPlaceholder } from "@/assets/images";

const NEW_PRODUCT_DAYS = 30;

function isNewProduct(createdAt) {
    if (!createdAt) return false;
    const age = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return age <= NEW_PRODUCT_DAYS;
}

export default function ProductCard({ product }) {
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

    const showDiscount = hasFlashSale
        ? product.flashSale.salePrice < product.flashSale.originalPrice
        : product.salePrice && product.salePrice < product.price;

    const stock = product.stock ?? null;
    const isOutOfStock = !product.inStock || stock === 0;

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            dispatch(toggleAuthModal(true));
            return;
        }
        dispatch(toggleWishlist(product));
    };

    const prefetchProductDetail = () => {
        if (!product.slug) return;
        dispatch(
            productsApi.util.prefetch("getProductBySlug", product.slug, {
                ifOlderThan: 60,
            }),
        );
    };

    return (
        <Card
            className="group overflow-hidden border-transparent bg-muted/30 transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-md"
            data-testid="product-card"
            data-product-id={product._id || product.id}
            data-product-slug={product.slug}
        >
            {/* Image */}
            <Link
                to={ROUTES.PRODUCT_DETAIL(product.slug)}
                reloadDocument
                onMouseEnter={prefetchProductDetail}
                onFocus={prefetchProductDetail}
                data-testid="product-card-link"
            >
                <div
                    className="relative overflow-hidden bg-white p-4 dark:bg-muted/10"
                    style={{ aspectRatio: "4/3" }}
                >
                    {/* Badges */}
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
                        {hasFlashSale && (
                            <Badge className="flex items-center gap-1 border-0 bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background shadow-sm">
                                <Flame className="h-3 w-3" />
                                {"FLASH SALE"}
                            </Badge>
                        )}
                        {isOutOfStock && (
                            <Badge
                                variant="outline"
                                className="border-red-200 bg-red-50 text-[10px] text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                            >
                                {"Hết hàng"}
                            </Badge>
                        )}
                        {isNewProduct(product.createdAt) && (
                            <Badge className="bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                                {"Mới"}
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist button */}
                    <button
                        onClick={handleToggleWishlist}
                        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-[opacity,transform] group-hover:opacity-100 hover:scale-110 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        aria-label="Thêm vào yêu thích"
                        data-testid="wishlist-toggle"
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
                    <ResponsiveImage
                        src={
                            product.image ||
                            parseJsonField(product.images)?.[0] ||
                            productPlaceholder
                        }
                        fallbackSrc={productPlaceholder}
                        alt={product.name}
                        width={400}
                        height={300}
                        className={cn(
                            "h-full w-full object-contain transition-transform duration-500",
                            !isOutOfStock && "group-hover:scale-105",
                            isOutOfStock && "opacity-60",
                        )}
                        loading="lazy"
                    />
                </div>
            </Link>

            {/* Info */}
            <CardContent className="p-3 text-center">
                <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {product.category}
                </div>

                <Link
                    to={ROUTES.PRODUCT_DETAIL(product.slug)}
                    reloadDocument
                    onMouseEnter={prefetchProductDetail}
                    onFocus={prefetchProductDetail}
                >
                    <h3 className="line-clamp-1 text-sm font-semibold transition-colors hover:text-apple-blue">
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                    {isOutOfStock ? (
                        <span className="text-xs text-muted-foreground">
                            {"Liên hệ để đặt hàng"}
                        </span>
                    ) : (
                        <>
                            <span className={cn(
                                "text-sm font-semibold",
                                "text-foreground",
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
        </Card>
    );
}
