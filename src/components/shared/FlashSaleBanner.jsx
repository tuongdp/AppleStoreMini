import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Zap, ShoppingCart, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toggleCartDrawer } from "@/store/uiSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import productPlaceholder from "@/assets/images/placeholder/product-placeholder.jpg";

function CountdownTimer({ endTime }) {
    const calcRemaining = () => {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return { h: 0, m: 0, s: 0 };
        const totalSec = Math.floor(diff / 1000);
        return {
            h: Math.floor(totalSec / 3600),
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
        <div className="flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums">
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
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-44 rounded-xl" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function FlashSaleBanner({ flashSale, isLoading }) {
    const dispatch = useDispatch();

    const isExpired = useMemo(() => {
        if (!flashSale?.endTime) return true;
        return new Date(flashSale.endTime).getTime() <= Date.now();
    }, [flashSale?.endTime]);

    const handleAddToCart = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        const product = item.product || {};
        dispatch(addToCart({
            product: {
                ...product,
                price: item.originalPrice,
                salePrice: item.salePrice,
            },
            quantity: 1,
            selectedColor: product.color || "",
            selectedStorage: product.storage || "",
        }));
        dispatch(toggleCartDrawer(true));
    };

    if (isLoading) return <FlashSaleSkeleton />;
    if (!flashSale || isExpired || !flashSale.items?.length) return null;

    const items = flashSale.items;

    return (
        <section className="border-y border-border/50 bg-gradient-to-r from-destructive/5 via-card to-destructive/5">
            <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                        Xem tất cả <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="relative">
                    <Swiper
                        modules={[Autoplay]}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        slidesPerView={2}
                        spaceBetween={12}
                        breakpoints={{
                            480: { slidesPerView: 2 },
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                            1280: { slidesPerView: 6 },
                        }}
                        className="!pb-2"
                    >
                        {items.map((item) => {
                            const remaining = item.quantityLimit - item.quantitySold;
                            const soldPercent = item.quantityLimit > 0
                                ? Math.round((item.quantitySold / item.quantityLimit) * 100)
                                : 0;
                            const product = item.product || {};

                            return (
                                <SwiperSlide key={item.id}>
                                    <div className="group flex h-full flex-col rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-destructive/30 hover:shadow-sm">
                                        <Link
                                            to={product.slug ? ROUTES.PRODUCT_DETAIL(product.slug) : ROUTES.PRODUCTS}
                                            className="flex-1"
                                        >
                                            <div className="relative mb-2 flex items-center justify-center">
                                                <img
                                                    src={product.images?.[0] || productPlaceholder}
                                                    alt={product.name}
                                                    className="h-24 object-contain transition-transform duration-300 group-hover:scale-105 md:h-28"
                                                    loading="lazy"
                                                    onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                                                />
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute right-0 top-0 text-[10px] font-bold"
                                                >
                                                    -{item.discountPercent}%
                                                </Badge>
                                            </div>
                                            <p className="line-clamp-1 text-xs font-medium text-foreground">{product.name}</p>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span className="text-sm font-bold text-destructive">{formatPrice(item.salePrice)}</span>
                                                <span className="text-[10px] text-muted-foreground line-through">{formatPrice(item.originalPrice)}</span>
                                            </div>
                                            {item.quantityLimit > 0 && (
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                        <span>Đã bán {item.quantitySold}</span>
                                                        <span>Còn {remaining}</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-destructive transition-all"
                                                            style={{ width: `${Math.min(soldPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </Link>
                                        <Button
                                            size="sm"
                                            className="mt-3 w-full rounded-full text-xs"
                                            onClick={(e) => handleAddToCart(e, item)}
                                        >
                                            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                                            Thêm
                                        </Button>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
