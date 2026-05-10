import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Zap, Flame, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import productPlaceholder from "@/assets/images/placeholder/product-placeholder.jpg";

function CountdownTimer({ endTime }) {
    const { t } = useTranslation("common");
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
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-destructive shadow-sm">
                        {pad(remaining.d)}
                    </span>
                    <span className="mr-0.5 text-[10px] font-medium text-destructive/70">
                        {t("timeAgo.day")}
                    </span>
                </>
            )}
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-destructive shadow-sm">
                {pad(remaining.h)}
            </span>
            <span className="text-base font-bold text-destructive/50">:</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-destructive shadow-sm">
                {pad(remaining.m)}
            </span>
            <span className="text-base font-bold text-destructive/50">:</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-destructive shadow-sm">
                {pad(remaining.s)}
            </span>
        </div>
    );
}

function FlashSaleSkeleton() {
    return (
        <section className="border-y border-border bg-card">
            <div className="mx-auto max-w-7xl px-6 py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-10 w-44" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-full" />
                </div>
                <div className="mt-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                        <Skeleton className="lg:col-span-2 lg:row-span-2 h-80 rounded-xl" />
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-60 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FlashProductMiniCard({ product, t }) {
    const { salePrice, price, _flashSaleItem } = product;
    const quantityLimit = _flashSaleItem?.quantityLimit || 0;
    const quantitySold = _flashSaleItem?.quantitySold || 0;
    const stock = product.stock ?? 0;
    const percentSold = quantityLimit > 0 ? Math.round((quantitySold / quantityLimit) * 100) : 0;
    const isHot = percentSold > 50;
    const isLowStock = stock < 10 && stock > 0;
    const imgSrc = product.images?.[0] || product.image || productPlaceholder;

    return (
        <Link
            to={`/products/${product.slug}`}
            className="group block rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-destructive/30 hover:shadow-md"
        >
            <div className="flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white p-1 dark:bg-muted/10">
                    <img
                        src={imgSrc}
                        alt={product.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                    />
                    {isHot && (
                        <div className="absolute -left-0.5 -top-0.5 flex items-center gap-0.5 rounded-br-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground">
                            <Flame className="h-2.5 w-2.5" />
                            Hot
                        </div>
                    )}
                    {isLowStock && (
                        <div className="absolute -right-0.5 -top-0.5 rounded-bl-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            <Zap className="mr-0.5 inline h-2.5 w-2.5" />
                            {t("flashSale.almostGone")}
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <h4 className="line-clamp-2 text-xs font-semibold text-foreground group-hover:text-destructive">
                        {product.name}
                    </h4>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-destructive">
                            {formatPrice(salePrice)}
                        </span>
                        <span className="text-[10px] text-muted-foreground line-through">
                            {formatPrice(price)}
                        </span>
                        <Badge variant="destructive" className="h-4 rounded-sm px-1 text-[9px]">
                            -{Math.round(((price - salePrice) / price) * 100)}%
                        </Badge>
                    </div>
                    <div className="mt-1.5">
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                            <span>{t("flashSale.sold")} {quantitySold}</span>
                            <span>{quantityLimit - quantitySold} {t("flashSale.remaining").toLowerCase()}</span>
                        </div>
                        <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    isHot ? "bg-destructive" : "bg-orange-400",
                                )}
                                style={{ width: `${Math.min(percentSold, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function FlashHeroProduct({ product, t }) {
    const { salePrice, price, _flashSaleItem } = product;
    const quantityLimit = _flashSaleItem?.quantityLimit || 0;
    const quantitySold = _flashSaleItem?.quantitySold || 0;
    const stock = product.stock ?? 0;
    const percentSold = quantityLimit > 0 ? Math.round((quantitySold / quantityLimit) * 100) : 0;
    const isHot = percentSold > 50;
    const isLowStock = stock < 10 && stock > 0;
    const imgSrc = product.images?.[0] || product.image || productPlaceholder;
    const discount = Math.round(((price - salePrice) / price) * 100);

    return (
        <Link
            to={`/products/${product.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-destructive/30 hover:shadow-lg"
        >
            {isHot && (
                <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground shadow-md">
                    <Flame className="h-3.5 w-3.5" />
                    Hot
                </div>
            )}
            {isLowStock && (
                <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-md"
                    style={isHot ? { marginTop: "2.25rem" } : {}}
                >
                    <Zap className="h-3.5 w-3.5" />
                    {t("flashSale.almostGone")}
                </div>
            )}
            <div className="flex flex-1 items-center justify-center bg-white p-6 dark:bg-muted/10">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="h-48 w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                />
            </div>
            <div className="flex flex-col gap-2 border-t border-border/50 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-destructive">
                    {product.name}
                </h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-destructive">
                        {formatPrice(salePrice)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(price)}
                    </span>
                    <Badge variant="destructive" className="rounded-md px-1.5 text-xs">
                        -{discount}%
                    </Badge>
                </div>
                <div className="mt-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium">
                            {t("flashSale.sold")} {quantitySold} / {quantityLimit}
                        </span>
                        <span>{percentSold}%</span>
                    </div>
                    <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isHot ? "bg-destructive" : "bg-orange-400",
                            )}
                            style={{ width: `${Math.min(percentSold, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function FlashSaleBanner({ flashSale, isLoading }) {
    const { t } = useTranslation("common");

    // eslint-disable-next-line react-hooks/purity
    const isExpired = !flashSale?.endTime || new Date(flashSale.endTime).getTime() <= Date.now();

    const products = useMemo(() => {
        if (!flashSale?.items?.length) return [];
        return flashSale.items.map((item) => {
            const product = item.variant?.product || item.product;
            const variantImages = Array.isArray(item.variant?.images) && item.variant.images.length > 0
                ? item.variant.images
                : null;
            return {
                ...product,
                ...(variantImages ? { images: variantImages } : {}),
                variantId: item.variant?.id || product?.variantId,
                price: item.originalPrice,
                salePrice: item.salePrice,
                stock: item.variant?.stock || product?.stock || 0,
                inStock: item.variant?.inStock ?? product?.inStock ?? true,
                color: item.variant?.color || "",
                storage: item.variant?.storage || "",
                category: product?.category?.name || product?.category || "",
                flashSale: {
                    originalPrice: item.originalPrice,
                    salePrice: item.salePrice,
                    quantityLimit: item.quantityLimit,
                    quantitySold: item.quantitySold,
                    endTime: flashSale.endTime,
                },
                _flashSaleItem: item,
            };
        });
    }, [flashSale]);

    if (isLoading) return <FlashSaleSkeleton />;
    if (!flashSale || isExpired || !products.length) return null;

    const heroProduct = products[0];
    const remainingProducts = products.slice(1);

    return (
        <section className="border-y border-border/50 bg-gradient-to-r from-red-500/10 via-orange-500/5 to-red-500/10">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15 shadow-sm">
                                <Zap className="h-5 w-5 text-destructive" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground md:text-2xl">
                                {flashSale.title || t("flashSale.title")}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1.5">
                            <Clock className="h-4 w-4 text-destructive" />
                            <CountdownTimer endTime={flashSale.endTime} />
                        </div>
                    </div>
                    <Link
                        to="/flash-sale"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-destructive transition-colors hover:text-destructive/80"
                    >
                        {t("flashSale.viewAll")} <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
                        <FlashHeroProduct product={heroProduct} t={t} />
                    </div>
                    {remainingProducts.map((product) => (
                        <div key={product._id || product.id || product.variantId}>
                            <FlashProductMiniCard product={product} t={t} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
