import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n/useTranslation";
import { reviewSchema } from "@/lib/validations";
import {
    useCreateReviewMutation,
    useUpdateReviewMutation,
} from "@/store/api/reviewsApi";
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

export default function ReviewForm({
    productId,
    orderId,
    review,
    onSuccess,
    onCancel,
}) {
    const { t } = useTranslation("product");
    const isEditing = !!review;
    const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
    const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
    const isLoading = isCreating || isUpdating;

    const form = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
        },
    });

    useEffect(() => {
        if (review) {
            form.reset({
                rating: review.rating || 0,
                comment: review.comment || "",
            });
        }
    }, [review, form]);

    const onSubmit = async (values) => {
        try {
            if (isEditing) {
                await updateReview({
                    reviewId: review._id || review.id,
                    ...values,
                }).unwrap();
            } else {
                await createReview({
                    productId,
                    ...(orderId && { orderId }),
                    ...values,
                }).unwrap();
            }

            toast.success(t("review.success"));
            form.reset();
            onSuccess?.(values); // trả về data để OrderCard lưu vào reviewedMap
        } catch {
            toast.error(t("status.error", { ns: "common" }));
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
                            <FormLabel>{t("review.yourRating")}</FormLabel>
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
                            <FormLabel>{t("review.yourComment")}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t("review.commentPlaceholder")}
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
                            {t("btn.cancel", { ns: "common" })}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        className="rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? t("review.submitting")
                            : t("review.submitReview")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
