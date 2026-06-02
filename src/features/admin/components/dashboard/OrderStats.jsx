import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useGetOrderStatsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";

const PERIODS = [
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

function TrendCell({ change }) {
    if (change == null) return <span className="text-muted-foreground">—</span>;
    const up = change >= 0;
    return (
        <span className={cn("inline-flex items-center gap-0.5", up ? "text-green-600" : "text-red-500")}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{change}%
        </span>
    );
}

function ChartTooltip({ active, payload, label, period }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const periodLabel = period === "week" ? "tuần trước" : period === "month" ? "tháng trước" : "năm trước";
    return (
        <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-md">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">{formatNumber(d.orders)} đơn</p>
            <p className="text-xs text-muted-foreground">Doanh thu: {formatPrice(d.revenue)}</p>
            {d.orderChange != null && (
                <p className={cn("text-xs font-medium", d.orderChange >= 0 ? "text-green-600" : "text-red-500")}>
                    {d.orderChange >= 0 ? "↑" : "↓"} {Math.abs(d.orderChange)}% so với {periodLabel}
                </p>
            )}
        </div>
    );
}

export default function OrderStats() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPeriod = PERIODS.some((item) => item.value === searchParams.get("orderStatsPeriod"))
        ? searchParams.get("orderStatsPeriod")
        : "month";
    const [period, setPeriod] = useState(initialPeriod);
    const { data = [], isLoading } = useGetOrderStatsQuery({ period });

    const totalOrders = useMemo(() => data.reduce((s, d) => s + (d.orders || 0), 0), [data]);
    const totalOrderChange = useMemo(() => {
        const totalPrev = data.reduce((s, d) => {
            if (d.orderChange == null) return s;
            const prev = d.orders / (1 + d.orderChange / 100);
            return s + prev;
        }, 0);
        if (totalPrev === 0) return null;
        return Math.round(((totalOrders - totalPrev) / totalPrev) * 100);
    }, [data, totalOrders]);

    const { exportExcel, exportPDF, isExporting } = useExport();

    const handlePeriodChange = (value) => {
        setPeriod(value);
        const params = new URLSearchParams(searchParams);
        if (value === "month") params.delete("orderStatsPeriod");
        else params.set("orderStatsPeriod", value);
        setSearchParams(params, { replace: true });
    };

    const orderStatsColumns = [
        { key: "label", label: period === "year" ? "Năm" : period === "week" ? "Ngày" : "Tháng" },
        { key: "orders", label: "Đơn hàng" },
        { key: "revenue", label: "Doanh thu", format: "currency" },
    ];

    const handleExportOrderStatsExcel = () => {
        if (data.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportExcel({ sheets: [{ name: "ThongKeDH", columns: orderStatsColumns, rows: data }], filename: `ThongKeDH_${new Date().toISOString().slice(0, 10)}` });
    };

    const handleExportOrderStatsPDF = () => {
        if (data.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportPDF({ title: "Thống kê đơn hàng", columns: orderStatsColumns, rows: data, filename: `ThongKeDH_${new Date().toISOString().slice(0, 10)}` });
    };

    const yAxisTickFormatter = (v) =>
        v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(1)}B`
        : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M`
        : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K`
        : v;

    const tableColLabel = period === "year" ? "Năm" : period === "week" ? "Ngày" : "Tháng";

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-full" />)}
                </div>
                <div className="grid gap-4 lg:grid-cols-5">
                    <Skeleton className="lg:col-span-2 h-[220px] w-full rounded-xl" />
                    <Skeleton className="lg:col-span-3 h-[220px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-1.5">
                <div className="flex gap-1.5">
                    {PERIODS.map((p) => (
                        <Button key={p.value} variant="ghost" size="sm" onClick={() => handlePeriodChange(p.value)} className={periodButtonClass(period === p.value)}>
                            {p.label}
                        </Button>
                    ))}
                </div>
                <ExportButton onExportExcel={handleExportOrderStatsExcel} onExportPDF={handleExportOrderStatsPDF} loading={isExporting} />
            </div>
            {data.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">Chưa có dữ liệu</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Thử chọn khoảng thời gian khác để xem thống kê đơn hàng.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{tableColLabel}</TableHead>
                                    <TableHead className="text-right">Đơn</TableHead>
                                    <TableHead className="text-right w-14"></TableHead>
                                    <TableHead className="text-right">Doanh thu</TableHead>
                                    <TableHead className="text-right w-14"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, i) => (
                                    <TableRow key={row.label || i}>
                                        <TableCell className="text-sm font-medium">{row.label}</TableCell>
                                        <TableCell className="text-sm text-right">{formatNumber(row.orders)}</TableCell>
                                        <TableCell className="text-right"><TrendCell change={row.orderChange} /></TableCell>
                                        <TableCell className="text-sm text-right">{formatPrice(row.revenue)}</TableCell>
                                        <TableCell className="text-right"><TrendCell change={row.revenueChange} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="lg:col-span-3 space-y-4">
                        <div className="h-[220px]">
                            <ResponsiveContainer key={period} width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground"
                                        tickFormatter={yAxisTickFormatter}
                                        width={50}
                                    />
                                    <Tooltip content={<ChartTooltip period={period} />} />
                                    <Bar
                                        dataKey="orders"
                                        fill="hsl(217,91%,60%)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {totalOrders > 0 && (
                            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Tổng đơn hàng</p>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{formatNumber(totalOrders)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">{period === "week" ? "so với tuần trước" : period === "month" ? "so với tháng trước" : "so với năm trước"}</p>
                                    {totalOrderChange != null ? (
                                        <p className={cn("mt-0.5 text-sm font-semibold", totalOrderChange >= 0 ? "text-green-600" : "text-red-500")}>
                                            {totalOrderChange >= 0 ? "+" : ""}{totalOrderChange}%
                                        </p>
                                    ) : (
                                        <p className="mt-0.5 text-sm text-muted-foreground">—</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
