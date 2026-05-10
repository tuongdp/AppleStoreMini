import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    ShoppingCart,
    Heart,
    Zap,
    Clock,
} from "lucide-react";
import { useGetProductBySlugQuery } from "@/store/api/productsApi";
import { useAddToCartMutation } from "@/store/api/cartApi";
import { addToCart } from "@/store/cartSlice";
import { toggleWishlist, selectIsInWishlist } from "@/store/wishlistSlice";
import { toggleCartDrawer, toggleAuthModal } from "@/store/uiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/shared/Breadcrumb";
import PriceDisplay from "@/components/shared/PriceDisplay";
import StarRating from "@/components/shared/StarRating";
import QuantityInput from "@/components/shared/QuantityInput";
import ProductImageGallery from "@/features/products/components/ProductImageGallery";
import ProductDescription from "@/features/products/components/ProductDescription";
import ProductSpecification from "@/features/products/components/ProductSpecification";
import SpecsAccordion from "@/components/shared/SpecsAccordion";
import ProductReviews from "@/features/products/components/ProductReviews";
import RelatedProducts from "@/features/products/components/RelatedProducts";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

function CountdownTimer({ endTime }) {
    const { t: tc } = useTranslation("common");
    const [remaining, setRemaining] = useState(null);

    useEffect(() => {
        const update = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) {
                setRemaining({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }
            const totalSec = Math.floor(diff / 1000);
            setRemaining({
                d: Math.floor(totalSec / 86400),
                h: Math.floor((totalSec % 86400) / 3600),
                m: Math.floor((totalSec % 3600) / 60),
                s: totalSec % 60,
            });
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    if (!remaining) return null;

    const pad = (n) => String(n).padStart(2, "0");

    return (
        <div className="flex items-center gap-1 font-mono tabular-nums">
            {remaining.d > 0 && (
                <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-xs font-bold text-destructive shadow-sm">
                        {pad(remaining.d)}
                    </span>
                    <span className="mr-0.5 text-[10px] font-medium text-destructive/70">
                        {tc("timeAgo.day")}
                    </span>
                </>
            )}
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-sm font-bold text-destructive shadow-sm">
                {pad(remaining.h)}
            </span>
            <span className="text-sm font-bold text-destructive/50">:</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-sm font-bold text-destructive shadow-sm">
                {pad(remaining.m)}
            </span>
            <span className="text-sm font-bold text-destructive/50">:</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-sm font-bold text-destructive shadow-sm">
                {pad(remaining.s)}
            </span>
        </div>
    );
}

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

    const allRams = useMemo(() => {
        return [...new Set(variants.map((v) => v.ram).filter(Boolean))];
    }, [variants]);

    const allEditions = useMemo(() => {
        return [...new Set(variants.map((v) => v.edition).filter(Boolean))];
    }, [variants]);

    const [selectedColor, setSelectedColor] = useState("");
    const [selectedStorage, setSelectedStorage] = useState("");
    const [selectedRam, setSelectedRam] = useState("");
    const [selectedEdition, setSelectedEdition] = useState("");

    const defaultVariant = useMemo(() => {
        if (!variants.length) return null;
        return variants.find((v) => v.inStock) || variants[0];
    }, [variants]);

    const defaultColor = defaultVariant?.color || "";
    const defaultStorage = defaultVariant?.storage || "";
    const defaultRam = defaultVariant?.ram || "";
    const defaultEdition = defaultVariant?.edition || "";

    const effectiveColor = selectedColor || defaultColor;
    const effectiveStorage = selectedStorage || defaultStorage;
    const effectiveRam = selectedRam || defaultRam;
    const effectiveEdition = selectedEdition || defaultEdition;

    const selectedVariant = useMemo(() => {
        if (!effectiveColor && !effectiveStorage && !effectiveRam && !effectiveEdition) return null;
        const match = variants.find(
            (v) =>
                (v.color || "") === effectiveColor &&
                (v.storage || "") === effectiveStorage &&
                (v.ram || "") === effectiveRam &&
                (v.edition || "") === effectiveEdition,
        );
        return match || null;
    }, [variants, effectiveColor, effectiveStorage, effectiveRam, effectiveEdition]);

    const invalidSelection = !selectedVariant && (effectiveColor || effectiveStorage || effectiveRam || effectiveEdition);

    const inStock = selectedVariant?.inStock ?? false;
    const stock = selectedVariant?.stock ?? 0;

    const flashSaleData = selectedVariant?.flashSale ?? null;
    const hasActiveFlashSale = flashSaleData &&
        flashSaleData.salePrice &&
        flashSaleData.endTime &&
        new Date(flashSaleData.endTime).getTime() > Date.now(); // eslint-disable-line react-hooks/purity

    const displayOriginalPrice = hasActiveFlashSale ? flashSaleData.originalPrice : selectedVariant?.price;
    const displaySalePrice = hasActiveFlashSale ? null : selectedVariant?.salePrice;

    const productImages = useMemo(() => {
        const variantImages = selectedVariant?.images || [];
        if (Array.isArray(variantImages) && variantImages.length > 0) {
            return variantImages;
        }
        return Array.isArray(product?.images) ? product.images : [];
    }, [selectedVariant, product]);

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isInWishlist = useSelector(selectIsInWishlist(product?.id));

    const slugRef = useRef(slug);
    const [quantity, setQuantity] = useState(1);
    const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();

    useEffect(() => {
        if (slugRef.current !== slug) {
            slugRef.current = slug;
            setSelectedColor("");
            setSelectedStorage("");
            setSelectedRam("");
            setSelectedEdition("");
            setQuantity(1);
        }
    }, [slug]);

    const handleAddToCart = async () => {
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

        try {
            await addToCartApi({
                variantId: selectedVariant.id,
                quantity,
            }).unwrap();
        } catch {
            // Server sync failed — UI already updated locally
        }
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
                    key={selectedVariant?.id || "product"}
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

                    {(effectiveColor || effectiveStorage || effectiveRam) && (
                        <p className="text-sm text-muted-foreground">
                            {[effectiveColor, effectiveStorage, effectiveRam].filter(Boolean).join(" · ")}
                        </p>
                    )}

                    {product.rating > 0 && (
                        <StarRating
                            rating={product.rating}
                            showCount
                            count={product.reviewCount}
                        />
                    )}

                    {hasActiveFlashSale && (
                        <div className="rounded-xl border border-destructive/30 bg-gradient-to-r from-destructive/10 via-orange-500/5 to-destructive/10 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/20">
                                    <Zap className="h-4 w-4 text-destructive" />
                                </div>
                                <span className="text-sm font-bold text-destructive">
                                    FLASH SALE
                                </span>
                                <div className="ml-auto flex items-center gap-2 rounded-full border border-destructive/20 bg-background/80 px-3 py-1">
                                    <Clock className="h-3.5 w-3.5 text-destructive" />
                                    <CountdownTimer endTime={flashSaleData.endTime} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-destructive">
                                        {formatPrice(flashSaleData.salePrice)}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through">
                                        {formatPrice(flashSaleData.originalPrice)}
                                    </span>
                                    <Badge variant="destructive" className="rounded-md text-xs">
                                        -{Math.round(((flashSaleData.originalPrice - flashSaleData.salePrice) / flashSaleData.originalPrice) * 100)}%
                                    </Badge>
                                </div>
                            </div>
                            {flashSaleData.quantityLimit > 0 && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Đã bán {flashSaleData.quantitySold || 0} / {flashSaleData.quantityLimit}</span>
                                        <span className="font-medium">
                                            {flashSaleData.quantityLimit > 0
                                                ? Math.round(((flashSaleData.quantitySold || 0) / flashSaleData.quantityLimit) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-destructive transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    flashSaleData.quantityLimit > 0
                                                        ? Math.round(((flashSaleData.quantitySold || 0) / flashSaleData.quantityLimit) * 100)
                                                        : 0,
                                                    100,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!hasActiveFlashSale && (
                        <PriceDisplay
                            price={displayOriginalPrice}
                            salePrice={displaySalePrice}
                            size="xl"
                            showBadge
                            showSaved
                        />
                    )}

                    <Separator />

                    {/* Color selector */}
                    {allColors.length > 1 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-foreground">
                                {t("filter.color")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allColors.map((color) => {
                                    const disabled = effectiveStorage
                                        ? !variants.some((v) => v.color === color && v.storage === effectiveStorage)
                                        : false;
                                    return (
                                                    <button
                                                        key={color}
                                                        onClick={() => {
                                                            setSelectedColor(color);
                                                            setSelectedRam("");
                                                            setSelectedEdition("");
                                                            const hasStorage = effectiveStorage &&
                                                                variants.some((v) => v.color === color && v.storage === effectiveStorage);
                                                            if (!hasStorage) {
                                                                const first = variants.find((v) => v.color === color)?.storage || "";
                                                                setSelectedStorage(first);
                                                            }
                                                        }}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-all",
                                                !disabled && "hover:border-foreground",
                                                effectiveColor === color
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
                                    const disabled = effectiveColor
                                        ? !variants.some((v) => v.storage === storage && v.color === effectiveColor)
                                        : false;
                                    return (
                                                    <button
                                                        key={storage}
                                                        onClick={() => {
                                                            setSelectedStorage(storage);
                                                            setSelectedRam("");
                                                            setSelectedEdition("");
                                                        }}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-all",
                                                !disabled && "hover:border-foreground",
                                                effectiveStorage === storage
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

                    {/* RAM selector */}
                    {allRams.length > 1 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-foreground">
                                {t("specification.ram")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allRams.map((ram) => {
                                    const disabled = effectiveColor && effectiveStorage
                                        ? !variants.some((v) => v.ram === ram && v.color === effectiveColor && v.storage === effectiveStorage)
                                        : false;
                                    return (
                                        <button
                                            key={ram}
                                            onClick={() => setSelectedRam(ram)}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-all",
                                                !disabled && "hover:border-foreground",
                                                effectiveRam === ram
                                                    ? "border-apple-blue bg-apple-blue/10 text-apple-blue"
                                                    : disabled
                                                        ? "cursor-not-allowed border-dashed border-border text-muted-foreground/40 line-through"
                                                        : "border-border text-muted-foreground",
                                            )}
                                        >
                                            {ram}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Edition selector */}
                    {allEditions.length > 1 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-foreground">{t("specification.edition")}</p>
                            <div className="flex flex-wrap gap-2">
                                {allEditions.map((edition) => {
                                    const disabled = effectiveColor && effectiveStorage && effectiveRam
                                        ? !variants.some((v) => v.edition === edition && v.color === effectiveColor && v.storage === effectiveStorage && v.ram === effectiveRam)
                                        : false;
                                    return (
                                        <button
                                            key={edition}
                                            onClick={() => setSelectedEdition(edition)}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-all",
                                                !disabled && "hover:border-foreground",
                                                effectiveEdition === edition
                                                    ? "border-apple-blue bg-apple-blue/10 text-apple-blue"
                                                    : disabled
                                                        ? "cursor-not-allowed border-dashed border-border text-muted-foreground/40 line-through"
                                                        : "border-border text-muted-foreground",
                                            )}
                                        >
                                            {edition}
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

                    {/* Single RAM display */}
                    {allRams.length === 1 && allRams[0] && (
                        <div>
                            <p className="mb-1 text-sm font-medium text-foreground">
                                {t("specification.ram")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {allRams[0]}
                            </p>
                        </div>
                    )}

                    {/* Single edition display */}
                    {allEditions.length === 1 && allEditions[0] && (
                        <div>
                            <p className="mb-1 text-sm font-medium text-foreground">{t("specification.edition")}</p>
                            <p className="text-sm text-muted-foreground">{allEditions[0]}</p>
                        </div>
                    )}

                    {invalidSelection && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2">
                            <p className="text-sm font-medium text-destructive">
                                {t("detail.invalidCombination")}
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
                                {t("detail.unavailable")}
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
                            disabled={!selectedVariant || !inStock || isAddingToCart}
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

                    <SpecsAccordion
                        specs={product.specifications || {}}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="mt-12">
                <ProductDescription description={product.description} />
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
