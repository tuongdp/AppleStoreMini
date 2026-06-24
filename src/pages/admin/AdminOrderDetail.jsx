import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useGetAdminOrderByIdQuery } from "@/store/api/ordersApi";
import { useOrderSocket } from "@/hooks/useSocket";
import AdminOrderDetailComponent from "@/features/admin/components/orders/AdminOrderDetail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export default function AdminOrderDetailPage() {
    const { id } = useParams();

    const { data, isLoading, isError, refetch } = useGetAdminOrderByIdQuery(id);
    const order = data;

    useOrderSocket(id, () => {
        refetch();
        toast.info("Đơn hàng vừa được cập nhật");
    });

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
                    {"Không tìm thấy"}
                </p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to={ROUTES.ADMIN_ORDERS}>{"Quản lý đơn hàng"}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_ORDERS}>
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    {"Quản lý đơn hàng"}
                </Link>
            </Button>

            <AdminOrderDetailComponent order={order} />
        </div>
    );
}
