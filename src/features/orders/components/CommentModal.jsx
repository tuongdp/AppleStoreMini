import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CommentForm from "@/features/products/components/CommentForm";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";

const getFirstImage = (...sources) => {
    for (const source of sources) {
        if (!source) continue;
        if (Array.isArray(source) && source[0]) return source[0];
        if (typeof source === "string") {
            try {
                const parsed = JSON.parse(source);
                if (Array.isArray(parsed) && parsed[0]) return parsed[0];
            } catch {
                if (source.trim()) return source;
            }
        }
    }
    return "";
};

export default function CommentModal({
    open,
    onOpenChange,
    product,
    image,
    productId,
    orderId,
    orderItemId,
    existingComment,
    onSuccess,
}) {
    const handleSuccess = (commentData) => {
        onSuccess?.(commentData);
        onOpenChange(false);
    };

    const isEditing = !!existingComment;
    const imageSrc = getFirstImage(image, product?.images, product?.image);
    const productName = product?.name || "Sản phẩm";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {isEditing
                            ? "Chỉnh sửa bình luận"
                            : "Viết bình luận"}
                    </DialogTitle>
                </DialogHeader>

                {(product || imageSrc) && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted p-1">
                            {imageSrc && (
                                <ResponsiveImage
                                    src={imageSrc}
                                    fallbackSrc={productPlaceholder}
                                    alt={productName}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-contain"
                                />
                            )}
                        </div>
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                            {productName}
                        </p>
                    </div>
                )}

                <CommentForm
                    productId={productId || product?.id || product?._id}
                    orderId={orderId}
                    orderItemId={orderItemId}
                    comment={existingComment}
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
