import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";
import OrderDetail from "@/features/orders/components/OrderDetail";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function OrderDetailPage() {
    const { id } = useParams();

    const { data, isLoading, isError } = useGetOrderByIdQuery(id);

    // ✅ ordersApi transformResponse → response.data trực tiếp (không wrap thêm .data)
    const order = data;

    if (isLoading) return <OrderDetailSkeleton />;

    if (isError || !order) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <p className="mb-4 text-muted-foreground">
                    {"Không tìm thấy"}
                </p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to={ROUTES.ORDERS}>{"Đơn hàng của tôi"}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb
                items={[
                    { label: "Đơn hàng của tôi", href: ROUTES.ORDERS },
                    { label: `#${order.code}` },
                ]}
            />

            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ORDERS}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {"Đơn hàng của tôi"}
                </Link>
            </Button>

            <OrderDetail order={order} />
        </div>
    );
}

function OrderDetailSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-24 rounded-full" />

            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-border bg-card p-5 md:p-6"
                        >
                            <Skeleton className="mb-4 h-4 w-32" />
                            <div className="space-y-3">
                                {[...Array(2)].map((_, j) => (
                                    <div key={j} className="flex gap-4">
                                        <Skeleton className="h-16 w-16 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <Skeleton className="mb-4 h-4 w-24" />
                        <div className="space-y-2.5">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <Skeleton className="mb-5 h-4 w-24" />
                        <div className="space-y-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
