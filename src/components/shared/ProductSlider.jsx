import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/ProductCard";
import ProductCardSkeleton from "@/components/shared/ProductCardSkeleton";
import { cn } from "@/lib/utils";

export default function ProductSlider({
    products = [],
    isLoading = false,
    skeletonCount = 4,
    sliderId = "default",
    autoplayDelay = 4000,
    renderItem,
}) {
    const prevId = `swiper-prev-${sliderId}`;
    const nextId = `swiper-next-${sliderId}`;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                    {"Không có sản phẩm"}
                </p>
            </div>
        );
    }

    const hasNavigation = products.length > 1;

    return (
        <div className="group/slider relative">
            {hasNavigation && (
                <Button
                    id={prevId}
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                        "absolute left-2 top-1/2 z-20 size-10 -translate-y-1/2 rounded-full shadow-lg",
                        "border-border bg-background/95 text-foreground backdrop-blur-sm",
                        "transition-[opacity,transform,background-color] duration-200",
                        "hover:scale-105 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50",
                        "md:opacity-0 md:group-hover/slider:opacity-100 md:group-focus-within/slider:opacity-100",
                        "disabled:pointer-events-none disabled:opacity-0",
                    )}
                    aria-label="Slide trước"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            )}

            {hasNavigation && (
                <Button
                    id={nextId}
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                        "absolute right-2 top-1/2 z-20 size-10 -translate-y-1/2 rounded-full shadow-lg",
                        "border-border bg-background/95 text-foreground backdrop-blur-sm",
                        "transition-[opacity,transform,background-color] duration-200",
                        "hover:scale-105 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50",
                        "md:opacity-0 md:group-hover/slider:opacity-100 md:group-focus-within/slider:opacity-100",
                        "disabled:pointer-events-none disabled:opacity-0",
                    )}
                    aria-label="Slide tiếp"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            )}

            <Swiper
                modules={[Navigation, Autoplay]}
                navigation={hasNavigation ? { prevEl: `#${prevId}`, nextEl: `#${nextId}` } : false}
                autoplay={{
                    delay: autoplayDelay,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 },
                }}
                className="!pb-2"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.variantId || product._id || product.id}>
                        {renderItem ? (
                            renderItem(product)
                        ) : (
                            <ProductCard product={product} />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
