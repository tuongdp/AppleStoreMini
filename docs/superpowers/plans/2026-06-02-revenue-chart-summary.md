# Revenue Chart Summary — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add orderChange, avgOrderValue, avgOrderChange to revenue API response and display richer summary in RevenueChart.

**Architecture:** BE: add fields to orderAnalytics.service.js. FE: fix label bug + replace summary grid in RevenueChart.jsx.

**Tech Stack:** Node.js/Prisma (BE), React/Recharts/Tailwind (FE)

---

### Task 1: BE — Add new fields to revenue stats API

**Files:**
- Modify: `D:\AppleStoreMini_api\src\services\orderAnalytics.service.js`

- [ ] **Step 1: Add `_count` to previous period aggregate query**

Change line 35-41, add `_count: true`:

```js
const prevResult = await prisma.order.aggregate({
    where: { status: "DELIVERED", createdAt: { gte: prevStartDate, lte: prevEndDate } },
    _sum: { totalAmount: true },
    _count: true,
});
```

- [ ] **Step 2: Extract prev count and compute new fields**

After the `revenueChange` computation (around line 104), add:

```js
const prevTotalOrders = prevResult._count;
const orderChange = prevTotalOrders > 0
    ? Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 100)
    : 0;

const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

const prevTotalRevenue = toNumber(prevResult._sum.totalAmount);
const prevAvgOrderValue = prevTotalOrders > 0 ? Math.round(prevTotalRevenue / prevTotalOrders) : 0;
const avgOrderChange = prevAvgOrderValue > 0
    ? Math.round(((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100)
    : 0;
```

- [ ] **Step 3: Update return statement**

Change line 106:

```js
return { chart, totalRevenue, totalOrders, revenueChange, orderChange, avgOrderValue, avgOrderChange };
```

- [ ] **Step 4: Commit**

```bash
git add src/services/orderAnalytics.service.js
git commit -m "feat: add orderChange, avgOrderValue, avgOrderChange to revenue stats"
```

---

### Task 2: FE — Fix label bug + richer summary

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\dashboard\RevenueChart.jsx`

- [ ] **Step 1: Fix comparison label for month period**

Change line 244:

```jsx
// Before
{period === "week" ? "so với tuần trước" : "so với năm trước"}

// After
{period === "week" ? "so với tuần trước" : period === "month" ? "so với tháng trước" : "so với năm trước"}
```

- [ ] **Step 2: Add TrendingUp/TrendingDown import**

Add to lucide-react import:
```jsx
import { TrendingUp, TrendingDown } from "lucide-react";
```

- [ ] **Step 3: Replace bottom summary grid with 3-row layout**

Replace the entire `{data && (` block at lines 224-258 with:

```jsx
            {data && (
                <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Doanh thu</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{formatPrice(data.totalRevenue ?? 0)}</span>
                            <span className={cn(
                                "flex items-center gap-0.5 text-xs font-medium",
                                (data.revenueChange ?? 0) >= 0 ? "text-green-600" : "text-red-500",
                            )}>
                                {(data.revenueChange ?? 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {(data.revenueChange ?? 0) >= 0 ? "+" : ""}{data.revenueChange ?? 0}%
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Đơn hàng</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{formatNumber(data.totalOrders ?? 0)}</span>
                            {(data.orderChange !== undefined || data.orderChange !== null) && (
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

                    {data.avgOrderValue != null && data.avgOrderValue > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Giá trị trung bình đơn</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{formatPrice(data.avgOrderValue ?? 0)}</span>
                                {(data.avgOrderChange !== undefined || data.avgOrderChange !== null) && (
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
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/dashboard/RevenueChart.jsx
git commit -m "feat: richer revenue summary with order and avg order value change"
```
