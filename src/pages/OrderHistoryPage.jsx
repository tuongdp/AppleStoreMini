import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import OrderList from "@/features/orders/components/OrderList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ORDER_STATUS } from "@/lib/constants";

const STATUS_TABS = [
    { value: "", labelKey: "status.all" },
    { value: ORDER_STATUS.PENDING, labelKey: "status.pending" },
    { value: ORDER_STATUS.CONFIRMED, labelKey: "status.confirmed" },
    { value: ORDER_STATUS.SHIPPING, labelKey: "status.shipping" },
    { value: ORDER_STATUS.DELIVERED, labelKey: "status.delivered" },
    { value: ORDER_STATUS.CANCELLED, labelKey: "status.cancelled" },
];

export default function OrderHistoryPage() {
    const { t } = useTranslation("order");
    const [activeTab, setActiveTab] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useGetOrdersQuery({
        page,
        limit: 10,
        status: activeTab || undefined,
    });

    // ✅ ordersApi transformResponse → { orders, pagination }
    const orders = data?.orders ?? [];
    const pagination = data?.pagination ?? {};

    const handleTabChange = (value) => {
        setActiveTab(value);
        setPage(1);
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                    {t("title")}
                </h2>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="mb-6"
            >
                <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
                    {STATUS_TABS.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="rounded-full border border-border data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background"
                        >
                            {t(tab.labelKey)}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <OrderList orders={orders} isLoading={isLoading} />

            {!isLoading && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        {t("pagination.prev", { ns: "common" })}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t("pagination.page", { ns: "common" })} {page}{" "}
                        {t("pagination.of", { ns: "common" })}{" "}
                        {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        {t("pagination.next", { ns: "common" })}
                    </Button>
                </div>
            )}
        </div>
    );
}
