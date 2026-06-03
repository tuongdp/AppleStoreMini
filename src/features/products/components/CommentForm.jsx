import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { commentSchema } from "@/lib/validations";
import { useCreateReviewMutation, useUpdateReviewMutation, useUploadReviewMediaMutation } from "@/store/api/productReviewApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { toast } from "sonner";

const isValidProductId = (value) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "undefined" &&
    value !== "null";

const isVideoUrl = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(url);

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
    const [uploadMedia, { isLoading: isUploading }] = useUploadReviewMediaMutation();
    const isLoading = isCreating || isUpdating || isUploading;

    const form = useForm({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            rating: 0,
            comment: "",
            images: [],
        },
    });

    useEffect(() => {
        if (comment) {
            form.reset({
                rating: comment.rating || 0,
                comment: comment.comment || "",
                images: comment.images || [],
            });
        }
    }, [comment, form]);

    const media = form.watch("images") || [];

    const addMediaFile = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const result = await uploadMedia(formData).unwrap();
            if (result?.url) {
                form.setValue("images", [...media, result.url], { shouldValidate: true });
            }
        } catch (error) {
            toast.error(error?.data?.message || "Tải hình ảnh/video lên thất bại");
        }
    };

    const removeMedia = (index) => {
        form.setValue(
            "images",
            media.filter((_, i) => i !== index),
            { shouldValidate: true },
        );
    };

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
            } else {
                const result = await createReview({
                    productId,
                    ...(orderId && { orderId }),
                    ...(orderItemId && { orderItemId }),
                    ...values,
                }).unwrap();
                toast.success(
                    result.pointsAwarded
                        ? `Đánh giá thành công, bạn đã nhận ${result.reviewRewardPoints?.toLocaleString("vi-VN") || 0} điểm thưởng`
                        : "Đánh giá thành công",
                );
            }

            if (isEditing) {
                toast.success("Đã cập nhật đánh giá");
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

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hình ảnh / video sản phẩm</FormLabel>
                            <div className="space-y-3">
                                <div>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                                            disabled={isLoading}
                                            onChange={(event) => {
                                                addMediaFile(event.target.files?.[0]);
                                                event.target.value = "";
                                            }}
                                        />
                                    </FormControl>
                                </div>
                                {isUploading && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Đang tải tệp lên...
                                    </div>
                                )}
                                {field.value?.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {field.value.map((url, index) => (
                                            <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                                                {isVideoUrl(url) ? (
                                                    <video src={url} className="h-full w-full object-cover" muted />
                                                ) : (
                                                    <ResponsiveImage src={url} alt="" width={120} height={120} className="h-full w-full object-cover" />
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute right-1 top-1 h-6 w-6 rounded-full"
                                                    onClick={() => removeMedia(index)}
                                                    aria-label="Xoá media đã tải lên"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <ImagePlus className="h-4 w-4" />
                                            <span>Gửi ít nhất 2 ảnh và 1 video để nhận điểm thưởng</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
