import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { useGetAdminOrderByIdQuery } from "@/store/api/ordersApi";
import AdminOrderDetailComponent from "@/features/admin/components/orders/AdminOrderDetail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

export default function AdminOrderDetailPage() {
    const { t } = useTranslation("admin");
    const { id } = useParams();

    const { data, isLoading, isError } = useGetAdminOrderByIdQuery(id);

    // ✅ getAdminOrderByIdQuery transformResponse → response.data trực tiếp
    // Không cần .data thêm lần nữa
    const order = data;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-28 w-full rounded-2xl" />
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="mb-4 text-muted-foreground">
                    {t("status.notFound", { ns: "common" })}
                </p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to={ROUTES.ADMIN_ORDERS}>{t("order.title")}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_ORDERS}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t("order.title")}
                </Link>
            </Button>

            <AdminOrderDetailComponent order={order} />
        </div>
    );
}
