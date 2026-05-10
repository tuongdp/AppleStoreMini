import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ReviewForm from "@/features/products/components/ReviewForm";

// ✅ images có thể là JSON string (MySQL) hoặc array đã parse
const getFirstImage = (images) => {
    if (!images) return "";
    if (Array.isArray(images)) return images[0] || "";
    try {
        return JSON.parse(images)[0] || "";
    } catch {
        return "";
    }
};

export default function ReviewModal({
    open,
    onOpenChange,
    product,
    orderId,
    existingReview,
    onSuccess,
}) {
    const handleSuccess = (reviewData) => {
        onSuccess?.(reviewData);
        onOpenChange(false);
    };

    const isEditing = !!existingReview;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {isEditing
                            ? "Chỉnh sửa đánh giá"
                            : "Viết đánh giá"}
                    </DialogTitle>
                </DialogHeader>

                {product && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted p-1">
                            <img
                                // ✅ parse JSON string nếu cần
                                src={getFirstImage(product.images)}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                            {product.name}
                        </p>
                    </div>
                )}

                <ReviewForm
                    // ✅ MySQL integer id — không có _id
                    productId={product?.id}
                    orderId={orderId}
                    review={existingReview}
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
