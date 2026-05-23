import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ResponsiveImage({
    src,
    fallbackSrc,
    alt,
    width,
    height,
    className,
    loading = "lazy",
    fetchPriority,
    ...props
}) {
    const [imageSrc, setImageSrc] = useState(src || fallbackSrc);

    useEffect(() => {
        setImageSrc(src || fallbackSrc);
    }, [src, fallbackSrc]);

    return (
        <img
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            fetchPriority={fetchPriority}
            className={cn("block", className)}
            onError={() => {
                if (fallbackSrc && imageSrc !== fallbackSrc) {
                    setImageSrc(fallbackSrc);
                }
            }}
            {...props}
        />
    );
}
