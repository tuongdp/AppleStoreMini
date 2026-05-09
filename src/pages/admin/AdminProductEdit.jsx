import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
    useGetProductByIdQuery,
    useUpdateProductMutation,
    useCreateVariantMutation,
    useUpdateVariantMutation,
    useDeleteVariantMutation,
} from "@/store/api/productsApi";
import AdminProductForm from "@/features/admin/components/products/AdminProductForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";

export default function AdminProductEdit() {
    const { t } = useTranslation("admin");
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const { data: product, isLoading, isError } = useGetProductByIdQuery(id);
    const [updateProduct] = useUpdateProductMutation();
    const [createVariant] = useCreateVariantMutation();
    const [updateVariant] = useUpdateVariantMutation();
    const [deleteVariant] = useDeleteVariantMutation();

    const handleSubmit = async (values) => {
        setIsSaving(true);
        try {
            const { variants, ...productData } = values;
            await updateProduct({ id, ...productData }).unwrap();

            const existingIds = new Set(
                (product?.variants || []).map((v) => v.id).filter(Boolean)
            );
            const submittedIds = new Set(
                variants.map((v) => v.id).filter(Boolean)
            );

            for (const variant of variants) {
                if (variant.id) {
                    const { id, ...variantData } = variant;
                    await updateVariant({ variantId: id, ...variantData }).unwrap();
                } else {
                    await createVariant({ productId: id, ...variant }).unwrap();
                }
            }

            const toDelete = [...existingIds].filter((vid) => !submittedIds.has(vid));
            for (const vid of toDelete) {
                await deleteVariant(vid).unwrap();
            }

            toast.success(t("product.updateSuccess"));
            navigate(ROUTES.ADMIN_PRODUCTS);
        } catch (error) {
            toast.error(error?.data?.message || t("status.error", { ns: "common" }));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <AdminProductEditSkeleton />;

    if (isError || !product) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="mb-4 text-muted-foreground">
                    {t("status.notFound", { ns: "common" })}
                </p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to={ROUTES.ADMIN_PRODUCTS}>{t("product.title")}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_PRODUCTS}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t("product.title")}
                </Link>
            </Button>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        {t("product.edit")}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {product.name}
                    </p>
                </div>

                <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} target="_blank">
                        {t("product.preview", { defaultValue: "Xem trang" })}
                    </Link>
                </Button>
            </div>

            <AdminProductForm
                product={product}
                onSubmit={handleSubmit}
                isLoading={isSaving}
            />
        </div>
    );
}

function AdminProductEditSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-24 rounded-full" />
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-9 w-24 rounded-full" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
