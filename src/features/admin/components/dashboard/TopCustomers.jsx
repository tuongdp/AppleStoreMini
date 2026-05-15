import { useGetTopCustomersQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function TopCustomers() {
    const { data = [], isLoading } = useGetTopCustomersQuery({ limit: 5 });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>;
    }

    return (
        <div className="space-y-3">
            {data.map((cust, index) => {
                const initials = (cust.fullName || "U")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (
                    <div key={cust.id} className="flex items-center gap-3">
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                            index === 0 && "bg-amber-100 text-amber-700",
                            index === 1 && "bg-slate-100 text-slate-600",
                            index === 2 && "bg-orange-100 text-orange-700",
                            index > 2 && "bg-muted text-muted-foreground")}>
                            {index + 1}
                        </span>
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium shrink-0",
                            index === 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground")}>
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{cust.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{cust.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-foreground">{formatPrice(cust.totalSpent)}</p>
                            <p className="text-xs text-muted-foreground">{cust.orderCount} đơn</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
