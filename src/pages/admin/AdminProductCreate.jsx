import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useCreateProductMutation, useCreateVariantMutation, useUploadEditorImageMutation } from "@/store/api/productsApi";
import AdminProductForm from "@/features/admin/components/products/AdminProductForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { uploadBlobImages } from "@/lib/utils";

export default function AdminProductCreate() {
    const { t } = useTranslation("admin");
    const navigate = useNavigate();
    const [createProduct] = useCreateProductMutation();
    const [createVariant] = useCreateVariantMutation();
    const [uploadImage] = useUploadEditorImageMutation();
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (values) => {
        setIsSaving(true);
        try {
            const { variants, specifications, ...productData } = values;

            const product = await createProduct({
                ...productData,
                specifications,
            }).unwrap();

            const productId = product.id;

            for (const variant of variants) {
                const variantData = { ...variant };
                if (Array.isArray(variantData.images) && variantData.images.length > 0) {
                    variantData.images = await uploadBlobImages(
                        variantData.images,
                        (fd) => uploadImage(fd).unwrap()
                    );
                }
                await createVariant({ productId, ...variantData }).unwrap();
            }

            toast.success(t("product.createSuccess"));
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

            <AdminProductForm onSubmit={handleSubmit} isLoading={isSaving} />
        </div>
    );
}
