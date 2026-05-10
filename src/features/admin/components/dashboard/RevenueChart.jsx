import { useState } from "react";
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
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PERIODS = [
    { value: "week", labelKey: "dashboard.week" },
    { value: "month", labelKey: "dashboard.month" },
    { value: "year", labelKey: "dashboard.year" },
];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-md">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">
                {formatPrice(payload[0]?.value || 0)}
            </p>
            {payload[1] && (
                <p className="text-xs text-muted-foreground">
                    {payload[1].name}: {payload[1].value}
                </p>
            )}
        </div>
    );
}

export default function RevenueChart() {
    const [period, setPeriod] = useState("month");

    const { data, isLoading } = useGetRevenueStatsQuery({ period });

    // ✅ getRevenueStatsQuery transformResponse → response.data trực tiếp
    // shape: { chart, totalRevenue, totalOrders, revenueChange }
    const chartData = data?.chart ?? [];

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-16 rounded-full" />
                    ))}
                </div>
                <Skeleton className="h-[280px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-1.5">
                {PERIODS.map((p) => (
                    <Button
                        key={p.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => setPeriod(p.value)}
                        className={cn(
                            "rounded-full text-xs",
                            period === p.value
                                ? "bg-foreground text-background hover:bg-foreground/90"
                                : "text-muted-foreground",
                        )}
                    >
                        {t(p.labelKey)}
                    </Button>
                ))}
            </div>

            {chartData.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                        {"Không có dữ liệu"}
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
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
                                    stopColor="hsl(var(--foreground))"
                                    stopOpacity={0.15}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--foreground))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 11,
                                fill: "hsl(var(--muted-foreground))",
                            }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 11,
                                fill: "hsl(var(--muted-foreground))",
                            }}
                            tickFormatter={(value) => {
                                if (value >= 1_000_000_000)
                                    return `${(value / 1_000_000_000).toFixed(1)}B`;
                                if (value >= 1_000_000)
                                    return `${(value / 1_000_000).toFixed(0)}M`;
                                if (value >= 1_000)
                                    return `${(value / 1_000).toFixed(0)}K`;
                                return value;
                            }}
                            width={56}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--foreground))"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                            dot={false}
                            activeDot={{
                                r: 4,
                                fill: "hsl(var(--foreground))",
                                strokeWidth: 0,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}

            {/* ✅ data là object trực tiếp sau transformResponse — không cần .data thêm */}
            {data && (
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            {"Tổng doanh thu"}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {formatPrice(data.totalRevenue ?? 0)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            {"Tổng đơn hàng"}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {data.totalOrders ?? 0}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            {"so với tháng trước"}
                        </p>
                        <p
                            className={cn(
                                "mt-0.5 text-sm font-semibold",
                                (data.revenueChange ?? 0) >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-500",
                            )}
                        >
                            {(data.revenueChange ?? 0) >= 0 ? "+" : ""}
                            {data.revenueChange ?? 0}%
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
