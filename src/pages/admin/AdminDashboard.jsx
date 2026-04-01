import { useTranslation } from "react-i18next";
import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useGetRevenueStatsQuery,
    useGetAllOrdersQuery,
} from "@/store/api/ordersApi";
import { useGetAllUsersQuery } from "@/store/api/usersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import RevenueChart from "@/features/admin/components/dashboard/RevenueChart";
import RecentOrders from "@/features/admin/components/dashboard/RecentOrders";
import TopProducts from "@/features/admin/components/dashboard/TopProducts";
import { formatPrice, formatNumber, cn } from "@/lib/utils";

export default function AdminDashboard() {
    const { t } = useTranslation("admin");

    // ✅ getRevenueStatsQuery transformResponse → response.data trực tiếp
    // shape: { chart, totalRevenue, totalOrders, revenueChange }
    const { data: stats, isLoading: isStatsLoading } = useGetRevenueStatsQuery({
        period: "month",
    });

    // ✅ getAllOrdersQuery transformResponse → { orders, pagination }
    const { data: ordersData } = useGetAllOrdersQuery({ page: 1, limit: 1 });

    // usersApi chưa có transformResponse → vẫn dùng data?.data?.pagination
    const { data: usersData } = useGetAllUsersQuery({ page: 1, limit: 1 });

    // ✅ getProductsQuery transformResponse → { products, pagination }
    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 1 });

    const STAT_CARDS = [
        {
            titleKey: "dashboard.totalRevenue",
            // stats là object trực tiếp sau transformResponse (không cần .data)
            value: formatPrice(stats?.totalRevenue ?? 0),
            change: stats?.revenueChange ?? 0,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/30",
        },
        {
            titleKey: "dashboard.totalOrders",
            // ordersData → { orders, pagination }
            value: formatNumber(ordersData?.pagination?.total ?? 0),
            change: 0,
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
        },
        {
            titleKey: "dashboard.totalProducts",
            // productsData → { products, pagination }
            value: formatNumber(productsData?.pagination?.total ?? 0),
            change: 0,
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
        },
        {
            titleKey: "dashboard.totalUsers",
            // usersApi chưa có transformResponse → data?.data?.pagination
            value: formatNumber(
                usersData?.data?.pagination?.total ??
                    usersData?.pagination?.total ??
                    0,
            ),
            change: 0,
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("dashboard.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("dashboard.subtitle")}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STAT_CARDS.map((card) => (
                    <Card key={card.titleKey} className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t(card.titleKey)}
                            </CardTitle>
                            <div
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-full",
                                    card.bg,
                                )}
                            >
                                <card.icon
                                    className={cn("h-4 w-4", card.color)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isStatsLoading ? (
                                <Skeleton className="h-8 w-32" />
                            ) : (
                                <div className="text-2xl font-bold text-foreground">
                                    {card.value}
                                </div>
                            )}
                            {card.change !== 0 && (
                                <div
                                    className={cn(
                                        "mt-1 flex items-center gap-1 text-xs",
                                        card.change > 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-500",
                                    )}
                                >
                                    {card.change > 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(card.change)}%{" "}
                                    {t("dashboard.vsLastMonth")}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts + Recent orders */}
            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-foreground">
                            {t("dashboard.revenueChart")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-foreground">
                            {t("dashboard.recentOrders")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentOrders />
                    </CardContent>
                </Card>
            </div>

            {/* Top products */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-foreground">
                        {t("dashboard.topProducts")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <TopProducts />
                </CardContent>
            </Card>
        </div>
    );
}
