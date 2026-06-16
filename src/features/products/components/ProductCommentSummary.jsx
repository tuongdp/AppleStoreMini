import StarRating from "@/components/shared/StarRating";

export default function ProductCommentSummary({
    rating = 0,
    reviewCount = 0,
    distribution = {},
}) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
                <span className="text-5xl font-bold text-foreground">
                    {rating.toFixed(1)}
                </span>
                <StarRating rating={rating} size="md" />
                <span className="text-xs text-muted-foreground">
                    {reviewCount} {"bình luận"}
                </span>
            </div>

            <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] || 0;
                    const pct =
                        reviewCount > 0
                            ? Math.round((count / reviewCount) * 100)
                            : 0;

                    return (
                        <div key={star} className="flex items-center gap-3">
                            <span className="w-3 shrink-0 text-xs text-muted-foreground">
                                {star}
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-amber-400 transition-[width] duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">
                                {pct}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
