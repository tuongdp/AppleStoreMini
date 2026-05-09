import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
            <h3 className="mb-3 text-lg font-semibold text-foreground">
                {t("detail.description")}
            </h3>
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
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="mt-1 h-auto px-0 text-sm text-apple-blue hover:text-apple-blue/80 hover:bg-transparent"
                >
                    {expanded ? "Thu gọn" : "Xem thêm"}
                    <ChevronDown
                        className={cn(
                            "ml-1 h-4 w-4 transition-transform",
                            expanded && "rotate-180",
                        )}
                    />
                </Button>
            )}
        </div>
    );
}
