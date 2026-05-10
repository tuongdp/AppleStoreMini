import { useTranslation } from "@/i18n/useTranslation";
import AdminNewsList from "@/features/admin/components/news/AdminNewsList";

export default function AdminNewsPage() {
    const { t } = useTranslation("admin");
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("news.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("news.subtitle")}
                </p>
            </div>
            <AdminNewsList />
        </div>
    );
}
