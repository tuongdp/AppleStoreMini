import { AlertTriangle } from "lucide-react";
import { useGetOrderStatusDistributionQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS, ORDER_STATUS_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
};

const STATUS_LIST = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
];

const CANCEL_WARNING_THRESHOLD = 20;
const PENDING_WARNING_THRESHOLD = 10;

const statusBarColor = (status) => {
    const c = ORDER_STATUS_COLOR[status];
    if (c?.includes("green")) return "bg-green-500";
    if (c?.includes("blue")) return "bg-blue-500";
    if (c?.includes("orange")) return "bg-orange-500";
    if (c?.includes("red")) return "bg-red-500";
    if (c?.includes("yellow")) return "bg-yellow-500";
    if (c?.includes("purple")) return "bg-purple-500";
    return "bg-muted-foreground";
};

export default function OrderStatusChart() {
    const { data = [], isLoading } = useGetOrderStatusDistributionQuery();
    const total = data.reduce((s, d) => s + d.count, 0) || 1;

    const counts = STATUS_LIST.reduce((acc, status) => {
        const found = data.find((d) => d.status.toLowerCase() === status);
        acc[status] = found ? found.count : 0;
        return acc;
    }, {});

    const cancelPct = Math.round((counts[ORDER_STATUS.CANCELLED] / total) * 100);
    const pendingCount = counts[ORDER_STATUS.PENDING];
    const showCancelWarning = cancelPct >= CANCEL_WARNING_THRESHOLD;
    const showPendingWarning = pendingCount > PENDING_WARNING_THRESHOLD;

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex justify-between">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3.5 w-16" />
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
                                {STATUS_LABELS[status] || status}
                            </span>
                            <span className="font-medium text-foreground tabular-nums">
                                {count} <span className="text-muted-foreground">({pct}%)</span>
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn("h-full rounded-full transition-[width] duration-500", statusBarColor(status))}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}

            {(showCancelWarning || showPendingWarning) && (
                <div className="space-y-1.5 border-t border-border pt-3">
                    {showCancelWarning && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs dark:bg-red-950/20">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                            <span className="text-red-700 dark:text-red-400">
                                Tỷ lệ đơn hủy đang ở mức {cancelPct}%, cao hơn mức trung bình ({CANCEL_WARNING_THRESHOLD}%).
                            </span>
                        </div>
                    )}
                    {showPendingWarning && (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950/20">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <span className="text-amber-700 dark:text-amber-400">
                                Có {pendingCount} đơn đang chờ xác nhận cần xử lý.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
