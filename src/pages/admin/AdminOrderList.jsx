import { useTranslation } from "@/i18n/useTranslation";
import AdminOrderTable from "@/features/admin/components/orders/AdminOrderTable";

export default function AdminOrderList() {
    const { t } = useTranslation("admin");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("order.title")}
                </h1>
            </div>
            <AdminOrderTable />
        </div>
    );
}
