import { useTranslation } from "react-i18next";
import AdminCouponList from "@/features/admin/components/coupons/AdminCouponList";

export default function AdminCouponPage() {
    const { t } = useTranslation("admin");
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("coupon.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("coupon.subtitle")}
                </p>
            </div>
            <AdminCouponList />
        </div>
    );
}
