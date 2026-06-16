import { useState } from "react";
import { useGetReviewsQuery } from "@/store/api/productReviewApi";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductCommentSummary from "./ProductCommentSummary";
import ProductCommentItem from "./ProductCommentItem";

const PER_PAGE = 2;
const STAR_OPTIONS = [
    { label: "Tất cả", value: null },
    { label: "5", value: 5 },
    { label: "4", value: 4 },
    { label: "3", value: 3 },
    { label: "2", value: 2 },
    { label: "1", value: 1 },
];

export default function ProductComments({ product }) {
    const productId = product?._id || product?.id;

    const [page, setPage] = useState(1);
    const [starFilter, setStarFilter] = useState(null);
    const [mediaOnly, setMediaOnly] = useState(false);

    const params = {
        page,
        limit: PER_PAGE,
    };
    if (starFilter) params.rating = starFilter;
    if (mediaOnly) params.hasMedia = true;

    const { data, isLoading } = useGetReviewsQuery({
        productId,
        params,
    });

    const reviews = data?.reviews ?? [];
    const pagination = data?.pagination ?? {};

    const hasRating = product.rating > 0;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
                {"Bình luận từ khách hàng"}
            </h2>

            {/* Two columns on lg+ */}
            <div className={hasRating ? "lg:grid lg:grid-cols-2 lg:gap-10" : ""}>
                {/* Left: Rating summary */}
                {hasRating && (
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <ProductCommentSummary
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                            distribution={product.ratingDistribution || {}}
                        />
                        <Separator className="mt-6 lg:hidden" />
                    </div>
                )}

                {/* Right: Filters + Comment list */}
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {STAR_OPTIONS.map((opt) => (
                            <Button
                                key={opt.label}
                                variant={starFilter === opt.value ? "default" : "outline"}
                                size="sm"
                                className="h-8 rounded-full px-3 text-xs"
                                onClick={() => {
                                    setStarFilter(opt.value);
                                    setPage(1);
                                }}
                            >
                                {opt.value ? (
                                    <span className="flex items-center gap-1">
                                        {opt.value} <Star className="h-3 w-3 fill-current" />
                                    </span>
                                ) : (
                                    opt.label
                                )}
                            </Button>
                        ))}
                        <div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
                            <Checkbox
                                id="media-filter"
                                checked={mediaOnly}
                                onCheckedChange={(checked) => {
                                    setMediaOnly(Boolean(checked));
                                    setPage(1);
                                }}
                                className="h-3.5 w-3.5"
                            />
                            <label
                                htmlFor="media-filter"
                                className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground"
                            >
                                <Image className="h-3.5 w-3.5" />
                                Có ảnh / video
                            </label>
                        </div>
                    </div>

                    {/* Comment list */}
                    {isLoading ? (
                        <div className="space-y-6">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-sm font-medium text-foreground">
                                {"Chưa có bình luận nào"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {"Hãy là người đầu tiên bình luận về sản phẩm này"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((comment, index) => (
                                <div key={comment._id || comment.id}>
                                    <ProductCommentItem
                                        comment={comment}
                                    />
                                    {index < reviews.length - 1 && (
                                        <Separator className="mt-6" />
                                    )}
                                </div>
                            ))}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        {"Trước"}
                                    </Button>
                                    {[...Array(pagination.totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        const isActive = pageNum === page;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={isActive ? "default" : "outline"}
                                                size="icon-sm"
                                                className={cn(
                                                    "h-8 w-8 rounded-full text-xs",
                                                    !isActive && "text-muted-foreground",
                                                )}
                                                onClick={() => setPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        disabled={page >= pagination.totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        {"Sau"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
