import { Skeleton } from "@/components/ui/skeleton";
import OrderCard from "./OrderCard";
import OrderEmpty from "./OrderEmpty";

export default function OrderList({ orders = [], isLoading = false }) {


    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-border p-4 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                        <div className="flex gap-3">
                            {[...Array(3)].map((_, j) => (
                                <Skeleton
                                    key={j}
                                    className="h-16 w-16 rounded-lg"
                                />
                            ))}
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return <OrderEmpty />;
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order._id || order.id} order={order} />
        ))}
      </div>
    );
}
