import { useTranslation } from "@/i18n/useTranslation";
import AdminProductTable from "@/features/admin/components/products/AdminProductTable";

export default function AdminProductList() {
    const { t } = useTranslation("admin");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("product.title")}
                </h1>
            </div>
            <AdminProductTable />
        </div>
    );
}
