import { DollarSign, ShoppingBag, Users, Package, Clock, AlertTriangle, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetRevenueStatsQuery, useGetLowStockQuery, useGetCategoryRevenueQuery, useGetPointsStatsQuery } from "@/store/api/ordersApi";
import { useGetAllUsersQuery } from "@/store/api/usersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import RevenueChart from "@/features/admin/components/dashboard/RevenueChart";
import RecentOrders from "@/features/admin/components/dashboard/RecentOrders";
import TopProducts from "@/features/admin/components/dashboard/TopProducts";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const DONUT_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16"];

function CategoryDonut({ data }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>;

    let cumulative = 0;
    const segments = data.map((d, i) => {
        const pct = (d.value / total) * 100;
        const start = cumulative;
        cumulative += pct;
        return { ...d, pct, start, end: cumulative, color: DONUT_COLORS[i % DONUT_COLORS.length] };
    });

    const conicGradient = segments.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(", ");
    const cx = 100, cy = 100, r = 70, strokeW = 20;

    return (
        <div className="flex items-center gap-6">
            <svg viewBox="0 0 200 200" className="h-44 w-44 shrink-0 -rotate-90">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeW} />
                {segments.map((s) => {
                    const startAngle = (s.start / 100) * 2 * Math.PI;
                    const endAngle = (s.end / 100) * 2 * Math.PI;
                    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
                    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
                    const large = s.pct > 50 ? 1 : 0;
                    return <path key={s.label} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={s.color} />;
                })}
                <circle cx={cx} cy={cy} r={r - strokeW} fill="hsl(var(--card))" />
                <text x={cx} y={cy - 8} textAnchor="middle" fill="currentColor" className="text-lg font-bold" transform={`rotate(90 ${cx} ${cy})`}>{formatPrice(total)}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs" transform={`rotate(90 ${cx} ${cy})`}>Tổng</text>
            </svg>
            <div className="space-y-2">
                {segments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-medium ml-auto">{s.pct.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { data: stats, isLoading: isStatsLoading } = useGetRevenueStatsQuery({ period: "month" });
    const { data: lowStock = [] } = useGetLowStockQuery();
    const { data: catRevenue = [] } = useGetCategoryRevenueQuery();
    const { data: points } = useGetPointsStatsQuery();
    const { data: usersData } = useGetAllUsersQuery({ page: 1, limit: 1 });
    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 1 });

    const STAT_CARDS = [
        { title: "Tổng doanh thu", value: formatPrice(stats?.totalRevenue ?? 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
        { title: "Doanh thu hôm nay", value: formatPrice(stats?.todayRevenue ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
        { title: "Đơn chờ xử lý", value: formatNumber(stats?.pendingOrders ?? 0), icon: Clock, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", badge: (stats?.pendingOrders ?? 0) > 0 },
        { title: "Tổng sản phẩm", value: formatNumber(productsData?.pagination?.total ?? 0), icon: Package, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
        { title: "Tổng đơn hàng", value: formatNumber(stats?.totalOrders ?? 0), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
        { title: "Tổng người dùng", value: formatNumber(usersData?.pagination?.total ?? 0), icon: Users, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
        { title: "Điểm loyalty", value: formatNumber(points?.totalPoints ?? 0), icon: Coins, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
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
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-foreground">{card.value}</span>
                                    {card.badge && <Badge className="bg-red-500 text-white text-xs">!</Badge>}
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
                    <CardContent><CategoryDonut data={catRevenue} /></CardContent>
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

            <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Sản phẩm bán chạy</CardTitle></CardHeader>
                <CardContent><TopProducts /></CardContent>
            </Card>
        </div>
    );
}
