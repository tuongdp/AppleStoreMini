import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Coins,
    Flame,
    Loader2,
    Mail,
    MessageSquareReply,
    Package,
    Receipt,
    RotateCcw,
    Save,
    ShoppingBag,
    TicketPercent,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    useGetCategoryRevenueQuery,
    useGetCouponStatsQuery,
    useGetDashboardOperationsQuery,
    useGetDashboardStatsQuery,
    useGetLowStockQuery,
    useGetReviewRewardSettingQuery,
    useUpdateReviewRewardSettingMutation,
} from "@/store/api/ordersApi";
import RevenueChart from "@/features/admin/components/dashboard/RevenueChart";
import RecentOrders from "@/features/admin/components/dashboard/RecentOrders";
import TopProducts from "@/features/admin/components/dashboard/TopProducts";
import OrderStats from "@/features/admin/components/dashboard/OrderStats";
import OrderStatusChart from "@/features/admin/components/dashboard/OrderStatusChart";
import SlowProducts from "@/features/admin/components/dashboard/SlowProducts";
import TopCustomers from "@/features/admin/components/dashboard/TopCustomers";
import CategoryPieChart from "@/features/admin/components/dashboard/CategoryPieChart";
import { formatPrice, formatNumber, cn } from "@/lib/utils";

function MetricCard({ title, value, note, icon: Icon, tone = "default", loading }) {
    const toneClass = {
        default: "bg-muted text-muted-foreground",
        revenue: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        order: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
        purple: "bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
    }[tone];

    return (
        <Card className="border-border">
            <CardContent className="flex items-start gap-3 p-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClass)}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">{title}</p>
                    {loading ? (
                        <Skeleton className="mt-2 h-7 w-28" />
                    ) : (
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
                    )}
                    {note && <p className="mt-1 truncate text-xs text-muted-foreground">{note}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function WorkItem({ item }) {
    const toneClass = {
        danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400",
        warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-400",
        default: "border-border bg-muted/40 text-foreground",
    }[item.tone || "default"];

    return (
        <Link
            to={item.href}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted"
        >
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">Cần xử lý trong ca vận hành</p>
            </div>
            <div className="flex items-center gap-2">
                <Badge className={cn("border", toneClass)}>{formatNumber(item.count)}</Badge>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
        </Link>
    );
}

function AlertItem({ alert }) {
    const severityClass = {
        HIGH: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
        MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        LOW: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    }[alert.severity] || "bg-muted text-muted-foreground";

    return (
        <Link to={alert.href} className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted">
            <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", severityClass)}>
                    <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{alert.message}</p>
                </div>
            </div>
        </Link>
    );
}

export default function AdminDashboard() {
    const { data: stats, isLoading: isStatsLoading } = useGetDashboardStatsQuery();
    const { data: operations, isLoading: isOperationsLoading } = useGetDashboardOperationsQuery(undefined, {
        pollingInterval: 30000,
    });
    const { data: lowStock = [] } = useGetLowStockQuery();
    const { data: catRevenue = [] } = useGetCategoryRevenueQuery();
    const { data: couponStats } = useGetCouponStatsQuery();
    const { data: reviewRewardSetting, isLoading: isRewardLoading } = useGetReviewRewardSettingQuery();
    const [updateReviewReward, { isLoading: isUpdatingReward }] = useUpdateReviewRewardSettingMutation();
    const [rewardPoints, setRewardPoints] = useState("");

    useEffect(() => {
        if (reviewRewardSetting?.points != null) {
            setRewardPoints(String(reviewRewardSetting.points));
        }
    }, [reviewRewardSetting?.points]);

    const aov = stats?.totalRevenue && stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;
    const returnRate = stats?.totalOrders && stats?.totalReturns ? ((stats.totalReturns / stats.totalOrders) * 100).toFixed(1) : "0";
    const tasks = operations?.tasks || [];
    const alerts = operations?.alerts || [];

    const metricCards = useMemo(() => [
        {
            title: "Doanh thu hôm nay",
            value: formatPrice(operations?.revenue?.today ?? stats?.todayRevenue ?? 0),
            note: `Tháng này ${formatPrice(operations?.revenue?.month ?? 0)}`,
            icon: TrendingUp,
            tone: "revenue",
        },
        {
            title: "Đơn cần xử lý",
            value: formatNumber((operations?.orders?.pending || 0) + (operations?.orders?.confirmed || 0)),
            note: `${formatNumber(operations?.orders?.today || 0)} đơn mới hôm nay`,
            icon: Clock,
            tone: ((operations?.orders?.pending || 0) > 0 ? "danger" : "order"),
        },
        {
            title: "Đang truy cập",
            value: formatNumber(operations?.online?.totalOnline || 0),
            note: `${formatNumber(operations?.online?.guestVisitors || 0)} khách, ${formatNumber(operations?.online?.authenticatedUsers || 0)} đã đăng nhập`,
            icon: Activity,
            tone: "revenue",
        },
        {
            title: "Tỷ lệ giao thành công",
            value: `${operations?.orders?.deliveryRate ?? 0}%`,
            note: `Hủy/hoàn ${operations?.orders?.problemRate ?? returnRate}%`,
            icon: CheckCircle2,
            tone: "order",
        },
        {
            title: "Giá trị đơn trung bình",
            value: formatPrice(aov),
            note: `${formatNumber(stats?.totalOrders ?? 0)} đơn toàn thời gian`,
            icon: Receipt,
            tone: "purple",
        },
        {
            title: "Tồn kho cần chú ý",
            value: formatNumber((operations?.inventory?.lowStockVariants || 0) + (operations?.inventory?.outOfStockVariants || 0)),
            note: `${formatNumber(operations?.inventory?.outOfStockVariants || 0)} biến thể hết hàng`,
            icon: Package,
            tone: "warning",
        },
        {
            title: "Flash Sale đang chạy",
            value: formatNumber(operations?.flashSale?.active || 0),
            note: `${formatNumber(operations?.flashSale?.atRiskItems || 0)} sản phẩm sắp hết suất`,
            icon: Flame,
            tone: "danger",
        },
        {
            title: "Khách hàng mới",
            value: formatNumber(operations?.customers?.newToday || 0),
            note: `${formatNumber(operations?.customers?.unverified || 0)} tài khoản chưa xác thực`,
            icon: Users,
            tone: "default",
        },
        {
            title: "Voucher đã dùng",
            value: formatNumber(couponStats?.totalCouponOrders ?? 0),
            note: `Đã giảm ${formatPrice(couponStats?.totalDiscountAmount ?? 0)}`,
            icon: TicketPercent,
            tone: "purple",
        },
    ], [aov, couponStats, operations, returnRate, stats]);

    const handleUpdateReviewReward = async () => {
        const points = Number(rewardPoints);
        if (!Number.isInteger(points) || points < 0) {
            toast.error("Điểm thưởng phải là số nguyên không âm");
            return;
        }

        try {
            await updateReviewReward({ points }).unwrap();
            toast.success("Đã cập nhật điểm thưởng đánh giá");
        } catch (error) {
            toast.error(error?.data?.message || "Cập nhật điểm thưởng thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Tổng quan vận hành</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Doanh thu, đơn hàng, tồn kho và các việc cần xử lý trong ngày.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {formatNumber(stats?.totalOrders ?? 0)} đơn
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        {formatNumber(stats?.totalProducts ?? 0)} sản phẩm
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {formatNumber(stats?.totalUsers ?? 0)} người dùng
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((card) => (
                    <MetricCard key={card.title} {...card} loading={isStatsLoading || isOperationsLoading} />
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Việc cần xử lý hôm nay</CardTitle>
                        <Badge variant={tasks.length ? "destructive" : "secondary"}>
                            {tasks.length ? `${tasks.length} nhóm việc` : "Ổn định"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isOperationsLoading ? (
                            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-lg" />)
                        ) : tasks.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border py-8 text-center">
                                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                                <p className="mt-2 text-sm font-medium text-foreground">Không có việc khẩn cần xử lý</p>
                                <p className="mt-1 text-xs text-muted-foreground">Theo dõi thêm đơn mới, tồn kho và đánh giá trong ngày.</p>
                            </div>
                        ) : (
                            tasks.map((item) => <WorkItem key={item.key} item={item} />)
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Cảnh báo vận hành
                        </CardTitle>
                        <Badge variant="secondary">{formatNumber(alerts.length)}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isOperationsLoading ? (
                            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)
                        ) : alerts.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                                Chưa có cảnh báo mới.
                            </p>
                        ) : (
                            alerts.slice(0, 4).map((alert) => <AlertItem key={alert.key} alert={alert} />)
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <RotateCcw className="h-5 w-5 text-red-500" />
                        <div>
                            <p className="text-xs text-muted-foreground">Yêu cầu trả hàng</p>
                            <p className="text-lg font-semibold">{formatNumber(tasks.find((item) => item.key === "returnRequests")?.count || 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <MessageSquareReply className="h-5 w-5 text-amber-500" />
                        <div>
                            <p className="text-xs text-muted-foreground">Đánh giá chưa phản hồi</p>
                            <p className="text-lg font-semibold">{formatNumber(tasks.find((item) => item.key === "reviews")?.count || 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="text-xs text-muted-foreground">Email subscriber active</p>
                            <p className="text-lg font-semibold">{formatNumber(operations?.customers?.activeSubscribers || 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <TrendingDown className="h-5 w-5 text-violet-500" />
                        <div>
                            <p className="text-xs text-muted-foreground">Doanh thu Flash Sale</p>
                            <p className="text-lg font-semibold">{formatPrice(operations?.revenue?.flashSale || 0)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Coins className="h-4 w-4 text-amber-500" />
                        Điểm thưởng mỗi đánh giá
                    </CardTitle>
                    <Badge variant="secondary">{formatNumber(Number(reviewRewardSetting?.points ?? 100000))} điểm</Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                            type="number"
                            min="0"
                            step="1"
                            value={rewardPoints}
                            onChange={(event) => setRewardPoints(event.target.value)}
                            disabled={isRewardLoading || isUpdatingReward}
                            className="sm:max-w-xs"
                        />
                        <Button type="button" onClick={handleUpdateReviewReward} disabled={isRewardLoading || isUpdatingReward}>
                            {isUpdatingReward ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Lưu điểm
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Điểm này được cộng vào tài khoản khách hàng sau khi đánh giá sản phẩm hợp lệ.
                    </p>
                </CardContent>
            </Card>

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
                    <CardHeader><CardTitle className="text-sm font-medium">Phân bổ trạng thái đơn hàng</CardTitle></CardHeader>
                    <CardContent><OrderStatusChart /></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Sản phẩm bán chậm trong 30 ngày</CardTitle></CardHeader>
                    <CardContent><SlowProducts /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Khách hàng chi tiêu cao</CardTitle></CardHeader>
                    <CardContent><TopCustomers /></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Đơn hàng mới nhất</CardTitle></CardHeader>
                    <CardContent><RecentOrders /></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Cảnh báo tồn kho thấp
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStock.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">Tất cả sản phẩm đều đủ hàng</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Màu</TableHead>
                                        <TableHead>Dung lượng</TableHead>
                                        <TableHead className="text-right">Tồn kho</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStock.map((variant) => (
                                        <TableRow key={variant.id}>
                                            <TableCell>
                                                <Link to={`/admin/products/${variant.productId}/edit`} className="line-clamp-1 max-w-[180px] text-sm text-blue-600 hover:underline">
                                                    {variant.product?.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{variant.color || "-"}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{variant.storage || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={variant.stock === 0 ? "bg-red-500 text-white" : "bg-amber-500 text-white"}>{variant.stock}</Badge>
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
