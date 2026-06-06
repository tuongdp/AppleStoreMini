import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useGetUserByIdQuery } from "@/store/api/usersApi";
import { useGetAllOrdersQuery } from "@/store/api/ordersApi";
import AdminUserDetailComponent from "@/features/admin/components/users/AdminUserDetail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

export default function AdminUserDetailPage() {
    const { id } = useParams();

    const { data: user, isLoading, isError } = useGetUserByIdQuery(id);

    // ✅ getAllOrdersQuery transformResponse → { orders, pagination }
    const { data: ordersData } = useGetAllOrdersQuery({
        page: 1,
        limit: 5,
        userId: id,
    });

    // ✅ getUserByIdQuery transformResponse → response.data trực tiếp (không .data nữa)
    // ✅ getAllOrdersQuery transformResponse → { orders, pagination }
    const orders = ordersData?.orders ?? [];

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-4 lg:col-span-2">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="mb-4 text-muted-foreground">
                    {"Không tìm thấy"}
                </p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to={ROUTES.ADMIN_USERS}>{"Quản lý người dùng"}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_USERS}>
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    {"Quản lý người dùng"}
                </Link>
            </Button>

            <AdminUserDetailComponent user={user} orders={orders} />
        </div>
    );
}
