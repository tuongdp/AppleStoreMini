import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useGetRevenueStatsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";

const PERIODS = [
    { value: "day", label: "Ngày" },
    { value: "week", label: "Tuần" },
    { value: "month", label: "Tháng" },
    { value: "year", label: "Năm" },
];

const periodButtonClass = (active) =>
    cn(
        "rounded-full text-xs",
        active
            ? "bg-foreground text-background hover:bg-foreground hover:text-background"
            : "text-muted-foreground",
    );

const periodReportLabel = (value) => PERIODS.find((item) => item.value === value)?.label || value;

const formatRevenuePeriodLabel = (period, value) => {
    const label = String(value ?? "");
    if (!label) return "";
    if (period === "day") return `${label}:00`;
    if (period === "year") return `Tháng ${label}`;
    return label.toLocaleLowerCase("vi-VN").startsWith("ngày") ? label : `Ngày ${label}`;
};

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-md">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">{formatPrice(d?.revenue || 0)}</p>
            <p className="text-xs text-muted-foreground">Đơn hàng: {formatNumber(d?.orders || 0)}</p>
        </div>
    );
}

function AxisTick({ x, y, payload }) {
    return (
        <text x={x} y={y} dy={8} textAnchor="middle" fontSize={11} className="fill-muted-foreground">
            {payload.value}
        </text>
    );
}

function YAxisTick({ x, y, payload }) {
    return (
        <text x={x} y={y} dy={3} textAnchor="end" fontSize={11} className="fill-muted-foreground">
            {payload.value >= 1_000_000_000
                ? `${(payload.value / 1_000_000_000).toFixed(1)}B`
                : payload.value >= 1_000_000
                    ? `${(payload.value / 1_000_000).toFixed(0)}M`
                    : payload.value >= 1_000
                        ? `${(payload.value / 1_000).toFixed(0)}K`
                        : payload.value}
        </text>
    );
}

export default function RevenueChart() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPeriod = PERIODS.some((item) => item.value === searchParams.get("revenuePeriod"))
        ? searchParams.get("revenuePeriod")
        : "month";
    const [period, setPeriod] = useState(initialPeriod);
    const [offset, setOffset] = useState(0);

    const { data, isLoading, isError, error } = useGetRevenueStatsQuery({ period, offset });

    // ✅ getRevenueStatsQuery transformResponse → response.data trực tiếp
    // shape: { chart, totalRevenue, totalOrders, revenueChange }
    const chartData = data?.chart ?? [];

    const { exportExcel, exportPDF, isExporting } = useExport();

    const handlePeriodChange = (value) => {
        setPeriod(value);
        setOffset(0);
        const params = new URLSearchParams(searchParams);
        if (value === "month") params.delete("revenuePeriod");
        else params.set("revenuePeriod", value);
        setSearchParams(params, { replace: true });
    };

    const periodLabel = () => {
        if (offset === 0) return PERIODS.find((p) => p.value === period)?.label || "";
        if (period === "day") return `${offset} ngày trước`;
        if (period === "week") return `${offset} tuần trước`;
        if (period === "month") return `${offset} tháng trước`;
        return `${offset} năm trước`;
    };

    const revenueColumns = [
        { key: "label", label: period === "day" ? "Giờ" : period === "year" ? "Tháng" : "Ngày" },
        { key: "revenue", label: "Doanh thu", format: "currency" },
        { key: "orders", label: "Đơn hàng" },
    ];

    const getRevenueExportRows = () => chartData.map((row) => ({
        ...row,
        label: formatRevenuePeriodLabel(period, row.label),
    }));

    const handleExportRevenueExcel = () => {
        if (chartData.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportExcel({
            title: "Báo cáo doanh thu",
            subtitle: `Kỳ báo cáo: ${periodReportLabel(period)} | Tổng doanh thu: ${formatPrice(data?.totalRevenue ?? 0)} | Tổng đơn hàng: ${formatNumber(data?.totalOrders ?? 0)}`,
            sheets: [{ name: "DoanhThu", columns: revenueColumns, rows: getRevenueExportRows() }],
            filename: `DoanhThu_${new Date().toISOString().slice(0, 10)}`,
        });
    };

    const handleExportRevenuePDF = () => {
        if (chartData.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportPDF({
            title: "Báo cáo doanh thu",
            subtitle: `Kỳ báo cáo: ${periodReportLabel(period)} | Tổng doanh thu: ${formatPrice(data?.totalRevenue ?? 0)} | Tổng đơn hàng: ${formatNumber(data?.totalOrders ?? 0)}`,
            columns: revenueColumns,
            rows: getRevenueExportRows(),
            filename: `DoanhThu_${new Date().toISOString().slice(0, 10)}`,
        });
    };

    if (isError) {
        return (
            <div className="flex h-[280px] items-center justify-center rounded-xl bg-muted/30">
                <p className="text-sm text-destructive">
                    {"Lỗi tải dữ liệu: "}{error?.data?.message || error?.error || "Không thể kết nối máy chủ"}
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-16 rounded-full" />
                    ))}
                </div>
                <Skeleton className="h-[280px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setOffset((o) => o + 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[60px] text-center text-xs text-muted-foreground">
                        {periodLabel()}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" disabled={offset <= 0} onClick={() => setOffset((o) => Math.max(0, o - 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    {PERIODS.map((p) => (
                    <Button
                        key={p.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePeriodChange(p.value)}
                        className={periodButtonClass(period === p.value)}
                    >
                        {p.label}
                    </Button>
                ))}
                </div>
                <ExportButton onExportExcel={handleExportRevenueExcel} onExportPDF={handleExportRevenuePDF} loading={isExporting} />
            </div>

            {chartData.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                        {"Không có dữ liệu"}
                    </p>
                </div>
            ) : (
                <ResponsiveContainer key={period} width="100%" height={280}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="currentColor"
                                    stopOpacity={0.15}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="currentColor"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={<AxisTick />}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={<YAxisTick />}
                            width={56}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="currentColor"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                            dot={false}
                            activeDot={{
                                r: 4,
                                fill: "currentColor",
                                strokeWidth: 0,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}

            {/* ✅ data là object trực tiếp sau transformResponse — không cần .data thêm */}
            {data && (
                <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Doanh thu</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{formatPrice(data.totalRevenue ?? 0)}</span>
                            {data.revenueChange != null && (
                                <span className={cn(
                                    "flex items-center gap-0.5 text-xs font-medium",
                                    (data.revenueChange ?? 0) >= 0 ? "text-green-600" : "text-red-500",
                                )}>
                                    {(data.revenueChange ?? 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {(data.revenueChange ?? 0) >= 0 ? "+" : ""}{data.revenueChange ?? 0}%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Đơn hàng</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{formatNumber(data.totalOrders ?? 0)}</span>
                            {data.orderChange != null && (
                                <span className={cn(
                                    "flex items-center gap-0.5 text-xs font-medium",
                                    (data.orderChange ?? 0) >= 0 ? "text-green-600" : "text-red-500",
                                )}>
                                    {(data.orderChange ?? 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {(data.orderChange ?? 0) >= 0 ? "+" : ""}{data.orderChange ?? 0}%
                                </span>
                            )}
                        </div>
                    </div>

                    {data.avgOrderValue != null && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Giá trị trung bình đơn</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{formatPrice(data.avgOrderValue ?? 0)}</span>
                                {data.avgOrderChange != null && (
                                    <span className={cn(
                                        "flex items-center gap-0.5 text-xs font-medium",
                                        (data.avgOrderChange ?? 0) >= 0 ? "text-green-600" : "text-red-500",
                                    )}>
                                        {(data.avgOrderChange ?? 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {(data.avgOrderChange ?? 0) >= 0 ? "+" : ""}{data.avgOrderChange ?? 0}%
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
