import { useTranslation } from "react-i18next";
import { useGetAllOrdersQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS, ORDER_STATUS_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_LIST = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
];

export default function OrderStatusChart() {
    const { t } = useTranslation("admin");

    const { data, isLoading } = useGetAllOrdersQuery({
        page: 1,
        limit: 100,
    });

    const orders = data?.orders || [];
    const total = orders.length || 1;

    const counts = STATUS_LIST.reduce((acc, status) => {
        acc[status] = orders.filter((o) => o.status === status).length;
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex justify-between">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3.5 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {STATUS_LIST.map((status) => {
                const count = counts[status] || 0;
                const pct = Math.round((count / total) * 100);

                return (
                    <div key={status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {t(`status.${status}`, { ns: "order" })}
                            </span>
                            <span className="font-medium text-foreground">
                                {count}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    ORDER_STATUS_COLOR[status]?.includes(
                                        "green",
                                    )
                                        ? "bg-green-500"
                                        : ORDER_STATUS_COLOR[status]?.includes(
                                                "blue",
                                            )
                                          ? "bg-blue-500"
                                          : ORDER_STATUS_COLOR[
                                                  status
                                              ]?.includes("orange")
                                            ? "bg-orange-500"
                                            : ORDER_STATUS_COLOR[
                                                    status
                                                ]?.includes("red")
                                              ? "bg-red-500"
                                              : "bg-muted-foreground",
                                )}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
