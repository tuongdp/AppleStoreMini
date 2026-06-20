import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import OrderList from "@/features/orders/components/OrderList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ORDER_STATUS } from "@/lib/constants";

const STATUS_TABS = [
    { value: "all", label: "Lịch sử mua hàng" },
    { value: ORDER_STATUS.PENDING, label: "Chờ xác nhận", status: ORDER_STATUS.PENDING },
    { value: ORDER_STATUS.CONFIRMED, label: "Đã xác nhận", status: ORDER_STATUS.CONFIRMED },
    { value: ORDER_STATUS.SHIPPING, label: "Đang giao", status: ORDER_STATUS.SHIPPING },
    { value: "review", label: "Đánh giá", status: ORDER_STATUS.DELIVERED },
];

const hasReviewableItem = (order) =>
    (order.items || []).some((item) => !item.isReviewed);

export default function OrderHistoryPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(1);

    const currentTab = STATUS_TABS.find((tab) => tab.value === activeTab) || STATUS_TABS[0];
    const { data, isLoading } = useGetOrdersQuery({
        page,
        limit: 10,
        status: currentTab.status,
    });

    const rawOrders = data?.orders ?? [];
    const orders = activeTab === "review" ? rawOrders.filter(hasReviewableItem) : rawOrders;
    const pagination = data?.pagination ?? {};

    const handleTabChange = (value) => {
        setActiveTab(value);
        setPage(1);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card">
                <div className="border-b px-4 py-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        Đơn mua
                    </h2>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="px-4 py-3"
                >
                    <TabsList className="flex !h-auto min-h-8 w-full flex-wrap gap-1 bg-muted/40 p-1">
                        {STATUS_TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="!h-auto flex-1 whitespace-nowrap rounded-md px-2 py-2 text-xs sm:flex-none sm:text-sm"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <OrderList orders={orders} isLoading={isLoading} />

            {!isLoading && pagination.totalPages > 1 && activeTab !== "review" && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Trang {page} trong {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Sau
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            )}
        </div>
    );
}
