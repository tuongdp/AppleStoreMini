import { Link } from "react-router-dom";
import { useGetAllOrdersQuery } from "@/store/api/ordersApi";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function RecentOrders() {
    const { data, isLoading } = useGetAllOrdersQuery({
        page: 1,
        limit: 5,
    });

    const orders = data?.orders || [];

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    {"Không có dữ liệu"}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="w-9 shrink-0" />
                <span className="min-w-0 flex-1">Khách hàng</span>
                <span className="w-20 shrink-0 text-center">Trạng thái</span>
                <span className="w-24 shrink-0 text-right">Tổng tiền</span>
            </div>
            {orders.map((order) => (
                <Link
                    key={order._id || order.id}
                    to={ROUTES.ADMIN_ORDER_DETAIL(order._id || order.id)}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
                >
                    {/* Avatar placeholder */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {order.user?.fullName?.charAt(0)?.toUpperCase() || "V"}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                            {order.user?.fullName || "Khách vãng lai"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            #{order.code} · {formatDateTime(order.createdAt)}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="w-20 shrink-0 flex justify-center">
                        <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Total */}
                    <p className="w-24 shrink-0 text-right text-sm font-medium text-foreground">
                        {formatPrice(order.totalAmount)}
                    </p>
                </Link>
            ))}

            {/* View all */}
            <div className="pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full text-xs"
                    asChild
                >
                    <Link to={ROUTES.ADMIN_ORDERS}>
                        {"Xem tất cả"}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
