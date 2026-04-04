import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
    useGetReviewsQuery,
    useDeleteReviewMutation,
} from "@/store/api/reviewsApi";
import { selectCurrentUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ProductReviewSummary from "./ProductReviewSummary";
import ProductReviewItem from "./ProductReviewItem";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function ProductReviews({ product }) {
    // ✅ MySQL integer id
    const productId = product?.id;
    const { t } = useTranslation("product");
    const currentUser = useSelector(selectCurrentUser);

    const [deleteId, setDeleteId] = useState(null);
    const [page, setPage] = useState(1);

    const { data, isLoading } = useGetReviewsQuery(
        { productId, params: { page, limit: 5 } },
        { skip: !productId },
    );
    const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

    // ✅ reviewsApi transformResponse → response.data trực tiếp
    // getReviews trả về data trực tiếp (không phải { reviews, pagination })
    // vì đây là single product reviews — check shape: thường là { reviews, pagination } hoặc array
    const reviews = Array.isArray(data) ? data : (data?.reviews ?? data ?? []);
    const pagination = data?.pagination ?? {};

    const handleDelete = async () => {
        try {
            await deleteReview(deleteId).unwrap();
            toast.success(t("review.deleteSuccess"));
        } catch {
            toast.error(t("status.error", { ns: "common" }));
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
                {t("review.title")}
            </h2>

            {product.rating > 0 && (
                <>
                    <ProductReviewSummary
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        distribution={product.ratingDistribution || {}}
                    />
                    <Separator />
                </>
            )}

            {isLoading ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
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
                        {t("review.noReviews")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t("review.noReviewsDesc")}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review, index) => (
                        // ✅ MySQL integer id
                        <div key={review.id}>
                            <ProductReviewItem
                                review={review}
                                // ✅ currentUser.id (integer), không có _id
                                currentUserId={currentUser?.id}
                                onDelete={setDeleteId}
                            />
                            {index < reviews.length - 1 && (
                                <Separator className="mt-6" />
                            )}
                        </div>
                    ))}

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                {t("pagination.prev", { ns: "common" })}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {page} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                {t("pagination.next", { ns: "common" })}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t("review.deleteReview")}
                description={t("confirm.deleteDesc", { ns: "common" })}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
