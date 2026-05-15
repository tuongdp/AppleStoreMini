import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";

const DONUT_COLORS = [
    "hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(160,84%,39%)",
    "hsl(330,81%,60%)", "hsl(262,83%,58%)", "hsl(0,84%,60%)",
    "hsl(189,94%,43%)", "hsl(80,70%,50%)"
];

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-md">
            <p className="text-xs font-medium text-foreground">{d.label}</p>
            <p className="text-sm font-semibold text-foreground">{formatPrice(d.value)}</p>
            <p className="text-xs text-muted-foreground">{(d.pct).toFixed(1)}%</p>
        </div>
    );
}

export default function CategoryPieChart({ data }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>;

    const chartData = data.map((d) => ({ ...d, pct: (d.value / total) * 100 }));

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative h-48 w-48 shrink-0">
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
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-bold text-foreground">{formatPrice(total)}</span>
                    <span className="text-[10px] text-muted-foreground">Tổng</span>
                </div>
            </div>
            <div className="space-y-2">
                {chartData.map((s, i) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-medium ml-auto tabular-nums">{s.pct.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
