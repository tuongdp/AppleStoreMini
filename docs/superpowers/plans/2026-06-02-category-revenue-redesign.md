# Category Revenue Widget — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform category revenue widget into a decision-support tool with period filters, rankings, trends, and insights.

**Architecture:** BE: add per-category change data to existing endpoint. FE: rewrite CategoryPieChart with tabs, rankings table, insights.

**Tech Stack:** Node.js/Prisma (BE), React/Recharts/Tailwind/lucide-react (FE)

---

### Task 1: BE — Add change data to category-revenue API

**Files:**
- Modify: `D:\AppleStoreMini_api\src\services\dashboard.service.js`

- [ ] **Step 1: Read the current `getCategoryRevenue` function and understand its structure**

The function currently:
1. Computes `startDate` based on `period`
2. Queries DELIVERED orders from `startDate`
3. Maps order items to categories via `prisma.category.findMany()`
4. Sums revenue per category (prorated by totalAmount/subtotal ratio)
5. Returns `Object.values(catMap).filter(c => c.value > 0)` — `Array<{ label, value }>`

- [ ] **Step 2: Add previous period date range computation**

At the top of the function, after computing `startDate`, add `prevStartDate` and `prevEndDate`:

```js
let prevStartDate, prevEndDate;

if (period === "week") {
    prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    prevEndDate = new Date(startDate.getTime() - 1);
} else if (period === "year") {
    prevStartDate = new Date(startDate.getFullYear() - 1, 0, 1);
    prevEndDate = new Date(startDate.getFullYear() - 1, 11, 31);
} else {
    // month
    prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    prevEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
}
```

- [ ] **Step 3: Fetch previous period orders**

After the current period orders query, add a second query:

```js
const prevOrders = await prisma.order.findMany({
    where: {
        status: "DELIVERED",
        createdAt: { gte: prevStartDate, lte: prevEndDate },
    },
    select: {
        totalAmount: true,
        subtotal: true,
        items: {
            select: {
                price: true,
                quantity: true,
                variant: { select: { product: { select: { categoryId: true } } } },
            },
        },
    },
});
```

- [ ] **Step 4: Compute previous period category totals**

After computing the current period `catMap`, compute a `prevCatMap` using the same aggregation logic:

```js
const prevCatMap = {};
prevCatMap.unknown = { value: 0 };
categories.forEach((c) => { prevCatMap[c.id] = { value: 0 }; });

prevOrders.forEach((order) => {
    const ratio = order.subtotal > 0 ? toNumber(order.totalAmount) / toNumber(order.subtotal) : 0;
    order.items.forEach((item) => {
        const catId = item.variant?.product?.categoryId || "unknown";
        const itemRevenue = toNumber(item.price) * item.quantity * ratio;
        if (prevCatMap[catId]) {
            prevCatMap[catId].value += itemRevenue;
        }
    });
});
```

- [ ] **Step 5: Merge and compute change percentage**

Change the return statement to merge current and previous data:

```js
return Object.values(catMap)
    .filter((c) => c.value > 0)
    .map((c) => {
        const prevValue = prevCatMap[c.id]?.value || 0;
        const change = prevValue > 0
            ? Math.round(((c.value - prevValue) / prevValue) * 100)
            : null;
        return { categoryId: c.id, label: c.label, value: Math.round(c.value), change };
    });
```

Note: The `catMap` entries need to track their `id`. Change the catMap initialization to store objects with `{ id, label, value }`:

```js
const catMap = {};
catMap.unknown = { id: "unknown", label: "Khác", value: 0 };
categories.forEach((c) => { catMap[c.id] = { id: c.id, label: c.name, value: 0 }; });
```

- [ ] **Step 6: Commit**

```bash
git add src/services/dashboard.service.js
git commit -m "feat: add per-category change data to category-revenue API"
```

---

### Task 2: FE — Rewrite CategoryPieChart widget

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\dashboard\CategoryPieChart.jsx`

- [ ] **Step 1: Rewrite the entire component**

Replace the entire file content with the following complete implementation:

```jsx
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
    { value: "week", label: "Tuần" },
    { value: "month", label: "Tháng" },
    { value: "year", label: "Năm" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

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
    const chartData = data.map((d) => ({ ...d, pct: total > 0 ? (d.value / total) * 100 : 0 }));

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
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-full" />)}
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
                <div className="relative h-48 w-48 shrink-0 mx-auto sm:mx-0">
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
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-foreground">{formatPrice(total)}</span>
                        <span className="text-[10px] text-muted-foreground">{"Tổng doanh thu"}</span>
                    </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                    {chartData.map((cat, i) => (
                        <Link
                            key={cat.categoryId || cat.label}
                            to={`/admin/products?category=${encodeURIComponent(cat.categoryId || "")}`}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                        >
                            <span className="w-5 text-center shrink-0">
                                {i < 3 ? MEDALS[i] : `${i + 1}.`}
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
                        <p>
                            💡 <span className="font-medium text-foreground">{topCategory.label}</span> là danh mục doanh thu cao nhất ({topCategory.pct.toFixed(1)}%)
                        </p>
                    )}
                    {topGrowth && topGrowth.change != null && topGrowth.change > 0 && (
                        <p>
                            📈 <span className="font-medium text-foreground">{topGrowth.label}</span> tăng trưởng mạnh nhất (+{topGrowth.change}%)
                        </p>
                    )}
                    {worstGrowth && worstGrowth.change != null && worstGrowth.change < 0 && (
                        <p>
                            ⚠️ <span className="font-medium text-foreground">{worstGrowth.label}</span> cần chú ý ({worstGrowth.change}%)
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Update AdminDashboard to remove `catRevenue` prop passing**

In `AdminDashboard.jsx`, find the line that renders CategoryPieChart (around line 279):
```jsx
<CardContent><CategoryPieChart data={catRevenue} /></CardContent>
```

Change to (no props — CategoryPieChart now manages its own data):
```jsx
<CardContent><CategoryPieChart /></CardContent>
```

Also remove the now-unused `catRevenue` query (if not used elsewhere):
```jsx
// REMOVE
const { data: catRevenue = [] } = useGetCategoryRevenueQuery();
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/dashboard/CategoryPieChart.jsx src/pages/admin/AdminDashboard.jsx
git commit -m "feat: redesign category revenue widget with rankings, trends, and insights"
```
