import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    ShoppingCart,
    Heart,
    Truck,
    ShieldCheck,
    RotateCcw,
} from "lucide-react";
import { useGetProductBySlugQuery } from "@/store/api/productsApi";
import { addToCart } from "@/store/cartSlice";
import { toggleWishlist, selectIsInWishlist } from "@/store/wishlistSlice";
import { toggleCartDrawer, toggleAuthModal } from "@/store/uiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/shared/Breadcrumb";
import PriceDisplay from "@/components/shared/PriceDisplay";
import StarRating from "@/components/shared/StarRating";
import QuantityInput from "@/components/shared/QuantityInput";
import ProductColorPicker from "@/features/products/components/ProductColorPicker";
import ProductStoragePicker from "@/features/products/components/ProductStoragePicker";
import ProductImageGallery from "@/features/products/components/ProductImageGallery";
import ProductDescription from "@/features/products/components/ProductDescription";
import ProductSpecification from "@/features/products/components/ProductSpecification";
import ProductReviews from "@/features/products/components/ProductReviews";
import RelatedProducts from "@/features/products/components/RelatedProducts";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES, SHIPPING } from "@/lib/constants";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const { t } = useTranslation("product");
    const dispatch = useDispatch();

    const { data, isLoading, isError } = useGetProductBySlugQuery(slug);

    // ✅ getProductBySlugQuery transformResponse → response.data trực tiếp
    const product = data;

    const isAuthenticated = useSelector(selectIsAuthenticated);

    // ✅ MySQL integer id — không có _id
    const isInWishlist = useSelector(selectIsInWishlist(product?.id));

    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedStorage, setSelectedStorage] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setSelectedColor(null);
        setSelectedStorage(null);
        setQuantity(1);
    }, [slug]);

    const currentColor = selectedColor ?? product?.colors?.[0] ?? null;
    const currentStorage = selectedStorage ?? product?.storage?.[0] ?? null;
    const currentPrice = currentStorage?.price || product?.price;

    const handleAddToCart = () => {
        if (!product) return;
        dispatch(
            addToCart({
                product,
                quantity,
                selectedColor: currentColor?.label || "",
                selectedStorage: currentStorage?.label || "",
            }),
        );
        dispatch(toggleCartDrawer(true));
    };

    const handleToggleWishlist = () => {
        if (!isAuthenticated) {
            dispatch(toggleAuthModal(true));
            return;
        }
        dispatch(toggleWishlist(product));
    };

    if (isLoading) return <ProductDetailSkeleton />;

    if (isError || !product) {
        return (
            <div className="section-padding flex min-h-[60vh] flex-col items-center justify-center text-center">
                <p className="mb-4 text-muted-foreground">
                    {t("status.notFound", { ns: "common" })}
                </p>
                <Button asChild variant="outline" className="rounded-full">
                    <Link to={ROUTES.PRODUCTS}>{t("filter.reset")}</Link>
                </Button>
            </div>
        );
    }

    // ✅ BE trả categorySlug (vd: "iphone") — dùng để filter và display
    const categoryDisplay = product.categorySlug || "";

    return (
        <div className="section-padding py-8 md:py-12">
            <div className="mx-auto max-w-7xl">
                <Breadcrumb
                    items={[
                        { label: t("page.title"), href: ROUTES.PRODUCTS },
                        {
                            label: categoryDisplay,
                            href: `${ROUTES.PRODUCTS}?category=${categoryDisplay}`,
                        },
                        { label: product.name },
                    ]}
                    className="mb-8"
                />

                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20">
                    {/* ── Images ── */}
                    <ProductImageGallery
                        product={product}
                        selectedColor={currentColor}
                    />

                    {/* ── Info ── */}
                    <div className="flex flex-col gap-5">
                        <p className="text-sm font-medium uppercase tracking-wider text-apple-blue">
                            {categoryDisplay}
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                            {product.name}
                        </h1>

                        {product.rating > 0 && (
                            <StarRating
                                rating={product.rating}
                                showCount
                                count={product.reviewCount}
                            />
                        )}

                        <PriceDisplay
                            price={currentPrice}
                            originalPrice={product.originalPrice}
                            salePrice={product.salePrice}
                            size="xl"
                            showBadge
                            showSaved
                        />

                        <Separator />

                        {/* Color picker */}
                        <ProductColorPicker
                            colors={product.colors}
                            selectedColor={currentColor}
                            onChange={setSelectedColor}
                        />

                        {/* Storage picker */}
                        <ProductStoragePicker
                            storage={product.storage}
                            selectedStorage={currentStorage}
                            onChange={setSelectedStorage}
                        />

                        {/* Quantity */}
                        <div>
                            <p className="mb-3 text-sm font-medium text-foreground">
                                {t("detail.quantity")}
                            </p>
                            <QuantityInput
                                value={quantity}
                                min={1}
                                max={product.stock || 99}
                                onChange={setQuantity}
                                disabled={!product.inStock}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {product.inStock ? (
                                <Button
                                    size="lg"
                                    className="flex-1 rounded-full text-base"
                                    asChild
                                >
                                    <Link to={ROUTES.CHECKOUT}>
                                        {t("detail.buyNow")}
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="flex-1 rounded-full text-base"
                                    disabled
                                >
                                    {t("detail.outOfStock")}
                                </Button>
                            )}
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 gap-2 rounded-full text-base"
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {t("detail.addToCart")}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full"
                                onClick={handleToggleWishlist}
                            >
                                <Heart
                                    className={cn(
                                        "h-5 w-5",
                                        isInWishlist &&
                                            "fill-red-500 text-red-500",
                                    )}
                                />
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="space-y-3 rounded-2xl bg-muted/30 p-5">
                            <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Giao hàng miễn phí
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Đơn từ{" "}
                                        {formatPrice(SHIPPING.FREE_THRESHOLD)}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Bảo hành chính hãng 12 tháng
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Tại các trung tâm Apple ủy quyền
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <RotateCcw className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Đổi trả trong 7 ngày
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Hoàn tiền 100% nếu sản phẩm lỗi
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <ProductDescription
                                description={product.description}
                            />
                            <ProductSpecification
                                specifications={product.specifications}
                            />
                        </div>
                    </div>
                </div>

                {/* Reviews — truyền product.id (integer) */}
                <Separator className="my-12" />
                <ProductReviews product={product} />

                {/* Related — dùng categorySlug */}
                <Separator className="my-12" />
                <RelatedProducts slug={slug} category={categoryDisplay} />
            </div>
        </div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="section-padding py-8 md:py-12">
            <Skeleton className="mb-8 h-4 w-64" />
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20">
                <Skeleton className="aspect-square rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-px w-full" />
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-10 w-10 rounded-full"
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-10 w-20 rounded-xl"
                            />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-14 flex-1 rounded-full" />
                        <Skeleton className="h-14 flex-1 rounded-full" />
                        <Skeleton className="h-14 w-14 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
