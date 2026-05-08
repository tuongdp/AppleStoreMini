import { useTranslation } from "react-i18next";
import AdminCategoryList from "@/features/admin/components/categories/AdminCategoryList";

export default function AdminCategoryPage() {
    const { t } = useTranslation("admin");
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("category.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("category.subtitle")}
                </p>
            </div>
            <AdminCategoryList />
        </div>
    );
}
