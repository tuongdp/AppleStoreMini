import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ImageGallery({ images = [], productName = "" }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedImage = images[selectedIndex];

    const handlePrev = useCallback(() => {
        setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }, [images.length]);

    if (!images.length) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-muted/30">
                <Zoom>
                    <img
                        src={selectedImage}
                        alt={`${productName} - ảnh ${selectedIndex + 1}`}
                        className="h-full w-full object-contain p-6"
                    />
                </Zoom>

                {/* Prev / Next arrows */}
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
                                "aspect-square overflow-hidden rounded-xl bg-muted/30 p-2 transition-all",
                                i === selectedIndex
                                    ? "ring-2 ring-foreground"
                                    : "opacity-60 hover:opacity-100",
                            )}
                        >
                            <img
                                src={img}
                                alt={`${productName} thumbnail ${i + 1}`}
                                className="h-full w-full object-contain"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
