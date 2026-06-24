import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ShoppingCart,
} from "lucide-react";
import { useGetProductBySlugQuery, useIncrementVariantViewMutation } from "@/store/api/productsApi";
import { useAddToCartMutation } from "@/store/api/cartApi";
import { addToCart, removeFromCart } from "@/store/cartSlice";
import { toast } from "sonner";
import { toggleCartDrawer } from "@/store/uiSlice";
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
import { cn, formatPrice, parseJsonField } from "@/lib/utils";
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
import PersonalizedRecommendations from "@/features/products/PersonalizedRecommendations";
import SeoHead from "@/components/shared/SeoHead";
import ProductStructuredData from "@/components/shared/ProductStructuredData";
import BreadcrumbStructuredData from "@/components/shared/BreadcrumbStructuredData";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

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

    const [incrementView] = useIncrementVariantViewMutation();
    useEffect(() => {
        if (selectedVariant?.id) {
            incrementView(selectedVariant.id);
        }
    }, [selectedVariant?.id, incrementView]);

    const effectiveColor = selectedColor || selectedVariant?.color || "";
    const effectiveStorage = selectedStorage || selectedVariant?.storage || "";
    const effectiveRam = selectedRam || selectedVariant?.ram || "";
    const effectiveEdition = selectedEdition || selectedVariant?.edition || "";
    const effectiveRefreshRate = selectedVariant?.refreshRate || "";
    const effectiveSsd = selectedVariant?.ssd || "";

    const effectiveSelection = useMemo(() => ({
        color: effectiveColor,
        storage: effectiveStorage,
        ram: effectiveRam,
        edition: effectiveEdition,
    }), [effectiveColor, effectiveStorage, effectiveRam, effectiveEdition]);

    const invalidSelection = !selectedVariant && (selectedColor || selectedStorage || selectedRam || selectedEdition);

    const stock = selectedVariant?.stock ?? 0;
    const inStock = stock > 0;
    const isLowStock = inStock && stock <= 5;
    const marketingBadge = getProductMarketingBadge(selectedVariant);

    const displayOriginalPrice = selectedVariant?.price;
    const displaySalePrice = selectedVariant?.salePrice;
    const maxQuantity = Math.max(1, stock || 1);

    const productImages = useMemo(() => {
        const variantImages = parseJsonField(selectedVariant?.images);
        if (variantImages.length > 0) {
            return variantImages;
        }
        return Array.isArray(product?.images) ? product.images : [];
    }, [selectedVariant, product]);

    const isAuthenticated = useSelector(selectIsAuthenticated);

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
            } catch (err) {
                dispatch(removeFromCart({ variantId: selectedVariant.id }));
                const message = err?.data?.message || err?.message || "Thêm vào giỏ hàng thất bại";
                toast.error(message);
            }
        }
    };

    const handleBuyNow = async () => {
        if (!product || !selectedVariant?.id) return;
        dispatch(
            addToCart({
                product: { ...product, ...selectedVariant, variantId: selectedVariant.id, images: productImages },
                variantId: selectedVariant.id,
                quantity,
            }),
        );
        if (isAuthenticated) {
            try {
                await addToCartApi({ variantId: selectedVariant.id, quantity }).unwrap();
            } catch (err) {
                dispatch(removeFromCart({ variantId: selectedVariant.id }));
                const message = err?.data?.message || err?.message || "Không thể thêm vào giỏ hàng";
                toast.error(message);
                return;
            }
        }
        navigate(ROUTES.CHECKOUT);
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

    const categorySlug = product.category?.slug || product.categorySlug || "";
    const categoryDisplay = product.category?.name || categorySlug || "";
    const categoryHref = categorySlug ? `${ROUTES.PRODUCTS}?category=${encodeURIComponent(categorySlug)}` : ROUTES.PRODUCTS;
    const stickyPrice = displaySalePrice || displayOriginalPrice;

    return (
        <div className="section-padding pb-28 pt-8 md:py-12">
            <SeoHead
                title={product.name}
                description={product.description?.replace(/<[^>]*>/g, "").substring(0, 160) || product.name}
                image={product.image || product.images?.[0]}
                url={`/products/${product.slug}`}
                type="product"
            />
            <ProductStructuredData product={product} variant={selectedVariant} />
            <BreadcrumbStructuredData
                items={[
                    { name: "Trang chủ", url: "/" },
                    { name: "Sản phẩm", url: "/products" },
                    ...(categoryDisplay ? [{ name: categoryDisplay, url: categoryHref }] : []),
                    { name: product.name, url: `/products/${product.slug}` },
                ]}
            />
            <Breadcrumb
                items={[
                    { label: "Sản phẩm", href: ROUTES.PRODUCTS },
                    {
                        label: categoryDisplay,
                        href: categoryHref,
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

                    <h1 className="break-words text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
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

                    {(effectiveColor || effectiveStorage || effectiveRam || effectiveRefreshRate || effectiveSsd) && (
                        <p className="truncate text-sm text-muted-foreground">
                            {[effectiveColor, effectiveStorage, effectiveRam, effectiveRefreshRate, effectiveSsd].filter(Boolean).join(" · ")}
                        </p>
                    )}

                    {product.rating > 0 && (
                        <StarRating
                            rating={product.rating}
                            showCount
                            count={product.reviewCount}
                        />
                    )}

                    <PriceDisplay
                        price={displayOriginalPrice}
                        salePrice={displaySalePrice}
                        size="xl"
                        showBadge
                        showSaved
                    />

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
                            disabled={!inStock}
                        />
                    </div>

                    {isLowStock && (
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            {`Sắp hết hàng — chỉ còn ${stock} sản phẩm`}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!selectedVariant ? (
                            <Button size="lg" className="flex-1 rounded-full text-base" disabled>
                                {"Vui lòng chọn đầy đủ tuỳ chọn"}
                            </Button>
                        ) : inStock ? (
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
                                {"Hết hàng"}
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
                            {"Thêm vào giỏ hàng"}
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

            {/* Related */}
            <Separator className="my-12" />
            <RelatedProducts slug={slug} category={categorySlug} />

            <Separator className="my-12" />
            <PersonalizedRecommendations />

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
                        disabled={!selectedVariant || !inStock || isAddingToCart}
                    >
                        Mua ngay
                    </Button>
                    <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || !inStock || isAddingToCart}
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
