import { useTranslation } from "react-i18next";
import AdminReviewList from "@/features/admin/components/reviews/AdminReviewList";

export default function AdminReviewPage() {
    const { t } = useTranslation("admin");
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("review.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("review.subtitle")}
                </p>
            </div>
            <AdminReviewList />
        </div>
    );
}
