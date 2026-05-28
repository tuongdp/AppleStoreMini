import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Controller } from "swiper/modules";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { productPlaceholder } from "@/assets/images";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
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

    const prevImagesRef = useRef(images);
    useEffect(() => {
        if (prevImagesRef.current !== images) {
            prevImagesRef.current = images;
            setActiveIndex(0);
            if (mainSwiper) {
                mainSwiper.slideTo(0);
            }
        }
    }, [images, mainSwiper]);

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
                <div className="group/swiper relative aspect-square overflow-hidden rounded-2xl bg-muted/30">
                    <Swiper
                        modules={[Navigation, Pagination, Thumbs, Controller]}
                        onSwiper={setMainSwiper}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        navigation={{ prevEl: `#${prevId}`, nextEl: `#${nextId}` }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        loop={images.length >= 4}
                        className="h-full w-full"
                    >
                        {images.map((img, i) => (
                            <SwiperSlide key={i}>
                                <div className="flex h-full w-full items-center justify-center p-6">
                                    <ResponsiveImage
                                        src={img}
                                        fallbackSrc={productPlaceholder}
                                        alt={`${productName} - ${i + 1}`}
                                        width={600}
                                        height={600}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button
                        type="button"
                        onClick={() => openZoom(activeIndex)}
                        aria-label="Phóng to ảnh sản phẩm"
                        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-[background-color,opacity] duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:opacity-0 md:group-hover/swiper:opacity-100"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>

                    {images.length > 1 && (
                        <>
                            <Button
                                id={prevId}
                                variant="ghost"
                                size="icon"
                                aria-label="Ảnh trước"
                                className="absolute left-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                id={nextId}
                                variant="ghost"
                                size="icon"
                                aria-label="Ảnh tiếp theo"
                                className="absolute right-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>

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
                                        aria-label={`Xem ảnh sản phẩm ${i + 1}`}
                                        className={cn(
                                            "aspect-square w-full overflow-hidden rounded-xl bg-muted/30 p-1.5 ring-2 transition-[box-shadow,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                            i === activeIndex
                                                ? "ring-foreground opacity-100"
                                                : "ring-transparent opacity-50 hover:opacity-80",
                                        )}
                                    >
                                        <ResponsiveImage
                                            src={img}
                                            fallbackSrc={productPlaceholder}
                                            alt={`${productName} thumb ${i + 1}`}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-contain"
                                        />
                                    </button>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}
            </div>

            <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
                <DialogContent
                    className="border-none bg-black/95 p-0 max-w-[95vw] sm:max-w-[95vw] rounded-2xl"
                    showCloseButton={false}
                    aria-describedby={undefined}
                >
                    <div className="relative flex h-[85vh] w-full items-center justify-center">
                        <ResponsiveImage
                            src={images[zoomIndex]}
                            fallbackSrc={productPlaceholder}
                            alt={`${productName} - zoom ${zoomIndex + 1}`}
                            width={1200}
                            height={1200}
                            className="max-h-[90%] max-w-[90%] object-contain"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoomOpen(false)}
                            aria-label="Đóng ảnh phóng to"
                            className="absolute right-4 top-4 size-10 rounded-full bg-white/10 text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomPrev}
                                    aria-label="Ảnh trước"
                                    className="absolute left-4 top-1/2 size-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomNext}
                                    aria-label="Ảnh tiếp theo"
                                    className="absolute right-4 top-1/2 size-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
                            {zoomIndex + 1} / {images.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
