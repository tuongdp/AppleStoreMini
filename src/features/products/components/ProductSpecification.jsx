import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ProductSpecification({ specifications = {} }) {
    const { t } = useTranslation("product");
    const [expanded, setExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const contentRef = useRef(null);

    const entries = Object.entries(specifications).filter(([, v]) => v);
    if (!entries.length) return null;

    useEffect(() => {
        if (contentRef.current) {
            setNeedsTruncation(contentRef.current.scrollHeight > 200);
        }
    }, [specifications]);

    return (
        <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
                {t("detail.specification")}
            </h3>
            <div
                ref={contentRef}
                className={cn(
                    "relative overflow-hidden",
                    !expanded && "max-h-[200px]",
                )}
            >
                <div className="space-y-0">
                    {entries.map(([key, value], index) => (
                        <div key={key}>
                            <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
                                <span className="shrink-0 text-muted-foreground">
                                    {t(`specification.${key}`) || key}
                                </span>
                                <span className="text-right font-medium text-foreground">
                                    {value}
                                </span>
                            </div>
                            {index < entries.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>
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
