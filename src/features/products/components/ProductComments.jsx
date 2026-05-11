import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetCommentsQuery, useDeleteCommentMutation } from "@/store/api/commentsApi";
import { selectCurrentUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCommentSummary from "./ProductCommentSummary";
import ProductCommentItem from "./ProductCommentItem";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function ProductComments({ product }) {
    const productId = product?._id || product?.id;
    const currentUser = useSelector(selectCurrentUser);

    const [deleteId, setDeleteId] = useState(null);
    const [page, setPage] = useState(1);

    const { data, isLoading } = useGetCommentsQuery({
        type: "product",
        targetId: productId,
        params: { page, limit: 5 },
    });
    const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

    const comments = data ?? [];
    const pagination = {};

    const handleDelete = async () => {
        try {
            await deleteComment({
                type: "product",
                targetId: productId,
                commentId: deleteId,
            }).unwrap();
            toast.success("Đã xoá bình luận");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
                {"Bình luận từ khách hàng"}
            </h2>

            {/* Summary */}
            {product.rating > 0 && (
                <>
                    <ProductCommentSummary
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        distribution={product.ratingDistribution || {}}
                    />
                    <Separator />
                </>
            )}

            {/* Comment list */}
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
            ) : comments.length === 0 ? (
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
                    {comments.map((comment, index) => (
                        <div key={comment._id || comment.id}>
                            <ProductCommentItem
                                comment={comment}
                                currentUserId={
                                    currentUser?._id || currentUser?.id
                                }
                                onDelete={setDeleteId}
                            />
                            {index < comments.length - 1 && (
                                <Separator className="mt-6" />
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                {"Trước"}
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
                                {"Sau"}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Confirm delete */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={"Xoá bình luận"}
                description={"Hành động này không thể hoàn tác."}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
