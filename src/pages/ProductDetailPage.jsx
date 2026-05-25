import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ShoppingCart,
    Heart,
    Zap,
    Clock,
} from "lucide-react";
import { useGetProductBySlugQuery, useGetProductsQuery } from "@/store/api/productsApi";
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
import ProductComments from "@/features/products/components/ProductComments";
import RelatedProducts from "@/features/products/components/RelatedProducts";
import { cn, formatPrice } from "@/lib/utils";
import {
    getProductMarketingBadge,
    getProductMarketingBadgeClassName,
} from "@/features/products/utils/productMarketingBadge";
import {
    findVariantForOption,
    getSelectedVariant,
    getVariantSelection,
    isOptionSelectable,
} from "@/features/products/utils/productVariantSelection";
import { ROUTES } from "@/lib/constants";
import AIComparePanel from "@/features/ai/AIComparePanel";
import AIReviewSummary from "@/features/ai/AIReviewSummary";

import CountdownTimer from "@/components/shared/CountdownTimer";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const { data, isLoading, isError } = useGetProductBySlugQuery(slug);

    const product = data;

    const { data: allProductsData } = useGetProductsQuery({ limit: 100, sort: "featured" });
    const allProducts = allProductsData?.products || [];

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

    const [selectedColor, setSelectedColor] = useState(() => searchParams.get("color") || "");
    const [selectedStorage, setSelectedStorage] = useState(() => searchParams.get("storage") || "");
    const [selectedRam, setSelectedRam] = useState(() => searchParams.get("ram") || "");
    const [selectedEdition, setSelectedEdition] = useState(() => searchParams.get("edition") || "");

    const currentSelection = useMemo(() => ({
        color: selectedColor,
        storage: selectedStorage,
        ram: selectedRam,
        edition: selectedEdition,
    }), [selectedColor, selectedStorage, selectedRam, selectedEdition]);

    const updateVariantUrl = (updates) => {
        setSearchParams((prevParams) => {
            const params = new URLSearchParams(prevParams);
            Object.entries(updates).forEach(([key, value]) => {
                if (value) params.set(key, value);
                else params.delete(key);
            });
            return params;
        }, { replace: true });
    };

    const selectVariantOptions = (updates) => {
        if (Object.prototype.hasOwnProperty.call(updates, "color")) setSelectedColor(updates.color || "");
        if (Object.prototype.hasOwnProperty.call(updates, "storage")) setSelectedStorage(updates.storage || "");
        if (Object.prototype.hasOwnProperty.call(updates, "ram")) setSelectedRam(updates.ram || "");
        if (Object.prototype.hasOwnProperty.call(updates, "edition")) setSelectedEdition(updates.edition || "");
        updateVariantUrl(updates);
    };

    const selectedVariant = useMemo(() => {
        return getSelectedVariant(variants, currentSelection);
    }, [variants, currentSelection]);

    const effectiveColor = selectedColor || selectedVariant?.color || "";
    const effectiveStorage = selectedStorage || selectedVariant?.storage || "";
    const effectiveRam = selectedRam || selectedVariant?.ram || "";
    const effectiveEdition = selectedEdition || selectedVariant?.edition || "";

    const effectiveSelection = useMemo(() => ({
        color: effectiveColor,
        storage: effectiveStorage,
        ram: effectiveRam,
        edition: effectiveEdition,
    }), [effectiveColor, effectiveStorage, effectiveRam, effectiveEdition]);

    const invalidSelection = !selectedVariant && (selectedColor || selectedStorage || selectedRam || selectedEdition);

    const inStock = selectedVariant?.inStock ?? false;
    const stock = selectedVariant?.stock ?? 0;
    const marketingBadge = getProductMarketingBadge(selectedVariant);

    const flashSaleData = selectedVariant?.flashSale ?? null;
    const [hasActiveFlashSale, setHasActiveFlashSale] = useState(false);

    useEffect(() => {
        if (!flashSaleData?.endTime || !flashSaleData?.salePrice) {
            setHasActiveFlashSale(false);
            return;
        }
        const check = () => {
            setHasActiveFlashSale(
                !!flashSaleData.salePrice &&
                new Date(flashSaleData.endTime).getTime() > Date.now()
            );
        };
        check();
        const timer = setInterval(check, 1000);
        return () => clearInterval(timer);
    }, [flashSaleData?.endTime, flashSaleData?.salePrice]);

    const displayOriginalPrice = (hasActiveFlashSale && flashSaleData) ? flashSaleData.originalPrice : selectedVariant?.price;
    const displaySalePrice = (hasActiveFlashSale && flashSaleData) ? null : selectedVariant?.salePrice;
    const flashSaleLimit = Number(flashSaleData?.quantityLimit) || 0;
    const flashSaleSold = Math.max(0, Number(flashSaleData?.quantitySold) || 0);
    const flashSaleRemaining = flashSaleLimit > 0 ? Math.max(0, flashSaleLimit - flashSaleSold) : null;
    const isFlashSaleSoldOut = hasActiveFlashSale && flashSaleLimit > 0 && flashSaleRemaining <= 0;
    const maxQuantity = isFlashSaleSoldOut ? 0 : Math.max(1, Math.min(stock || 99, flashSaleRemaining || stock || 99));

    const productImages = useMemo(() => {
        const variantImages = selectedVariant?.images || [];
        if (Array.isArray(variantImages) && variantImages.length > 0) {
            return variantImages;
        }
        return Array.isArray(product?.images) ? product.images : [];
    }, [selectedVariant, product]);

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isInWishlist = useSelector(selectIsInWishlist(product?.id));

    const [quantity, setQuantity] = useState(1);
    const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();

    useEffect(() => {
        setSelectedColor(searchParams.get("color") || "");
        setSelectedStorage(searchParams.get("storage") || "");
        setSelectedRam(searchParams.get("ram") || "");
        setSelectedEdition(searchParams.get("edition") || "");
        setQuantity(1);
    }, [slug, searchParams]);

    const handleOptionSelect = (field, value) => {
        const nextVariant = findVariantForOption(variants, field, value, effectiveSelection);
        if (nextVariant) {
            selectVariantOptions(getVariantSelection(nextVariant));
            return;
        }
        selectVariantOptions({ ...currentSelection, [field]: value });
    };

    useEffect(() => {
        if (quantity > maxQuantity && maxQuantity > 0) {
            setQuantity(maxQuantity);
        }
    }, [maxQuantity, quantity]);

    const handleAddToCart = async () => {
        if (!product || !selectedVariant?.id) return;
        if (isFlashSaleSoldOut) return;

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

        if (isAuthenticated) {
            try {
                await addToCartApi({
                    variantId: selectedVariant.id,
                    quantity,
                }).unwrap();
            } catch {
                // Local cart is already updated; server cart sync can retry later.
            }
        }
    };

    const handleBuyNow = async () => {
        if (!product || !selectedVariant?.id) return;
        if (isFlashSaleSoldOut) return;
        dispatch(
            addToCart({
                product: { ...product, ...selectedVariant, variantId: selectedVariant.id, images: productImages },
                variantId: selectedVariant.id,
                quantity,
            }),
        );
        if (isAuthenticated) {
            try { await addToCartApi({ variantId: selectedVariant.id, quantity }).unwrap(); } catch {}
        }
        navigate(ROUTES.CHECKOUT);
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
                    {"Không tìm thấy"}
                </p>
                <Button asChild variant="outline" className="rounded-full">
                    <Link to={ROUTES.PRODUCTS}>{"Thử lại"}</Link>
                </Button>
            </div>
        );
    }

    const categoryDisplay = product.category?.slug || product.categorySlug || "";
    const stickyPrice = hasActiveFlashSale && flashSaleData?.salePrice
        ? flashSaleData.salePrice
        : displaySalePrice || displayOriginalPrice;

    return (
        <div className="section-padding pb-28 pt-8 md:py-12">
            <Breadcrumb
                items={[
                    { label: "Sản phẩm", href: ROUTES.PRODUCTS },
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

                    {marketingBadge && (
                        <div>
                            <Badge
                                className={cn(getProductMarketingBadgeClassName(marketingBadge.tone))}
                                title={marketingBadge.title}
                            >
                                {marketingBadge.label}
                            </Badge>
                        </div>
                    )}

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

                    {hasActiveFlashSale && flashSaleData && (
                        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 dark:from-amber-400/15 dark:via-amber-300/5 dark:to-amber-400/15 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 dark:bg-amber-400/25">
                                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    FLASH SALE
                                </span>
                                <div className="ml-auto flex items-center gap-2 rounded-full border border-amber-500/20 bg-background/80 px-3 py-1 dark:border-amber-400/20">
                                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                    <CountdownTimer endTime={flashSaleData.endTime} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {formatPrice(flashSaleData.salePrice)}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through">
                                        {formatPrice(flashSaleData.originalPrice)}
                                    </span>
                                    <Badge className="rounded-md bg-amber-500 text-white text-xs hover:bg-amber-500 dark:bg-amber-400 dark:text-black">
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
                                            className="h-full rounded-full bg-amber-500 transition-[width] dark:bg-amber-400"
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
                                {"Màu sắc"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allColors.map((color) => {
                                    const disabled = !isOptionSelectable(variants, "color", color, effectiveSelection);
                                    return (
                                                    <button
                                                        key={color}
                                                        aria-pressed={effectiveColor === color}
                                                        onClick={() => handleOptionSelect("color", color)}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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
                                {"Dung lượng"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allStorages.map((storage) => {
                                    const disabled = !isOptionSelectable(variants, "storage", storage, effectiveSelection);
                                    return (
                                                    <button
                                                        key={storage}
                                                        aria-pressed={effectiveStorage === storage}
                                                        onClick={() => handleOptionSelect("storage", storage)}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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
                                {"RAM"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allRams.map((ram) => {
                                    const disabled = !isOptionSelectable(variants, "ram", ram, effectiveSelection);
                                    return (
                                        <button
                                            key={ram}
                                            aria-pressed={effectiveRam === ram}
                                            onClick={() => handleOptionSelect("ram", ram)}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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
                            <p className="mb-2 text-sm font-medium text-foreground">{"Phiên bản"}</p>
                            <div className="flex flex-wrap gap-2">
                                {allEditions.map((edition) => {
                                    const disabled = !isOptionSelectable(variants, "edition", edition, effectiveSelection);
                                    return (
                                        <button
                                            key={edition}
                                            aria-pressed={effectiveEdition === edition}
                                            onClick={() => handleOptionSelect("edition", edition)}
                                            disabled={disabled}
                                            className={cn(
                                                "rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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
                                {"Màu sắc"}
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
                                {"Dung lượng"}
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
                                {"RAM"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {allRams[0]}
                            </p>
                        </div>
                    )}

                    {/* Single edition display */}
                    {allEditions.length === 1 && allEditions[0] && (
                        <div>
                            <p className="mb-1 text-sm font-medium text-foreground">{"Phiên bản"}</p>
                            <p className="text-sm text-muted-foreground">{allEditions[0]}</p>
                        </div>
                    )}

                    {invalidSelection && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2">
                            <p className="text-sm font-medium text-destructive">
                                {"Tổ hợp màu sắc, dung lượng, RAM và phiên bản này không tồn tại"}
                            </p>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <p className="mb-3 text-sm font-medium text-foreground">
                            {"Số lượng"}
                        </p>
                        <QuantityInput
                            value={quantity}
                            min={1}
                            max={maxQuantity || 1}
                            onChange={setQuantity}
                            disabled={!inStock || isFlashSaleSoldOut}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!selectedVariant ? (
                            <Button size="lg" className="flex-1 rounded-full text-base" disabled>
                                {"Vui lòng chọn đầy đủ tuỳ chọn"}
                            </Button>
                        ) : inStock && !isFlashSaleSoldOut ? (
                            <Button
                                size="lg"
                                className="flex-1 rounded-full text-base"
                                onClick={handleBuyNow}
                                disabled={isAddingToCart}
                            >
                                {isAddingToCart ? "Đang thêm..." : "Mua ngay"}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="flex-1 rounded-full text-base"
                                disabled
                            >
                                {isFlashSaleSoldOut ? "Hết suất giảm sốc" : "Hết hàng"}
                            </Button>
                        )}
                        <Button
                            size="lg"
                            variant="outline"
                            className="flex-1 gap-2 rounded-full text-base"
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || !inStock || isFlashSaleSoldOut || isAddingToCart}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {"Thêm vào giỏ hàng"}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full"
                            onClick={handleToggleWishlist}
                            aria-label={isInWishlist ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
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
            <ProductComments product={product} />
            <Separator className="my-12" />
            <AIComparePanel currentProduct={product} products={allProducts} />
            <AIReviewSummary productSlug={slug} reviews={product.comments || product.reviews || []} />

            {/* Related */}
            <Separator className="my-12" />
            <RelatedProducts slug={slug} category={categoryDisplay} />

            <div
                data-testid="mobile-sticky-buy-bar"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
            >
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                            {product.name}
                        </p>
                        <p className="text-sm font-semibold text-apple-blue">
                            {stickyPrice ? formatPrice(stickyPrice) : "Liên hệ"}
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="rounded-full px-4"
                        onClick={handleBuyNow}
                        disabled={!selectedVariant || !inStock || isFlashSaleSoldOut || isAddingToCart}
                    >
                        Mua ngay
                    </Button>
                    <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || !inStock || isFlashSaleSoldOut || isAddingToCart}
                        aria-label="Thêm vào giỏ hàng"
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                </div>
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
