import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUNCATE_HEIGHT = 200;

export default function ProductDescription({ description }) {
    const [expanded, setExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const contentRef = useRef(null);

    const checkTruncation = useCallback(() => {
        if (contentRef.current) {
            const el = contentRef.current;
            const images = el.querySelectorAll("img");
            if (images.length > 0) {
                let loaded = 0;
                const onLoad = () => {
                    loaded++;
                    if (loaded === images.length) {
                        setNeedsTruncation(el.scrollHeight > TRUNCATE_HEIGHT + 10);
                    }
                };
                images.forEach((img) => {
                    if (img.complete) {
                        loaded++;
                    } else {
                        img.addEventListener("load", onLoad, { once: true });
                        img.addEventListener("error", onLoad, { once: true });
                    }
                });
                if (loaded === images.length) {
                    setNeedsTruncation(el.scrollHeight > TRUNCATE_HEIGHT + 10);
                }
            } else {
                setNeedsTruncation(el.scrollHeight > TRUNCATE_HEIGHT + 10);
            }
        }
    }, []);

    useEffect(() => {
        checkTruncation();
        window.addEventListener("resize", checkTruncation);
        return () => window.removeEventListener("resize", checkTruncation);
    }, [description, checkTruncation]);

    if (!description) return null;

    const isHtml = /<[a-z][\s\S]*>/i.test(description);

    return (
        <div>
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Mô tả sản phẩm
                </h2>
                <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-apple-blue/60" />
            </div>
            <div
                ref={contentRef}
                className={cn(
                    "relative overflow-hidden text-sm leading-relaxed text-muted-foreground",
                    !expanded && "max-h-[200px]",
                )}
            >
                {isHtml ? (
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                ) : (
                    <p className="whitespace-pre-line">{description}</p>
                )}
                {!expanded && needsTruncation && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
                )}
            </div>
            {needsTruncation && (
                <div className="mt-3 text-center">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-apple-blue transition-colors hover:text-apple-blue/70"
                    >
                        {expanded ? "Thu gọn" : "Xem thêm"}
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 transition-transform",
                                expanded && "rotate-180",
                            )}
                        />
                    </button>
                </div>
            )}
        </div>
    );
}
