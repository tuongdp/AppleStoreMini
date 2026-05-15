import { ShoppingBag, Users, Package, Clock, TrendingUp, TicketPercent, AlertTriangle, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetLowStockQuery, useGetCategoryRevenueQuery, useGetCouponStatsQuery, useGetDashboardStatsQuery } from "@/store/api/ordersApi";
import { useGetAllUsersQuery } from "@/store/api/usersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import RevenueChart from "@/features/admin/components/dashboard/RevenueChart";
import RecentOrders from "@/features/admin/components/dashboard/RecentOrders";
import TopProducts from "@/features/admin/components/dashboard/TopProducts";
import OrderStats from "@/features/admin/components/dashboard/OrderStats";
import OrderStatusChart from "@/features/admin/components/dashboard/OrderStatusChart";
import SlowProducts from "@/features/admin/components/dashboard/SlowProducts";
import TopCustomers from "@/features/admin/components/dashboard/TopCustomers";
import CategoryPieChart from "@/features/admin/components/dashboard/CategoryPieChart";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
    const { data: stats, isLoading: isStatsLoading } = useGetDashboardStatsQuery();
    const { data: lowStock = [] } = useGetLowStockQuery();
    const { data: catRevenue = [] } = useGetCategoryRevenueQuery();
    const { data: couponStats } = useGetCouponStatsQuery();
    const { data: usersData } = useGetAllUsersQuery({ page: 1, limit: 1 });
    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 1 });

    const aov = stats?.totalRevenue && stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;
    const returnRate = stats?.totalOrders && stats?.totalReturns ? ((stats.totalReturns / stats.totalOrders) * 100).toFixed(1) : "0";

    const STAT_CARDS = [
        { title: "Doanh thu hôm nay", value: formatPrice(stats?.todayRevenue ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
        { title: "Giá trị đơn TB", value: formatPrice(aov), icon: Receipt, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
        { title: "Đơn chờ xử lý", value: formatNumber(stats?.pendingOrders ?? 0), icon: Clock, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", badge: (stats?.pendingOrders ?? 0) > 0,
            sub: `Tỉ lệ hoàn: ${returnRate}%` },
        { title: "Tổng đơn hàng", value: formatNumber(stats?.totalOrders ?? 0), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
        { title: "Tổng sản phẩm", value: formatNumber(productsData?.pagination?.total ?? 0), icon: Package, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
        { title: "Tổng người dùng", value: formatNumber(usersData?.pagination?.total ?? 0), icon: Users, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
        { title: "Voucher đã dùng", value: formatNumber(couponStats?.totalCouponOrders ?? 0), icon: TicketPercent, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30" },
        { title: "Tiền giảm từ voucher", value: formatPrice(couponStats?.totalDiscountAmount ?? 0), icon: TicketPercent, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Tổng quan</h1>
                <p className="mt-1 text-sm text-muted-foreground">Xin chào, đây là tóm tắt hôm nay</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STAT_CARDS.map((card) => (
                    <Card key={card.title} className={cn("border-border", card.badge && "border-red-200 dark:border-red-800")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", card.bg)}>
                                <card.icon className={cn("h-4 w-4", card.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isStatsLoading ? (
                                <Skeleton className="h-8 w-32" />
                            ) : (
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-foreground">{card.value}</span>
                                        {card.badge && <Badge className="bg-red-500 text-white text-xs">!</Badge>}
                                    </div>
                                    {card.sub && (
                                        <p className="text-xs text-muted-foreground">{card.sub}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader><CardTitle className="text-sm font-medium">Biểu đồ doanh thu</CardTitle></CardHeader>
                    <CardContent><RevenueChart /></CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader><CardTitle className="text-sm font-medium">Doanh thu theo danh mục</CardTitle></CardHeader>
                    <CardContent><CategoryPieChart data={catRevenue} /></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Thống kê đơn hàng</CardTitle></CardHeader>
                <CardContent><OrderStats /></CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Sản phẩm bán chạy</CardTitle></CardHeader>
                    <CardContent><TopProducts /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Phân bố trạng thái đơn hàng</CardTitle></CardHeader>
                    <CardContent><OrderStatusChart /></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Sản phẩm bán chậm (30 ngày)</CardTitle></CardHeader>
                    <CardContent><SlowProducts /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Khách hàng chi tiêu cao</CardTitle></CardHeader>
                    <CardContent><TopCustomers /></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Đơn hàng mới nhất</CardTitle>
                    </CardHeader>
                    <CardContent><RecentOrders /></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Cảnh báo tồn kho thấp
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStock.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Tất cả sản phẩm đều đủ hàng</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Sản phẩm</TableHead><TableHead>Màu</TableHead><TableHead>Dung lượng</TableHead><TableHead className="text-right">Tồn kho</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStock.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell>
                                                <Link to={`/admin/products/${v.productId}/edit`} className="text-sm text-blue-600 hover:underline line-clamp-1 max-w-[140px]">{v.product?.name}</Link>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{v.color || "—"}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{v.storage || "—"}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={v.stock === 0 ? "bg-red-500 text-white" : "bg-amber-500 text-white"}>{v.stock}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
