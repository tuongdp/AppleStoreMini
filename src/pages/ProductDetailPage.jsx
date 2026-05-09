import { useState, useEffect, useRef, useMemo } from "react";
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

    const product = data;

    const variants = useMemo(() => product?.variants || [], [product]);

    const allColors = useMemo(() => {
        return [...new Set(variants.map((v) => v.color).filter(Boolean))];
    }, [variants]);

    const allStorages = useMemo(() => {
        return [...new Set(variants.map((v) => v.storage).filter(Boolean))];
    }, [variants]);

    const [selectedColor, setSelectedColor] = useState("");
    const [selectedStorage, setSelectedStorage] = useState("");

    const availableColors = useMemo(() => {
        if (selectedStorage) {
            return allColors.filter((c) =>
                variants.some((v) => v.color === c && v.storage === selectedStorage),
            );
        }
        return allColors;
    }, [allColors, variants, selectedStorage]);

    const availableStorages = useMemo(() => {
        if (selectedColor) {
            return allStorages.filter((s) =>
                variants.some((v) => v.storage === s && v.color === selectedColor),
            );
        }
        return allStorages;
    }, [allStorages, variants, selectedColor]);

    const selectedVariant = useMemo(() => {
        const match = variants.find(
            (v) =>
                v.color === selectedColor && v.storage === selectedStorage,
        );
        return match || null;
    }, [variants, selectedColor, selectedStorage]);

    const invalidSelection = !selectedVariant && selectedColor && selectedStorage;

    const currentPrice = selectedVariant?.salePrice || selectedVariant?.price;
    const inStock = selectedVariant?.inStock ?? false;
    const stock = selectedVariant?.stock ?? 0;

    const productImages = useMemo(() => {
        const variantImages = selectedVariant?.images || [];
        const productImages = product?.images || [];
        return Array.isArray(variantImages) && variantImages.length > 0
            ? variantImages
            : productImages;
    }, [selectedVariant, product]);

    useEffect(() => {
        if (variants.length > 0) {
            const first = variants[0];
            setSelectedColor(first.color || allColors[0] || "");
            setSelectedStorage(first.storage || allStorages[0] || "");
        }
    }, [variants, allColors, allStorages]);

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isInWishlist = useSelector(selectIsInWishlist(product?.id));

    const slugRef = useRef(slug);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (slugRef.current !== slug) {
            slugRef.current = slug;
            setQuantity(1);
        }
    }, [slug]);

    const handleAddToCart = () => {
        if (!product || !selectedVariant?.id) return;
        dispatch(
            addToCart({
                product: {
                    ...product,
                    ...selectedVariant,
                    variantId: selectedVariant.id,
                    images: productImages,
                },
                variantId: selectedVariant.id,
                quantity,
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

    const categoryDisplay = product.category?.slug || product.categorySlug || "";

    return (
        <div className="section-padding py-8 md:py-12">
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
                    product={{ ...product, images: productImages }}
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
                        salePrice={selectedVariant?.salePrice}
                        size="xl"
                        showBadge
                        showSaved
                    />

                    <Separator />

                    {/* Color selector */}
                    {allColors.length > 1 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-foreground">
                                {t("filter.color")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allColors.map((color) => {
                                    const disabled = selectedStorage
                                        ? !variants.some((v) => v.color === color && v.storage === selectedStorage)
                                        : false;
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setSelectedColor(color);
                                                if (
                                                    selectedStorage &&
                                                    !variants.some((v) => v.color === color && v.storage === selectedStorage)
                                                ) {
                                                    setSelectedStorage("");
                                                }
                                            }}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-all",
                                                !disabled && "hover:border-foreground",
                                                selectedColor === color
                                                    ? "border-apple-blue bg-apple-blue/10 text-apple-blue"
                                                    : disabled
                                                        ? "cursor-not-allowed border-dashed border-border text-muted-foreground/40 line-through"
                                                        : "border-border text-muted-foreground",
                                            )}
                                        >
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Storage selector */}
                    {allStorages.length > 1 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-foreground">
                                {t("filter.storage")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allStorages.map((storage) => {
                                    const disabled = selectedColor
                                        ? !variants.some((v) => v.storage === storage && v.color === selectedColor)
                                        : false;
                                    return (
                                        <button
                                            key={storage}
                                            onClick={() => {
                                                setSelectedStorage(storage);
                                                if (
                                                    selectedColor &&
                                                    !variants.some((v) => v.storage === storage && v.color === selectedColor)
                                                ) {
                                                    setSelectedColor("");
                                                }
                                            }}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-all",
                                                !disabled && "hover:border-foreground",
                                                selectedStorage === storage
                                                    ? "border-apple-blue bg-apple-blue/10 text-apple-blue"
                                                    : disabled
                                                        ? "cursor-not-allowed border-dashed border-border text-muted-foreground/40 line-through"
                                                        : "border-border text-muted-foreground",
                                            )}
                                        >
                                            {storage}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Single color display */}
                    {allColors.length === 1 && allColors[0] && (
                        <div>
                            <p className="mb-1 text-sm font-medium text-foreground">
                                {t("filter.color")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {allColors[0]}
                            </p>
                        </div>
                    )}

                    {/* Single storage display */}
                    {allStorages.length === 1 && allStorages[0] && (
                        <div>
                            <p className="mb-1 text-sm font-medium text-foreground">
                                {t("filter.storage")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {allStorages[0]}
                            </p>
                        </div>
                    )}

                    {invalidSelection && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2">
                            <p className="text-sm font-medium text-destructive">
                                Tổ hợp màu sắc và dung lượng này không tồn tại
                            </p>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <p className="mb-3 text-sm font-medium text-foreground">
                            {t("detail.quantity")}
                        </p>
                        <QuantityInput
                            value={quantity}
                            min={1}
                            max={stock || 99}
                            onChange={setQuantity}
                            disabled={!inStock}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!selectedVariant ? (
                            <Button size="lg" className="flex-1 rounded-full text-base" disabled>
                                Không có sẵn
                            </Button>
                        ) : inStock ? (
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
                            disabled={!selectedVariant || !inStock}
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
                                    isInWishlist && "fill-red-500 text-red-500",
                                )}
                            />
                        </Button>
                    </div>

                    <ProductSpecification
                        specifications={product.specifications || {}}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="mt-12">
                <ProductDescription description={product.description} />
            </div>

            {/* Trust badges */}
            <div className="mt-8">
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-muted/30 p-5 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {t("trust.freeShipping", { ns: "common" })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t("trust.freeShippingDesc", { ns: "common", defaultValue: "Đơn từ" })}{" "}
                                {formatPrice(SHIPPING.FREE_THRESHOLD)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {t("trust.warranty", { ns: "common" })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t("trust.warrantyDesc", { ns: "common" })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <RotateCcw className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {t("trust.returns", { ns: "common" })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t("trust.returnsDesc", { ns: "common" })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-12" />
            <ProductReviews product={product} />

            {/* Related */}
            <Separator className="my-12" />
            <RelatedProducts slug={slug} category={categoryDisplay} />
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
