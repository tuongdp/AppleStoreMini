import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getPages(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    pages.push(total);

    return pages;
}

export default function Pagination({ page, totalPages, onPageChange }) {
    const pages = getPages(page, totalPages);

    return (
        <div className="flex items-center justify-center gap-1 pt-4">
            <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
                Trước
            </Button>

            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`dots-${i}`} className="w-8 text-center text-sm text-muted-foreground">
                        ...
                    </span>
                ) : (
                    <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="icon"
                        className={cn("h-8 w-8 rounded-full text-xs", p !== page && "text-muted-foreground")}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </Button>
                ),
            )}

            <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Sau
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
