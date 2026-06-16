import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isVideoUrl } from "@/lib/utils";

export default function ImageLightbox({ images = [], open, onClose, initialIndex = 0 }) {
  const [index, setIndex] = useState(initialIndex);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setIndex(initialIndex);
    setVideoError(false);
  }, [initialIndex, open]);

  const goPrev = useCallback(() => {
    setVideoError(false);
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setVideoError(false);
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || !images?.length) return null;

  const currentMedia = images[index];
  const isVideo = isVideoUrl(currentMedia);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-10 text-white hover:bg-white/20"
            onClick={goPrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-10 text-white hover:bg-white/20"
            onClick={goNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {isVideo ? (
        videoError ? (
          <div className="flex flex-col items-center gap-3 text-white">
            <Play className="h-12 w-12 opacity-50" />
            <p className="text-sm">Không thể phát video</p>
          </div>
        ) : (
          <video
            src={currentMedia}
            controls
            autoPlay
            playsInline
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
            onError={() => setVideoError(true)}
          />
        )
      ) : (
        <img
          src={currentMedia}
          alt={`Ảnh ${index + 1}`}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        />
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 text-sm text-white/70">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
