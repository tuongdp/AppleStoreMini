import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/ProductCard";
import ProductCardSkeleton from "@/components/shared/ProductCardSkeleton";
import { cn } from "@/lib/utils";

/**
 * ProductSlider — slider sản phẩm dùng chung
 *
 * Props:
 *   products     — array sản phẩm
 *   isLoading    — hiển thị skeleton khi đang fetch
 *   skeletonCount — số skeleton card (default 4)
 *   sliderId     — id duy nhất để tránh xung đột nav button (required khi dùng nhiều slider cùng trang)
 *   autoplayDelay — ms giữa các slide (default 4000)
 *   renderItem   — custom render function (product) => JSX, mặc định dùng ProductCard
 */
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

    // Skeleton state
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

    return (
        <div className="group/slider relative">
            {/* Prev */}
            <Button
                id={prevId}
                variant="outline"
                size="icon"
                className={cn(
                    "absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-md",
                    "h-10 w-10 border-border bg-background/90 backdrop-blur-sm",
                    "opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100",
                )}
                aria-label={"Slide trước"}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Next */}
            <Button
                id={nextId}
                variant="outline"
                size="icon"
                className={cn(
                    "absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-md",
                    "h-10 w-10 border-border bg-background/90 backdrop-blur-sm",
                    "opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100",
                )}
                aria-label={"Slide tiếp"}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>

            <Swiper
                modules={[Navigation, Autoplay]}
                navigation={{ prevEl: `#${prevId}`, nextEl: `#${nextId}` }}
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
                    <SwiperSlide key={product._id || product.id}>
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
