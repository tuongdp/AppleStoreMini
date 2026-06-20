import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { commentSchema } from "@/lib/validations";
import { useCreateReviewMutation, useUpdateReviewMutation } from "@/store/api/productReviewApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import StarRating from "@/components/shared/StarRating";
import { toast } from "sonner";

const isValidProductId = (value) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "undefined" &&
    value !== "null";

export default function CommentForm({
    productId,
    orderId,
    orderItemId,
    comment,
    onSuccess,
    onCancel,
}) {
    const isEditing = !!comment;
    const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
    const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
    const isLoading = isCreating || isUpdating;

    const form = useForm({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            rating: 0,
            comment: "",
        },
    });

    useEffect(() => {
        if (comment) {
            form.reset({
                rating: comment.rating || 0,
                comment: comment.comment || "",
            });
        }
    }, [comment, form]);

    const onSubmit = async (values) => {
        if (!isValidProductId(productId)) {
            toast.error("Không xác định được sản phẩm, vui lòng thử lại");
            return;
        }
        try {
            if (isEditing) {
                await updateReview({
                    productId,
                    reviewId: comment._id || comment.id,
                    ...values,
                }).unwrap();
                toast.success("Đã cập nhật đánh giá");
            } else {
                await createReview({
                    productId,
                    ...(orderId && { orderId }),
                    ...(orderItemId && { orderItemId }),
                    ...values,
                }).unwrap();
                toast.success("Đánh giá thành công");
            }
            form.reset();
            onSuccess?.(values);
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Đánh giá sản phẩm</FormLabel>
                            <FormControl>
                                <StarRating
                                    rating={field.value}
                                    size="lg"
                                    interactive
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ── Comment text ── */}
                <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Viết đánh giá</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
                                    rows={4}
                                    disabled={isLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        className="rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
