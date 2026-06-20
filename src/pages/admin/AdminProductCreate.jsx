import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useCreateProductMutation } from "@/store/api/productsApi";
import AdminProductForm from "@/features/admin/components/products/AdminProductForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";

export default function AdminProductCreate() {
    const navigate = useNavigate();
    const [createProduct] = useCreateProductMutation();
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (values) => {
        setIsSaving(true);
        try {
            const created = await createProduct({
                name: values.name.trim(),
                slug: values.slug.trim(),
                category: values.category,
                description: values.description || "",
                isActive: values.isActive ?? true,
            }).unwrap();
            toast.success("Tạo sản phẩm thành công");
            navigate(`${ROUTES.ADMIN_PRODUCT_EDIT(created.id)}`);
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_PRODUCTS}>
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    {"Quản lý sản phẩm"}
                </Link>
            </Button>

            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Tạo sản phẩm mới"}
                </h1>
            </div>

            <AdminProductForm onSubmit={handleSubmit} isLoading={isSaving} />
        </div>
    );
}
