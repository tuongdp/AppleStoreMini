import { useState, useEffect, useMemo } from "react";
import { Clock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductSlider from "@/components/shared/ProductSlider";
import ProductCard from "@/components/shared/ProductCard";
import CountdownTimer from "@/components/shared/CountdownTimer";

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
    const [isExpired, setIsExpired] = useState(() => {
        if (!flashSale?.endTime) return true;
        return new Date(flashSale.endTime).getTime() <= Date.now();
    });

    useEffect(() => {
        if (!flashSale?.endTime) return;
        const timer = setInterval(() => {
            setIsExpired(new Date(flashSale.endTime).getTime() <= Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, [flashSale?.endTime]);

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
                    salePrice: item.salePrice,
                    originalPrice: item.originalPrice,
                    discountPercent: item.discountPercent,
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

    return (
        <section className="border-y border-amber-500/20 bg-gradient-to-r from-amber-500/[0.05] via-card to-amber-500/[0.05] dark:from-amber-400/[0.08] dark:via-card dark:to-amber-400/[0.08]">
            <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-400/20">
                                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground md:text-xl">{flashSale.title}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <CountdownTimer endTime={flashSale.endTime} />
                        </div>
                    </div>

                </div>

                <ProductSlider
                    products={products}
                    sliderId="flash-sale"
                    autoplayDelay={4000}
                    renderItem={(product) => (
                        <div className="group relative">
                            <ProductCard product={product} />
                            {product._flashSaleItem?.quantityLimit > 0 && (() => {
                                const limit = Number(product._flashSaleItem.quantityLimit) || 0;
                                const sold = Math.max(0, Number(product._flashSaleItem.quantitySold) || 0);
                                const remaining = Math.max(0, limit - sold);
                                const progress = limit > 0 ? Math.min(100, Math.round((sold / limit) * 100)) : 0;
                                return (
                                    <div className="px-3 pb-1">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>Đã bán {sold}</span>
                                            <span>{remaining > 0 ? `Còn ${remaining}` : "Hết suất"}</span>
                                        </div>
                                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-amber-500 transition-all dark:bg-amber-400"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                />
            </div>
        </section>
    );
}
