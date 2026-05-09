import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Zap, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import ProductSlider from "@/components/shared/ProductSlider";
import ProductCard from "@/components/shared/ProductCard";

function CountdownTimer({ endTime }) {
    const { t } = useTranslation("common");
    const calcRemaining = () => {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
        const totalSec = Math.floor(diff / 1000);
        return {
            d: Math.floor(totalSec / 86400),
            h: Math.floor((totalSec % 86400) / 3600),
            m: Math.floor((totalSec % 3600) / 60),
            s: totalSec % 60,
        };
    };

    const [remaining, setRemaining] = useState(calcRemaining);

    useEffect(() => {
        const timer = setInterval(() => setRemaining(calcRemaining), 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    const pad = (n) => String(n).padStart(2, "0");

    return (
        <div className="flex items-center gap-1 font-mono text-lg font-bold tabular-nums">
            {remaining.d > 0 && (
                <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-xs text-destructive">
                        {pad(remaining.d)}
                    </span>
                    <span className="mr-0.5 text-[10px] text-muted-foreground">{t("timeAgo.day")}</span>
                </>
            )}
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-sm text-destructive">{pad(remaining.h)}</span>
            <span className="text-muted-foreground/40">:</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-sm text-destructive">{pad(remaining.m)}</span>
            <span className="text-muted-foreground/40">:</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-sm text-destructive">{pad(remaining.s)}</span>
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
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-full" />
                </div>
                <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-72 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function FlashSaleBanner({ flashSale, isLoading }) {
    const { t } = useTranslation("common");

    const isExpired = useMemo(() => {
        if (!flashSale?.endTime) return true;
        return new Date(flashSale.endTime).getTime() <= Date.now();
    }, [flashSale?.endTime]);

    const products = useMemo(() => {
        if (!flashSale?.items?.length) return [];
        return flashSale.items.map((item) => {
            const product = item.variant?.product || item.product;
            return {
                ...product,
                variantId: item.variant?.id || product?.variantId,
                price: item.originalPrice,
                salePrice: item.salePrice,
                stock: item.variant?.stock || product?.stock || 0,
                inStock: item.variant?.inStock ?? product?.inStock ?? true,
                color: item.variant?.color || "",
                storage: item.variant?.storage || "",
                category: product?.category?.name || product?.category || "",
                _flashSaleItem: item,
            };
        });
    }, [flashSale]);

    if (isLoading) return <FlashSaleSkeleton />;
    if (!flashSale || isExpired || !products.length) return null;

    return (
        <section className="border-y border-border/50 bg-gradient-to-r from-destructive/[0.03] via-card to-destructive/[0.03]">
            <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                                <Zap className="h-4 w-4 text-destructive" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground md:text-xl">{flashSale.title}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <CountdownTimer endTime={flashSale.endTime} />
                        </div>
                    </div>
                    <Link
                        to={`${ROUTES.PRODUCTS}?onSale=true`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                    >
                        {t("flashSale.viewAll")} <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <ProductSlider
                    products={products}
                    sliderId="flash-sale"
                    autoplayDelay={4000}
                    renderItem={(product) => (
                        <div className="group relative">
                            <ProductCard product={product} />
                            {product._flashSaleItem?.quantityLimit > 0 && (
                                <div className="px-3 pb-1">
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <span>{t("flashSale.sold")} {product._flashSaleItem.quantitySold}</span>
                                        <span>{t("flashSale.remaining")} {product._flashSaleItem.quantityLimit - product._flashSaleItem.quantitySold}</span>
                                    </div>
                                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-destructive transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    product._flashSaleItem.quantityLimit > 0
                                                        ? Math.round((product._flashSaleItem.quantitySold / product._flashSaleItem.quantityLimit) * 100)
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
                />
            </div>
        </section>
    );
}
