import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/lib/validations";
import {
    useCreateCommentMutation,
    useUpdateCommentMutation,
} from "@/store/api/commentsApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import StarRating from "@/components/shared/StarRating";
import { toast } from "sonner";

export default function CommentForm({
    productId,
    orderId,
    comment,
    onSuccess,
    onCancel,
}) {
    const isEditing = !!comment;
    const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
    const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
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
        try {
            if (isEditing) {
                await updateComment({
                    type: "product",
                    targetId: productId,
                    commentId: comment._id || comment.id,
                    ...values,
                }).unwrap();
            } else {
                await createComment({
                    type: "product",
                    targetId: productId,
                    ...(orderId && { orderId }),
                    ...values,
                }).unwrap();
            }

            toast.success("Bình luận của bạn đã được gửi");
            form.reset();
            onSuccess?.(values); // trả về data để OrderCard lưu vào commentedMap
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Rating */}
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{"Xếp hạng của bạn"}</FormLabel>
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

                {/* Comment */}
                <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{"Nhận xét của bạn"}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={"Chia sẻ trải nghiệm sử dụng sản phẩm..."}
                                    rows={4}
                                    disabled={isLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Actions */}
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
                            {"Huỷ"}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        className="rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Đang gửi..."
                            : "Gửi bình luận"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
