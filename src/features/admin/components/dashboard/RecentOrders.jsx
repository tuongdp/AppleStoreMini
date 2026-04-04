import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetAllOrdersQuery } from "@/store/api/ordersApi";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function RecentOrders() {
    const { t } = useTranslation("admin");

    const { data, isLoading } = useGetAllOrdersQuery({ page: 1, limit: 5 });

    // ✅ getAllOrdersQuery transformResponse → { orders, pagination }
    const orders = data?.orders ?? [];

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
                    {t("table.noData")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {orders.map((order) => (
                // ✅ MySQL integer id
                <Link
                    key={order.id}
                    to={ROUTES.ADMIN_ORDER_DETAIL(order.id)}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {order.user?.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                            {order.user?.fullName || t("order.customer")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            #{order.code} · {formatDateTime(order.createdAt)}
                        </p>
                    </div>

                    <OrderStatusBadge status={order.status} />

                    <p className="shrink-0 text-sm font-medium text-foreground">
                        {formatPrice(order.totalAmount)}
                    </p>
                </Link>
            ))}

            <div className="pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full text-xs"
                    asChild
                >
                    <Link to={ROUTES.ADMIN_ORDERS}>
                        {t("dashboard.viewAll")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
