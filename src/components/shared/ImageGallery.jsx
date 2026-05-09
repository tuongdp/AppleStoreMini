import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Controller } from "swiper/modules";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import productPlaceholder from "@/assets/images/placeholder/product-placeholder.jpg";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

export default function ImageGallery({ images = [], productName = "" }) {
    const [mainSwiper, setMainSwiper] = useState(null);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
        mainSwiper?.slideTo(0);
    }, [images]);

    const openZoom = (index) => {
        setZoomIndex(index ?? activeIndex);
        setZoomOpen(true);
    };

    const handleZoomPrev = () => {
        setZoomIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    };

    const handleZoomNext = () => {
        setZoomIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    };

    if (!images.length) return null;

    const prevId = "gallery-nav-prev";
    const nextId = "gallery-nav-next";

    return (
        <>
            <div className="flex flex-col gap-3">
                {/* ── Main Swiper ── */}
                <div className="group/swiper relative aspect-square overflow-hidden rounded-2xl bg-muted/30">
                    <Swiper
                        modules={[Navigation, Pagination, Thumbs, Controller]}
                        onSwiper={setMainSwiper}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        navigation={{ prevEl: `#${prevId}`, nextEl: `#${nextId}` }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        loop={images.length > 1}
                        className="h-full w-full"
                    >
                        {images.map((img, i) => (
                            <SwiperSlide key={i}>
                                <div className="flex h-full w-full items-center justify-center p-6">
                                    <img
                                        src={img}
                                        alt={`${productName} - ${i + 1}`}
                                        className="h-full w-full object-contain"
                                        onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Zoom button */}
                    <button
                        type="button"
                        onClick={() => openZoom(activeIndex)}
                        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background md:opacity-0 md:group-hover/swiper:opacity-100"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>

                    {/* Prev / Next arrows */}
                    {images.length > 1 && (
                        <>
                            <Button
                                id={prevId}
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                id={nextId}
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>

                {/* ── Thumbnails Swiper ── */}
                {images.length > 1 && (
                    <div className="relative px-1">
                        <Swiper
                            modules={[Navigation, Thumbs, Controller]}
                            onSwiper={setThumbsSwiper}
                            watchSlidesProgress
                            spaceBetween={8}
                            slidesPerView="auto"
                            className="thumbs-swiper"
                        >
                            {images.map((img, i) => (
                                <SwiperSlide key={i} className="!w-16 md:!w-20">
                                    <button
                                        type="button"
                                        onClick={() => mainSwiper?.slideTo(i)}
                                        className={cn(
                                            "aspect-square w-full overflow-hidden rounded-xl bg-muted/30 p-1.5 transition-all ring-2",
                                            i === activeIndex
                                                ? "ring-foreground opacity-100"
                                                : "ring-transparent opacity-50 hover:opacity-80",
                                        )}
                                    >
                                        <img
                                            src={img}
                                            alt={`${productName} thumb ${i + 1}`}
                                            className="h-full w-full object-contain"
                                            onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                                        />
                                    </button>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}
            </div>

            {/* Zoom dialog */}
            <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
                <DialogContent
                    className="border-none bg-black/95 p-0 max-w-[95vw] sm:max-w-[95vw] rounded-2xl"
                    showCloseButton={false}
                >
                    <div className="relative flex h-[85vh] w-full items-center justify-center">
                        <img
                            src={images[zoomIndex]}
                            alt={`${productName} - zoom ${zoomIndex + 1}`}
                            className="max-h-[90%] max-w-[90%] object-contain"
                            onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                        />

                        {/* Close */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoomOpen(false)}
                            className="absolute right-4 top-4 size-10 rounded-full bg-white/10 text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* Prev / Next */}
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomPrev}
                                    className="absolute left-4 top-1/2 size-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomNext}
                                    className="absolute right-4 top-1/2 size-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}

                        {/* Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
                            {zoomIndex + 1} / {images.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
