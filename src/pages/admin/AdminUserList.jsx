import { useTranslation } from "@/i18n/useTranslation";
import AdminUserTable from "@/features/admin/components/users/AdminUserTable";

export default function AdminUserList() {
    const { t } = useTranslation("admin");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("user.title")}
                </h1>
            </div>
            <AdminUserTable />
        </div>
    );
}
