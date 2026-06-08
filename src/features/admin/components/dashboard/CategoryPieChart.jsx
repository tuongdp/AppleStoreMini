import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
import { AlertTriangle, Lightbulb, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCategoryRevenueQuery } from "@/store/api/ordersApi";
import { formatPrice, cn } from "@/lib/utils";

const DONUT_COLORS = [
    "hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(160,84%,39%)",
    "hsl(330,81%,60%)", "hsl(262,83%,58%)", "hsl(0,84%,60%)",
    "hsl(189,94%,43%)", "hsl(80,70%,50%)"
];

const PERIODS = [
    { value: "day", label: "Ngày" },
    { value: "week", label: "Tuần" },
    { value: "month", label: "Tháng" },
    { value: "year", label: "Năm" },
];

function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-md">
            <p className="text-xs font-medium text-foreground">{d.label}</p>
            <p className="text-sm font-semibold text-foreground">{formatPrice(d.value)}</p>
            <p className="text-xs text-muted-foreground">{d.pct.toFixed(1)}%</p>
        </div>
    );
}

function TrendBadge({ change }) {
    if (change == null) return <Minus className="h-3 w-3 text-muted-foreground" />;
    const up = change >= 0;
    return (
        <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            up ? "text-green-600" : "text-red-500",
        )}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{change}%
        </span>
    );
}

const periodButtonClass = (active) =>
    cn(
        "rounded-full text-xs h-8",
        active
            ? "bg-foreground text-background hover:bg-foreground hover:text-background"
            : "text-muted-foreground",
    );

export default function CategoryPieChart() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPeriod = PERIODS.some((p) => p.value === searchParams.get("catPeriod"))
        ? searchParams.get("catPeriod")
        : "month";
    const [period, setPeriod] = useState(initialPeriod);

    const { data = [], isLoading, isError, error } = useGetCategoryRevenueQuery({ period });

    const total = data.reduce((s, d) => s + (d.value || 0), 0);
    const chartData = data
        .map((d) => ({ ...d, pct: total > 0 ? (d.value / total) * 100 : 0 }))
        .sort((a, b) => b.value - a.value);

    // Insights
    const topCategory = chartData.length > 0 ? chartData[0] : null;
    const topGrowth = [...chartData]
        .filter((d) => d.change != null)
        .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0];
    const worstGrowth = [...chartData]
        .filter((d) => d.change != null)
        .sort((a, b) => (a.change ?? 0) - (b.change ?? 0))[0];

    const handlePeriodChange = (value) => {
        setPeriod(value);
        const params = new URLSearchParams(searchParams);
        if (value === "month") params.delete("catPeriod");
        else params.set("catPeriod", value);
        setSearchParams(params, { replace: true });
    };

    if (isError) {
        return (
            <div className="flex h-[280px] items-center justify-center rounded-xl bg-muted/30">
                <p className="text-sm text-destructive">
                    Lỗi tải dữ liệu: {error?.data?.message || "Không thể kết nối máy chủ"}
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-full" />)}
                </div>
                <div className="flex gap-6">
                    <Skeleton className="h-48 w-48 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-7 w-full rounded" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (total === 0) {
        return (
            <div>
                <div className="flex gap-1.5 mb-4">
                    {PERIODS.map((p) => (
                        <Button key={p.value} variant="ghost" size="sm" onClick={() => handlePeriodChange(p.value)} className={periodButtonClass(period === p.value)}>
                            {p.label}
                        </Button>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-1.5">
                {PERIODS.map((p) => (
                    <Button key={p.value} variant="ghost" size="sm" onClick={() => handlePeriodChange(p.value)} className={periodButtonClass(period === p.value)}>
                        {p.label}
                    </Button>
                ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="h-48 w-48 shrink-0 mx-auto sm:mx-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                ))}
                                <Label
                                    content={({ viewBox: { cx, cy } }) => (
                                        <g>
                                            <text
                                                x={cx}
                                                y={cy - 4}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-foreground text-sm font-bold"
                                                style={{ fontSize: 14, fontWeight: 700 }}
                                            >
                                                {formatPrice(total)}
                                            </text>
                                            <text
                                                x={cx}
                                                y={cy + 14}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-muted-foreground"
                                                style={{ fontSize: 10 }}
                                            >
                                                Tổng doanh thu
                                            </text>
                                        </g>
                                    )}
                                />
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                    {chartData.map((cat, i) => (
                        <Link
                            key={cat.categoryId || cat.label}
                            to={`/admin/products?category=${encodeURIComponent(cat.categoryId || "")}`}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                        >
                            <span className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
                                i === 0 && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                                i === 1 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                i === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
                                i > 2 && "bg-muted text-muted-foreground",
                            )}>
                                {i + 1}
                            </span>
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            <span className="font-medium text-foreground truncate">{cat.label}</span>
                            <span className="ml-auto text-muted-foreground tabular-nums shrink-0">
                                {formatPrice(cat.value || 0)}
                            </span>
                            <span className="text-muted-foreground tabular-nums w-12 text-right shrink-0">
                                {cat.pct.toFixed(1)}%
                            </span>
                            <span className="w-16 shrink-0 flex justify-end">
                                <TrendBadge change={cat.change} />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {(topCategory || topGrowth || worstGrowth) && (
                <div className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    {topCategory && (
                        <p className="flex items-start gap-1.5">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                            <span>
                                <span className="font-medium text-foreground">{topCategory.label}</span> là danh mục doanh thu cao nhất ({topCategory.pct.toFixed(1)}%)
                            </span>
                        </p>
                    )}
                    {topGrowth && topGrowth.change != null && topGrowth.change > 0 && (
                        <p className="flex items-start gap-1.5">
                            <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                            <span>
                                <span className="font-medium text-foreground">{topGrowth.label}</span> tăng trưởng mạnh nhất (+{topGrowth.change}%)
                            </span>
                        </p>
                    )}
                    {worstGrowth && worstGrowth.change != null && worstGrowth.change < 0 && (
                        <p className="flex items-start gap-1.5">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                            <span>
                                <span className="font-medium text-foreground">{worstGrowth.label}</span> cần chú ý ({worstGrowth.change}%)
                            </span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
