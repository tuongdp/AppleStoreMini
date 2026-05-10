import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { ChevronLeft } from "lucide-react";
import { useCreateNewsMutation } from "@/store/api/newsApi";
import AdminNewsForm from "@/features/admin/components/news/AdminNewsForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminNewsCreate() {
    const { t } = useTranslation("admin");
    const navigate = useNavigate();
    const [createNews, { isLoading }] = useCreateNewsMutation();

    const handleSubmit = async (values) => {
        try {
            await createNews(values).unwrap();
            toast.success(t("news.createSuccess"));
        } catch (error) {
            toast.error(error?.data?.message || t("flashSale.toast.errorOccurred"));
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/admin/news">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t("news.title")}
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("news.create")}
                </h1>
            </div>
            <AdminNewsForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
