import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGetOrderStatsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatNumber, cn } from "@/lib/utils";

const PERIODS = [
    { value: "week", label: "Tuần" },
    { value: "month", label: "Tháng" },
    { value: "year", label: "Năm" },
];

export default function OrderStats() {
    const [period, setPeriod] = useState("month");
    const { data = [], isLoading } = useGetOrderStatsQuery({ period });

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-full" />)}
                </div>
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>;
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
                        className={cn("rounded-full text-xs", period === p.value ? "bg-foreground text-background hover:bg-foreground/90" : "text-muted-foreground")}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{period === "year" ? "Năm" : "Tháng"}</TableHead>
                                <TableHead className="text-right">Đơn</TableHead>
                                <TableHead className="text-right">Doanh thu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.label}>
                                    <TableCell className="text-sm font-medium">{row.label}</TableCell>
                                    <TableCell className="text-sm text-right">{formatNumber(row.orders)}</TableCell>
                                    <TableCell className="text-sm text-right">{formatPrice(row.revenue)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="lg:col-span-3 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground"
                                tickFormatter={(v) => v >= 1_000_000_000 ? `${(v/1_000_000_000).toFixed(1)}B` : v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : v}
                                width={50}
                            />
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--popover))" }}
                                formatter={(value) => [formatPrice(value), "Doanh thu"]}
                            />
                            <Bar dataKey="revenue" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
