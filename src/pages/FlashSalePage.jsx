import { useState, useEffect, useCallback } from "react";
import { Clock, Zap, ZapOff } from "lucide-react";
import { useGetActiveFlashSaleQuery } from "@/store/api/flashSalesApi";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ProductCard from "@/components/shared/ProductCard";

function CountdownTimer({ endTime }) {
    const calcRemaining = useCallback(() => {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
        const totalSec = Math.floor(diff / 1000);
        return {
            d: Math.floor(totalSec / 86400),
            h: Math.floor((totalSec % 86400) / 3600),
            m: Math.floor((totalSec % 3600) / 60),
            s: totalSec % 60,
        };
    }, [endTime]);

    const [remaining, setRemaining] = useState(calcRemaining);

    useEffect(() => {
        const timer = setInterval(() => setRemaining(calcRemaining()), 1000);
        return () => clearInterval(timer);
    }, [calcRemaining]);

    const pad = (n) => String(n).padStart(2, "0");

    return (
        <div className="flex items-center gap-1 font-mono text-lg font-bold tabular-nums">
            {remaining.d > 0 && (
                <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-xs text-destructive">
                        {pad(remaining.d)}
                    </span>
                    <span className="mr-0.5 text-[10px] text-muted-foreground">ngày</span>
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

function FlashSaleSection({ flashSale }) {
    const products = (flashSale.items || []).map((item) => {
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

    if (!products.length) return null;

    return (
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                            <Zap className="h-4 w-4 text-destructive" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">{flashSale.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <CountdownTimer endTime={flashSale.endTime} />
                    </div>
                </div>
                {flashSale.description && (
                    <p className="text-sm text-muted-foreground">{flashSale.description}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => (
                    <div key={`${flashSale.id}-${product.variantId || product.id}`} className="group relative">
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
                                        className="h-full rounded-full bg-destructive transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            );
                        })()}
                    </div>
                ))}
            </div>
        </section>
    );
}

function FlashSaleSkeleton() {
    return (
        <div>
            <Skeleton className="h-5 w-40 mb-6" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ZapOff className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Không có chương trình giảm sốc nào đang diễn ra</h2>
            <p className="mt-1 text-sm text-muted-foreground">Vui lòng quay lại sau để không bỏ lỡ ưu đãi hấp dẫn</p>
        </div>
    );
}

export default function FlashSalePage() {
    const { data: flashSaleData, isLoading } = useGetActiveFlashSaleQuery();
    const flashSales = Array.isArray(flashSaleData) ? flashSaleData : flashSaleData ? [flashSaleData] : [];

    const activeSales = flashSales.filter((fs) => {
        if (!fs.isActive) return false;
        const now = new Date();
        return new Date(fs.startTime) <= now && new Date(fs.endTime) >= now;
    });

    return (
        <div className="section-padding">
            <div className="mx-auto max-w-7xl section-y">
                <Breadcrumb
                    items={[{ label: "Trang chủ", href: "/" }, { label: "Giảm sốc" }]}
                    className="mb-6"
                />

                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Giảm sốc</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Săn ngay sản phẩm Apple với giá cực tốt, số lượng có hạn
                </p>

                <div className="mt-8 space-y-8">
                    {isLoading ? (
                        <FlashSaleSkeleton />
                    ) : activeSales.length === 0 ? (
                        <EmptyState />
                    ) : (
                        activeSales.map((fs) => (
                            <FlashSaleSection key={fs.id} flashSale={fs} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
