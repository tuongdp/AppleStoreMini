import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useState, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useCreateProductMutation, useUpdateProductMutation, useUploadEditorImageMutation } from "@/store/api/productsApi";
import AdminProductForm from "@/features/admin/components/products/AdminProductForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { uploadBlobImages } from "@/lib/utils";

export default function AdminProductCreate() {
    const { t } = useTranslation("admin");
    const navigate = useNavigate();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [uploadImage] = useUploadEditorImageMutation();
    const [isSaving, setIsSaving] = useState(false);
    const autoCreatedIdRef = useRef(null);

    const handleProductAutoCreated = (productId) => {
        autoCreatedIdRef.current = productId;
    };

    const handleSubmit = async (values) => {
        setIsSaving(true);
        try {
            const { productId, variants, specifications, ...productData } = values;
            const autoCreatedId = productId || autoCreatedIdRef.current;

            if (autoCreatedId) {
                await updateProduct({ id: autoCreatedId, ...productData, specifications }).unwrap();
                toast.success(t("product.updateSuccess"));
            } else {
                const processedVariants = await Promise.all(
                    (variants || []).map(async (v) => {
                        let images = v.images || [];
                        if (Array.isArray(images) && images.length > 0 && images.some((img) => typeof img === "string" && img.startsWith("blob:"))) {
                            images = await uploadBlobImages(images, (fd) => uploadImage(fd).unwrap());
                        }
                        return { ...v, images, price: Number(v.price) || 0, salePrice: v.salePrice ? Number(v.salePrice) : null, stock: Number(v.stock) || 0 };
                    })
                );

                await createProduct({
                    ...productData,
                    specifications,
                    variants: processedVariants,
                }).unwrap();

                toast.success(t("product.createSuccess"));
            }
            navigate(ROUTES.ADMIN_PRODUCTS);
        } catch (error) {
            toast.error(error?.data?.message || t("status.error", { ns: "common" }));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_PRODUCTS}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t("product.title")}
                </Link>
            </Button>

            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("product.create")}
                </h1>
            </div>

            <AdminProductForm onSubmit={handleSubmit} isLoading={isSaving} onProductAutoCreated={handleProductAutoCreated} />
        </div>
    );
}
