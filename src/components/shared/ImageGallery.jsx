import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import productPlaceholder from "@/assets/images/placeholder/product-placeholder.jpg";

export default function ImageGallery({ images = [], productName = "" }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(0);

    const selectedImage = images[selectedIndex];

    const handlePrev = useCallback(() => {
        setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }, [images.length]);

    const handleZoomPrev = () => {
        setZoomIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    };

    const handleZoomNext = () => {
        setZoomIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    };

    const openZoom = (index) => {
        setZoomIndex(index);
        setZoomOpen(true);
    };

    if (!images.length) return null;

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Main image */}
                <div className="group relative aspect-square overflow-hidden rounded-2xl bg-muted/30">
                    <div className="absolute inset-0 p-6">
                        <img
                            key={selectedIndex}
                            src={selectedImage}
                            alt={`${productName} - ảnh ${selectedIndex + 1}`}
                            className="h-full w-full object-contain"
                            onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                        />
                    </div>

                    {/* Zoom button */}
                    <button
                        onClick={() => openZoom(selectedIndex)}
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>

                    {/* Prev / Next arrows — chỉ hiện khi có nhiều hơn 1 ảnh */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrev}
                                className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNext}
                                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {/* Dot indicators — mobile */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedIndex(i)}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all",
                                        i === selectedIndex
                                            ? "w-4 bg-foreground"
                                            : "w-1.5 bg-foreground/30",
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnails — ẩn trên mobile */}
                {images.length > 1 && (
                    <div className="hidden gap-2 md:grid md:grid-cols-5">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedIndex(i)}
                                className={cn(
                                    "aspect-square overflow-hidden rounded-xl bg-muted/30 p-2 transition-all ring-2",
                                    i === selectedIndex
                                        ? "ring-foreground opacity-100"
                                        : "ring-transparent opacity-60 hover:opacity-100",
                                )}
                            >
                                <img
                                    src={img}
                                    alt={`${productName} thumbnail ${i + 1}`}
                                    className="h-full w-full object-contain"
                                    onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Zoom dialog */}
            <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
                <DialogContent className="max-w-3xl border-none bg-background/95 p-2 backdrop-blur-md">
                    <div className="relative aspect-square">
                        <img
                            src={images[zoomIndex]}
                            alt={`${productName} - zoom ${zoomIndex + 1}`}
                            className="h-full w-full object-contain"
                            onError={(e) => { e.currentTarget.src = productPlaceholder; }}
                        />

                        {/* Close */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoomOpen(false)}
                            className="absolute right-2 top-2 rounded-full bg-background/80"
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        {/* Prev / Next trong zoom */}
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomPrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {/* Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs backdrop-blur-sm">
                            {zoomIndex + 1} / {images.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
