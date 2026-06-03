# Admin KPI Cards Restructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure admin dashboard KPI cards from 7 to 6, reorder by priority, add actionable notes.

**Architecture:** Single-file edit in `AdminDashboard.jsx`. Modify the inline `metricCards` array, adjust grid layout, clean up unused imports/queries.

**Tech Stack:** React, Redux Toolkit Query, Tailwind CSS

---

### Task 1: Restructure KPI Cards

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx`

- [ ] **Step 1: Remove unused imports**

Remove `Receipt` and `TicketPercent` from lucide-react import block (lines 12 and 16):

```jsx
// Before
import {
    // ... others
    Package,
    Receipt,          // REMOVE
    // ...
    TicketPercent,    // REMOVE
    TrendingUp,
    Users,
} from "lucide-react";

// After
import {
    // ... others
    Package,
    TrendingUp,
    Users,
} from "lucide-react";
```

Remove `useGetCouponStatsQuery` from ordersApi import (line 30):

```jsx
// Before
import {
    useGetCategoryRevenueQuery,
    useGetCouponStatsQuery,    // REMOVE
    // ...
} from "@/store/api/ordersApi";

// After
import {
    useGetCategoryRevenueQuery,
    // ...
} from "@/store/api/ordersApi";
```

- [ ] **Step 2: Remove unused data fetching and computed values**

Remove `couponStats` query (line 126):

```jsx
// REMOVE this line
const { data: couponStats } = useGetCouponStatsQuery();
```

Remove `aov` computation (line 137):

```jsx
// REMOVE this line
const aov = stats?.totalRevenue && stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;
```

- [ ] **Step 3: Replace metricCards array with 6 reordered cards**

Replace the entire `metricCards` useMemo block (lines 142-192):

```jsx
const metricCards = useMemo(() => [
    {
        title: "Đơn cần xử lý",
        value: formatNumber((operations?.orders?.pending || 0) + (operations?.orders?.confirmed || 0)),
        note: "Cần xác nhận / xử lý hôm nay",
        icon: Clock,
        tone: (operations?.orders?.pending || 0) > 0 ? "danger" : "order",
    },
    {
        title: "Doanh thu hôm nay",
        value: formatPrice(operations?.revenue?.today ?? stats?.todayRevenue ?? 0),
        note: `Tháng này ${formatPrice(operations?.revenue?.month ?? 0)}`,
        icon: TrendingUp,
        tone: "revenue",
    },
    {
        title: "Đơn hàng hôm nay",
        value: formatNumber(operations?.orders?.today || 0),
        note: "Tổng đơn đặt trong ngày",
        icon: ShoppingBag,
        tone: "order",
    },
    {
        title: "Tỷ lệ giao thành công",
        value: `${operations?.orders?.deliveryRate ?? 0}%`,
        note: `Hủy/hoàn ${operations?.orders?.problemRate ?? returnRate}%`,
        icon: CheckCircle2,
        tone: "order",
    },
    {
        title: "Tồn kho cần chú ý",
        value: formatNumber((operations?.inventory?.lowStockVariants || 0) + (operations?.inventory?.outOfStockVariants || 0)),
        note: "Có sản phẩm sắp hết / đã hết hàng",
        icon: Package,
        tone: "warning",
    },
    {
        title: "Khách hàng mới",
        value: formatNumber(operations?.customers?.newToday || 0),
        note: `${formatNumber(operations?.customers?.unverified || 0)} tài khoản chưa xác thực`,
        icon: Users,
        tone: "default",
    },
], [operations, returnRate, stats]);
```

- [ ] **Step 4: Change grid layout class**

In the grid div that renders metricCards (line 238), change `xl:grid-cols-4` to `xl:grid-cols-3`:

```jsx
// Before
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

// After
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Expected: Build passes, no TS/ESLint errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "feat: restructure admin KPI cards — 6 cards reordered by priority, remove voucher and AOV"
```
