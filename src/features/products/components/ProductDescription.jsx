import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDescription({ description }) {
    const { t } = useTranslation("product");
    const [expanded, setExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const contentRef = useRef(null);

    if (!description) return null;

    const isHtml = /<[a-z][\s\S]*>/i.test(description);

    useEffect(() => {
        if (contentRef.current) {
            setNeedsTruncation(contentRef.current.scrollHeight > 200);
        }
    }, [description]);

    return (
        <div>
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {t("detail.description")}
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
