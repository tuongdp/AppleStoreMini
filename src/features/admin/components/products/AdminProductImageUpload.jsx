import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadProductImagesMutation } from "@/store/api/productsApi";
import { toast } from "sonner";
import { IMAGE } from "@/lib/constants";
import { cn, formatFileSize } from "@/lib/utils";
import productPlaceholder from "@/assets/images/placeholder/product-placeholder.jpg";

export default function AdminProductImageUpload({
    productId,
    images = [],
    onImagesChange,
}) {
    const { t } = useTranslation("admin");
    const inputRef = useRef(null);
    const [previews, setPreviews] = useState(images);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadImages, { isLoading: isUploading }] =
        useUploadProductImagesMutation();

    useEffect(() => {
        setPreviews(images.slice(0, IMAGE.MAX_COUNT));
    }, [images]);

    const handleFiles = async (files) => {
        const validFiles = Array.from(files).filter((file) => {
            if (!IMAGE.VALID_TYPES.includes(file.type)) {
                toast.error(
                    t("product.images") +
                        ": " +
                        t("validation.image.invalidFormat", {
                            ns: "validation",
                        }),
                );
                return false;
            }

            if (file.size > IMAGE.MAX_SIZE) {
                toast.error(
                    t("product.images") +
                        ": " +
                        t("validation.image.tooLarge", { ns: "validation" }),
                );
                return false;
            }

            return true;
        });

        if (!validFiles.length) return;

        if (previews.length + validFiles.length > IMAGE.MAX_COUNT) {
            toast.error(t("validation.image.tooMany", { ns: "validation" }));
            return;
        }

        // Preview locally
        const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
        const updated = [...previews, ...newPreviews];
        setPreviews(updated);
        onImagesChange?.(updated);

        // Upload nếu có productId
        if (productId) {
            try {
                const formData = new FormData();
                validFiles.forEach((file) => formData.append("images", file));

                const result = await uploadImages({ id: productId, formData }).unwrap();
                // Server đã gộp ảnh cũ + mới → dùng trực tiếp
                const serverImages = result?.images || [];
                setPreviews(serverImages);
                onImagesChange?.(serverImages);
                toast.success(t("product.updateSuccess"));
            } catch {
                // Upload thất bại → xoá preview blob
                const reverted = updated.slice(0, updated.length - validFiles.length);
                setPreviews(reverted);
                onImagesChange?.(reverted);
                toast.error(t("status.error", { ns: "common" }));
            }
        }

        // Reset input
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleRemove = (index) => {
        const updated = previews.filter((_, i) => i !== index);
        setPreviews(updated);
        onImagesChange?.(updated);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            {/* Upload zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
                    isDragging
                        ? "border-foreground bg-muted/30"
                        : "border-border hover:border-foreground/30 hover:bg-muted/20",
                    isUploading && "cursor-not-allowed opacity-50",
                )}
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                        {t("product.uploadImages")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("product.uploadImagesDesc")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        JPG, PNG, WEBP · {formatFileSize(IMAGE.MAX_SIZE)}
                    </p>
                </div>
                {isUploading && (
                    <p className="text-xs text-muted-foreground">
                        {t("table.loading")}
                    </p>
                )}
            </div>

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={IMAGE.VALID_TYPES.join(",")}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                disabled={isUploading}
            />

            {/* Preview grid */}
            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {previews.map((src, index) => (
                        <div
                            key={index}
                            className="group relative aspect-square overflow-hidden rounded-xl bg-muted/30"
                        >
                            <img
                                src={src}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-contain p-1"
                                onError={(e) => { if (!src.startsWith('blob:')) e.currentTarget.src = productPlaceholder; }}
                            />

                            {/* Order badge */}
                            <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-[10px] font-medium">
                                {index + 1}
                            </div>

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-white"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>

                            {/* Drag handle */}
                            <div className="absolute bottom-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {previews.length}/{IMAGE.MAX_COUNT} {t("product.images")}
            </p>
        </div>
    );
}
