import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductSpecification({ specifications = {} }) {
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
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {"Thông số kỹ thuật"}
                </h2>
                <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-apple-blue/60" />
            </div>
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
                                    {(SPECIFICATION_MAP[key] || key) || key}
                                </span>
                                <span className="text-right font-medium text-foreground">
                                    {value}
                                </span>
                            </div>
                            {index < entries.length - 1 && <div className="border-t border-border/50" />}
                        </div>
                    ))}
                </div>
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
