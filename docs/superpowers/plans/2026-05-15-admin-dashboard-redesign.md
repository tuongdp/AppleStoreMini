# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp admin dashboard with order stats, top/slow products, top customers, better charts, and consolidated API calls.

**Architecture:** Backend adds 4 new Prisma aggregation endpoints. Frontend adds 4 new Recharts-based components, updates 3 existing ones, and restructures AdminDashboard layout to 6 rows. Single `useGetDashboardStatsQuery` replaces 4 separate API calls.

**Tech Stack:** Express + Prisma (backend), React + Recharts + Redux Toolkit Query (frontend)

---

### Task 1: Backend — Add service functions to order.service.js

**Files:**
- Modify: `D:\AppleStoreMini_api\src\services\order.service.js` — append after line 704

- [ ] **Step 1: Add getOrderStats function**

```js
const getOrderStats = async ({ period = "month" } = {}) => {
    const now = new Date();
    let startDate;
    if (period === "year") {
        startDate = new Date(now.getFullYear() - 2, 0, 1);
    } else {
        startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    }

    const orders = await prisma.order.findMany({
        where: {
            status: "DELIVERED",
            createdAt: { gte: startDate },
        },
        select: { totalAmount: true, createdAt: true },
    });

    const map = {};
    orders.forEach((o) => {
        const d = new Date(o.createdAt);
        let key;
        if (period === "year") {
            key = `${d.getFullYear()}`;
        } else {
            key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        }
        if (!map[key]) {
            map[key] = { orders: 0, revenue: 0 };
        }
        map[key].orders += 1;
        map[key].revenue += o.totalAmount;
    });

    const data = Object.keys(map)
        .sort()
        .map((k) => {
            let label;
            if (period === "year") {
                label = `Năm ${k}`;
            } else {
                const [y, m] = k.split("-");
                label = `T${m}/${y}`;
            }
            const daysInPeriod = period === "year" ? 365 : new Date(parseInt(y), parseInt(m), 0).getDate();
            return {
                label,
                orders: map[k].orders,
                revenue: map[k].revenue,
                avgPerDay: Math.round((map[k].orders / daysInPeriod) * 10) / 10,
            };
        });

    return data;
};
```

- [ ] **Step 2: Add getTopProducts function**

```js
const getTopProducts = async ({ period = "month", limit = 5 } = {}) => {
    const now = new Date();
    let startDate;
    if (period === "week") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (period === "year") {
        startDate = new Date(now.getFullYear(), 0, 1);
    } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const items = await prisma.orderItem.findMany({
        where: {
            order: {
                status: { in: ["DELIVERED", "SHIPPING"] },
                createdAt: { gte: startDate },
            },
        },
        select: {
            quantity: true,
            variant: {
                select: {
                    productId: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            price: true,
                            images: true,
                            inStock: true,
                            soldCount: true,
                            category: { select: { slug: true } },
                        },
                    },
                },
            },
        },
    });

    const productMap = {};
    items.forEach((i) => {
        const p = i.variant?.product;
        if (!p) return;
        const pid = p.id;
        if (!productMap[pid]) {
            productMap[pid] = {
                id: pid,
                name: p.name,
                slug: p.slug,
                price: p.price,
                images: p.images,
                inStock: p.inStock,
                soldCount: p.soldCount,
                categorySlug: p.category?.slug || "unknown",
                periodSold: 0,
            };
        }
        productMap[pid].periodSold += i.quantity;
    });

    return Object.values(productMap)
        .sort((a, b) => b.periodSold - a.periodSold)
        .slice(0, limit)
        .map((p) => ({ ...p, soldCount: p.periodSold }));
};
```

- [ ] **Step 3: Add getSlowProducts function**

```js
const getSlowProducts = async ({ days = 30, limit = 5 } = {}) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const items = await prisma.orderItem.findMany({
        where: {
            order: {
                status: { in: ["DELIVERED", "SHIPPING"] },
                createdAt: { gte: since },
            },
        },
        select: {
            quantity: true,
            variant: { select: { productId: true } },
        },
    });

    const productSoldMap = {};
    items.forEach((i) => {
        const pid = i.variant?.productId;
        if (!pid) return;
        productSoldMap[pid] = (productSoldMap[pid] || 0) + i.quantity;
    });

    const allProducts = await prisma.product.findMany({
        where: { inStock: true },
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            soldCount: true,
            stock: true,
            category: { select: { slug: true } },
            variants: { select: { stock: true } },
        },
        orderBy: { soldCount: "asc" },
        take: limit * 3,
    });

    const result = allProducts
        .map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            images: p.images,
            soldCount: productSoldMap[p.id] || 0,
            totalSold: p.soldCount,
            categorySlug: p.category?.slug || "unknown",
            totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
        }))
        .sort((a, b) => a.soldCount - b.soldCount)
        .slice(0, limit);

    return result;
};
```

- [ ] **Step 4: Add getOrderStatusDistribution function**

```js
const getOrderStatusDistribution = async () => {
    const result = await prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
    });
    return result.map((r) => ({ status: r.status, count: r._count.status }));
};
```

- [ ] **Step 5: Add getTopCustomers function**

```js
const getTopCustomers = async ({ limit = 5 } = {}) => {
    const result = await prisma.order.groupBy({
        by: ["userId"],
        where: { status: "DELIVERED" },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: "desc" } },
        take: limit,
    });

    const userIds = result.map((r) => r.userId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullName: true, email: true, avatar: true },
    });

    const userMap = {};
    users.forEach((u) => { userMap[u.id] = u; });

    return result.map((r) => ({
        id: r.userId,
        fullName: userMap[r.userId]?.fullName || "Unknown",
        email: userMap[r.userId]?.email || "",
        avatar: userMap[r.userId]?.avatar || null,
        totalSpent: r._sum.totalAmount || 0,
        orderCount: r._count.id,
    }));
};
```

- [ ] **Step 6: Export new functions — update module.exports at bottom of file**

Find the `module.exports` line at the bottom and add the 5 new function names: `getOrderStats`, `getTopProducts`, `getSlowProducts`, `getOrderStatusDistribution`, `getTopCustomers`.

- [ ] **Step 7: Commit**

```bash
git add src/services/order.service.js
git commit -m "feat: add getOrderStats, getTopProducts, getSlowProducts, getOrderStatusDistribution, getTopCustomers services"
```

---

### Task 2: Backend — Add controller handlers to dashboard.controller.js

**Files:**
- Modify: `D:\AppleStoreMini_api\src\controllers\admin\dashboard.controller.js`

- [ ] **Step 1: Add totalReturns to getStats controller**

In `getStats`, add `prisma.returnRequest.count()` to the `Promise.all` array and include in the response:

Change:
```js
const [
    totalRevenue, totalOrders, totalProducts, totalUsers,
    pendingOrders, todayRevenue,
] = await Promise.all([
    orderService.getTotalRevenue(),
    orderService.getTotalOrders(),
    productService.getTotalProducts(),
    userService.getTotalUsers(),
    orderService.getPendingOrdersCount(),
    orderService.getTodayRevenue(todayStart),
]);

res.json(new ApiResponse(200, {
    totalRevenue, totalOrders, totalProducts, totalUsers,
    pendingOrders, todayRevenue,
}, "Thành công"));
```

To:
```js
const [
    totalRevenue, totalOrders, totalProducts, totalUsers,
    pendingOrders, todayRevenue, totalReturns,
] = await Promise.all([
    orderService.getTotalRevenue(),
    orderService.getTotalOrders(),
    productService.getTotalProducts(),
    userService.getTotalUsers(),
    orderService.getPendingOrdersCount(),
    orderService.getTodayRevenue(todayStart),
    prisma.returnRequest.count(),
]);

res.json(new ApiResponse(200, {
    totalRevenue, totalOrders, totalProducts, totalUsers,
    pendingOrders, todayRevenue, totalReturns,
}, "Thành công"));
```

Note: `prisma` is already imported at the top of the file (line 6).

- [ ] **Step 2: Add 4 new handler functions before module.exports**

Insert before the `module.exports` line:

```js
const getOrderStats = catchAsync(async (req, res) => {
    const data = await orderService.getOrderStats(req.query);
    res.json(new ApiResponse(200, data, "Thành công"));
});

const getTopProducts = catchAsync(async (req, res) => {
    const data = await orderService.getTopProducts(req.query);
    res.json(new ApiResponse(200, data, "Thành công"));
});

const getSlowProducts = catchAsync(async (req, res) => {
    const data = await orderService.getSlowProducts(req.query);
    res.json(new ApiResponse(200, data, "Thành công"));
});

const getOrderStatusDistribution = catchAsync(async (req, res) => {
    const data = await orderService.getOrderStatusDistribution();
    res.json(new ApiResponse(200, data, "Thành công"));
});

const getTopCustomers = catchAsync(async (req, res) => {
    const data = await orderService.getTopCustomers(req.query);
    res.json(new ApiResponse(200, data, "Thành công"));
});
```

- [ ] **Step 2: Update module.exports**

```js
module.exports = { getRevenueStats, getStats, getLowStock, getCategoryRevenue, getPointsStats, getCouponStats, getOrderStats, getTopProducts, getSlowProducts, getOrderStatusDistribution, getTopCustomers };
```

- [ ] **Step 3: Commit**

```bash
git add src/controllers/admin/dashboard.controller.js
git commit -m "feat: add order stats, top/slow products, status distribution, top customers controllers"
```

---

### Task 3: Backend — Register routes in admin.routes.js

**Files:**
- Modify: `D:\AppleStoreMini_api\src\routes\admin.routes.js:84-85`

- [ ] **Step 1: Add 5 new routes after the coupon-stats line**

```js
router.get("/dashboard/order-stats", hasPermission("dashboard"), dashboardCtrl.getOrderStats);
router.get("/dashboard/top-products", hasPermission("dashboard"), dashboardCtrl.getTopProducts);
router.get("/dashboard/slow-products", hasPermission("dashboard"), dashboardCtrl.getSlowProducts);
router.get("/dashboard/order-status-distribution", hasPermission("dashboard"), dashboardCtrl.getOrderStatusDistribution);
router.get("/dashboard/top-customers", hasPermission("dashboard"), dashboardCtrl.getTopCustomers);
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/admin.routes.js
git commit -m "feat: register new dashboard API routes"
```

---

### Task 4: Backend — Push & test APIs

**Files:** None (verification only)

- [ ] **Step 1: Push to origin** (backend auto-deploys to Render)

```bash
git push origin main
```

Wait for Render deployment.

- [ ] **Step 2: Test each new endpoint**

```bash
curl https://applestoremini-api.onrender.com/api/admin/dashboard/order-stats?period=month
curl https://applestoremini-api.onrender.com/api/admin/dashboard/top-products?period=month&limit=5
curl https://applestoremini-api.onrender.com/api/admin/dashboard/slow-products?days=30&limit=5
curl https://applestoremini-api.onrender.com/api/admin/dashboard/order-status-distribution
curl https://applestoremini-api.onrender.com/api/admin/dashboard/top-customers?limit=5
```

All should return 200 with `{ code: 200, data: [...], message: "Thành công" }`.

---

### Task 5: Frontend — Add RTK Query hooks to ordersApi.js

**Files:**
- Modify: `D:\AppleStoreMini\src\store\api\ordersApi.js:168-196` (add new endpoints)
- Modify: `D:\AppleStoreMini\src\store\api\ordersApi.js:200-224` (add new exports)

- [ ] **Step 1: Add getDashboardStats query (use existing `/dashboard/stats` endpoint)**

Insert after line 172 (`getRevenueStats`):

```js
        // GET /admin/dashboard/stats (single call replaces 4 separate ones)
        getDashboardStats: builder.query({
            query: () => "/admin/dashboard/stats",
            transformResponse: (response) => response.data,
        }),
```

- [ ] **Step 2: Add getOrderStats, getTopProducts, getSlowProducts, getOrderStatusDistribution, getTopCustomers**

Insert after the `getCouponStats` block (after line 196):

```js
        // GET /admin/dashboard/order-stats?period=month|year
        getOrderStats: builder.query({
            query: (params) => ({ url: "/admin/dashboard/order-stats", params }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/top-products?period=week|month|year&limit=5
        getTopProducts: builder.query({
            query: (params) => ({ url: "/admin/dashboard/top-products", params }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/slow-products?days=30&limit=5
        getSlowProducts: builder.query({
            query: (params) => ({ url: "/admin/dashboard/slow-products", params }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/order-status-distribution
        getOrderStatusDistribution: builder.query({
            query: () => "/admin/dashboard/order-status-distribution",
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/top-customers?limit=5
        getTopCustomers: builder.query({
            query: (params) => ({ url: "/admin/dashboard/top-customers", params }),
            transformResponse: (response) => response.data,
        }),
```

- [ ] **Step 3: Add new exports at bottom**

```js
export const {
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useCreateOrderMutation,
    useCreatePaymentMutation,
    useCancelOrderMutation,
    useCancelOrderByAdminMutation,
    useConfirmDeliveredMutation,
    useGetAllOrdersQuery,
    useGetAdminOrderByIdQuery,
    useUpdateOrderStatusMutation,
    useGetRevenueStatsQuery,
    useGetLowStockQuery,
    useGetCategoryRevenueQuery,
    useGetPointsStatsQuery,
    useGetCouponStatsQuery,
    useCreateReturnRequestMutation,
    useGetOrderReturnRequestQuery,
    useGetMyReturnsQuery,
    useGetReturnByIdQuery,
    useGetAllReturnsQuery,
    useGetAdminReturnByIdQuery,
    useApproveReturnMutation,
    useRejectReturnMutation,
    useGetDashboardStatsQuery,
    useGetOrderStatsQuery,
    useGetTopProductsQuery,
    useGetSlowProductsQuery,
    useGetOrderStatusDistributionQuery,
    useGetTopCustomersQuery,
} = ordersApi;
```

- [ ] **Step 4: Commit**

```bash
git add src/store/api/ordersApi.js
git commit -m "feat: add dashboard stats, order stats, top/slow products, status distribution, top customers RTK Query hooks"
```

---

### Task 6: Frontend — Create CategoryPieChart component

**Files:**
- Create: `D:\AppleStoreMini\src\features\admin\components\dashboard\CategoryPieChart.jsx`

- [ ] **Step 1: Write component using Recharts PieChart**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/components/dashboard/CategoryPieChart.jsx
git commit -m "feat: add CategoryPieChart component using Recharts"
```

---

### Task 7: Frontend — Create OrderStats component

**Files:**
- Create: `D:\AppleStoreMini\src\features\admin\components\dashboard\OrderStats.jsx`

- [ ] **Step 1: Write component with table + bar chart + toggle**

```jsx
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGetOrderStatsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatNumber, cn } from "@/lib/utils";

const PERIODS = [
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/components/dashboard/OrderStats.jsx
git commit -m "feat: add OrderStats component with table and bar chart"
```

---

### Task 8: Frontend — Update TopProducts with period toggle

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\dashboard\TopProducts.jsx`

- [ ] **Step 1: Replace the entire file with new version**

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetTopProductsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const PERIODS = [
    { value: "week", label: "Tuần" },
    { value: "month", label: "Tháng" },
    { value: "year", label: "Năm" },
];

const getFirstImage = (images) => {
    if (!images) return "";
    if (Array.isArray(images)) return images[0] || "";
    try {
        return JSON.parse(images)[0] || "";
    } catch {
        return "";
    }
};

export default function TopProducts() {
    const [period, setPeriod] = useState("month");
    const { data = [], isLoading } = useGetTopProductsQuery({ period, limit: 5 });

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-7 w-14 rounded-full" />)}
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-1.5">
                {PERIODS.map((p) => (
                    <Button key={p.value} variant="ghost" size="sm" onClick={() => setPeriod(p.value)}
                        className={cn("rounded-full text-xs h-7", period === p.value ? "bg-foreground text-background hover:bg-foreground/90" : "text-muted-foreground")}>
                        {p.label}
                    </Button>
                ))}
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
            ) : (
                <div className="space-y-1">
                    <div className="mb-2 grid grid-cols-12 gap-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Tên sản phẩm</div>
                        <div className="col-span-2 text-center">Đã bán</div>
                        <div className="col-span-2 text-center">Trạng thái</div>
                        <div className="col-span-2 text-right">Giá bán</div>
                    </div>
                    {data.map((product, index) => (
                        <Link key={product.id} to={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                            className="grid grid-cols-12 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50">
                            <div className="col-span-1">
                                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                    index === 0 && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                                    index === 1 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                    index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
                                    index > 2 && "bg-muted text-muted-foreground")}>
                                    {index + 1}
                                </span>
                            </div>
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                                    <img src={getFirstImage(product.images)} alt={product.name} className="h-full w-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.categorySlug}</p>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-sm font-medium text-foreground">{formatNumber(product.soldCount)}</span>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                                    product.inStock ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400")}>
                                    {product.inStock ? "Còn hàng" : "Ngừng bán"}
                                </span>
                            </div>
                            <div className="col-span-2 text-right">
                                <span className="text-sm font-medium text-foreground">{formatPrice(product.price)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/components/dashboard/TopProducts.jsx
git commit -m "feat: add period toggle to TopProducts, use new top-products API"
```

---

### Task 9: Frontend — Update OrderStatusChart to use new API

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\dashboard\OrderStatusChart.jsx`

- [ ] **Step 1: Replace data fetching with new API hook**

Change the first ~30 lines. Replace:

```jsx
import { useGetAllOrdersQuery } from "@/store/api/ordersApi";
```

With:

```jsx
import { useGetOrderStatusDistributionQuery } from "@/store/api/ordersApi";
```

Replace the query call and data processing:

```jsx
export default function OrderStatusChart() {
    const { data = [], isLoading } = useGetOrderStatusDistributionQuery();
    const total = data.reduce((s, d) => s + d.count, 0) || 1;

    const counts = STATUS_LIST.reduce((acc, status) => {
        const found = data.find((d) => d.status === status);
        acc[status] = found ? found.count : 0;
        return acc;
    }, {});
```

Remove the old `useGetAllOrdersQuery` line and `orders` variable. Keep the rest of the component (STATUS_LIST, STATUS_LABELS, render JSX) exactly as-is.

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/components/dashboard/OrderStatusChart.jsx
git commit -m "feat: update OrderStatusChart to use server-side status distribution API"
```

---

### Task 10: Frontend — Create SlowProducts component

**Files:**
- Create: `D:\AppleStoreMini\src\features\admin\components\dashboard\SlowProducts.jsx`

- [ ] **Step 1: Write component**

```jsx
import { Link } from "react-router-dom";
import { useGetSlowProductsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const getFirstImage = (images) => {
    if (!images) return "";
    if (Array.isArray(images)) return images[0] || "";
    try { return JSON.parse(images)[0] || ""; } catch { return ""; }
};

export default function SlowProducts() {
    const { data = [], isLoading } = useGetSlowProductsQuery({ days: 30, limit: 5 });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Tất cả sản phẩm đều có bán</p>;
    }

    return (
        <div className="space-y-1">
            {data.map((product, index) => (
                <Link key={product.id} to={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50">
                    <span className="flex h-5 w-5 items-center justify-center rounded text-xs font-medium bg-muted text-muted-foreground shrink-0">
                        {index + 1}
                    </span>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                        <img src={getFirstImage(product.images)} alt={product.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.categorySlug} · Tồn: {product.totalStock}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <span className={cn("text-sm font-medium", product.soldCount === 0 ? "text-red-500" : "text-muted-foreground")}>
                            {product.soldCount === 0 ? "0 bán" : `${product.soldCount} bán`}
                        </span>
                        <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/components/dashboard/SlowProducts.jsx
git commit -m "feat: add SlowProducts component showing least sold products"
```

---

### Task 11: Frontend — Create TopCustomers component

**Files:**
- Create: `D:\AppleStoreMini\src\features\admin\components\dashboard\TopCustomers.jsx`

- [ ] **Step 1: Write component**

```jsx
import { useGetTopCustomersQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function TopCustomers() {
    const { data = [], isLoading } = useGetTopCustomersQuery({ limit: 5 });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>;
    }

    const maxSpent = data[0]?.totalSpent || 1;

    return (
        <div className="space-y-3">
            {data.map((cust, index) => {
                const initials = (cust.fullName || "U")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (
                    <div key={cust.id} className="flex items-center gap-3">
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                            index === 0 && "bg-amber-100 text-amber-700",
                            index === 1 && "bg-slate-100 text-slate-600",
                            index === 2 && "bg-orange-100 text-orange-700",
                            index > 2 && "bg-muted text-muted-foreground")}>
                            {index + 1}
                        </span>
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium shrink-0",
                            index === 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground")}>
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{cust.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{cust.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-foreground">{formatPrice(cust.totalSpent)}</p>
                            <p className="text-xs text-muted-foreground">{cust.orderCount} đơn</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/components/dashboard/TopCustomers.jsx
git commit -m "feat: add TopCustomers component"
```

---

### Task 12: Frontend — Rewrite AdminDashboard.jsx with new layout

**Files:**
- Modify: `D:\AppleStoreMini\src\pages\admin\AdminDashboard.jsx`

- [ ] **Step 1: Write the complete new AdminDashboard.jsx**

```jsx
import { DollarSign, ShoppingBag, Users, Package, Clock, TrendingUp, TrendingDown, TicketPercent, AlertTriangle, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetRevenueStatsQuery, useGetLowStockQuery, useGetCategoryRevenueQuery, useGetCouponStatsQuery, useGetDashboardStatsQuery } from "@/store/api/ordersApi";
import { useGetAllUsersQuery } from "@/store/api/usersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import RevenueChart from "@/features/admin/components/dashboard/RevenueChart";
import RecentOrders from "@/features/admin/components/dashboard/RecentOrders";
import TopProducts from "@/features/admin/components/dashboard/TopProducts";
import OrderStats from "@/features/admin/components/dashboard/OrderStats";
import OrderStatusChart from "@/features/admin/components/dashboard/OrderStatusChart";
import SlowProducts from "@/features/admin/components/dashboard/SlowProducts";
import TopCustomers from "@/features/admin/components/dashboard/TopCustomers";
import CategoryPieChart from "@/features/admin/components/dashboard/CategoryPieChart";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
    const { data: revenueData } = useGetRevenueStatsQuery({ period: "month" });
    const { data: stats, isLoading: isStatsLoading } = useGetDashboardStatsQuery();
    const { data: lowStock = [] } = useGetLowStockQuery();
    const { data: catRevenue = [] } = useGetCategoryRevenueQuery();
    const { data: couponStats } = useGetCouponStatsQuery();
    const { data: usersData } = useGetAllUsersQuery({ page: 1, limit: 1 });
    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 1 });

    const aov = stats?.totalRevenue && stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;
    const revenueChange = revenueData?.revenueChange ?? 0;
    const returnRate = stats?.totalOrders && stats?.totalReturns ? ((stats.totalReturns / stats.totalOrders) * 100).toFixed(1) : "0";

    const STAT_CARDS = [
        { title: "Tổng doanh thu", value: formatPrice(stats?.totalRevenue ?? 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30",
            change: revenueChange !== 0 ? `${revenueChange >= 0 ? "+" : ""}${revenueChange}%` : null, changeUp: revenueChange >= 0 },
        { title: "Doanh thu hôm nay", value: formatPrice(stats?.todayRevenue ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
        { title: "Giá trị đơn TB", value: formatPrice(aov), icon: Receipt, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
        { title: "Đơn chờ xử lý", value: formatNumber(stats?.pendingOrders ?? 0), icon: Clock, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", badge: (stats?.pendingOrders ?? 0) > 0,
            sub: `Tỉ lệ hoàn: ${returnRate}%` },
        { title: "Tổng đơn hàng", value: formatNumber(stats?.totalOrders ?? 0), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
        { title: "Tổng sản phẩm", value: formatNumber(productsData?.pagination?.total ?? 0), icon: Package, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
        { title: "Tổng người dùng", value: formatNumber(usersData?.pagination?.total ?? 0), icon: Users, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
        { title: "Voucher đã dùng", value: formatNumber(couponStats?.totalCouponOrders ?? 0), icon: TicketPercent, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30" },
        { title: "Tiền giảm từ voucher", value: formatPrice(couponStats?.totalDiscountAmount ?? 0), icon: TicketPercent, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Tổng quan</h1>
                <p className="mt-1 text-sm text-muted-foreground">Xin chào, đây là tóm tắt hôm nay</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STAT_CARDS.map((card) => (
                    <Card key={card.title} className={cn("border-border", card.badge && "border-red-200 dark:border-red-800")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", card.bg)}>
                                <card.icon className={cn("h-4 w-4", card.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isStatsLoading ? (
                                <Skeleton className="h-8 w-32" />
                            ) : (
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-foreground">{card.value}</span>
                                        {card.badge && <Badge className="bg-red-500 text-white text-xs">!</Badge>}
                                    </div>
                                    {card.change && (
                                        <div className="flex items-center gap-1">
                                            {card.changeUp ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                                            <span className={cn("text-xs font-medium", card.changeUp ? "text-green-600" : "text-red-500")}>{card.change}</span>
                                        </div>
                                    )}
                                    {card.sub && (
                                        <p className="text-xs text-muted-foreground">{card.sub}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

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
                    <CardHeader><CardTitle className="text-sm font-medium">Phân bố trạng thái đơn hàng</CardTitle></CardHeader>
                    <CardContent><OrderStatusChart /></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Sản phẩm bán chậm (30 ngày)</CardTitle></CardHeader>
                    <CardContent><SlowProducts /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Khách hàng chi tiêu cao</CardTitle></CardHeader>
                    <CardContent><TopCustomers /></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Đơn hàng mới nhất</CardTitle>
                    </CardHeader>
                    <CardContent><RecentOrders /></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Cảnh báo tồn kho thấp
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStock.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Tất cả sản phẩm đều đủ hàng</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Sản phẩm</TableHead><TableHead>Màu</TableHead><TableHead>Dung lượng</TableHead><TableHead className="text-right">Tồn kho</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStock.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell>
                                                <Link to={`/admin/products/${v.productId}/edit`} className="text-sm text-blue-600 hover:underline line-clamp-1 max-w-[140px]">{v.product?.name}</Link>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{v.color || "—"}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{v.storage || "—"}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={v.stock === 0 ? "bg-red-500 text-white" : "bg-amber-500 text-white"}>{v.stock}</Badge>
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
```

- [ ] **Step 2: Remove the inline CategoryDonut and DONUT_COLORS**

The `CategoryDonut` function (lines 21-62) and `DONUT_COLORS` constant (lines 15-19) are no longer needed — removed as part of the rewrite.

- [ ] **Step 3: Remove unused imports**

Removed: `Coins` (from lucide-react), `formatNumber`, `cn` (keep - still used). The `Skeleton` import stays. Also removed `useGetPointsStatsQuery` import.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "feat: restructure admin dashboard with new layout, stats, charts, and components"
```

---

### Task 13: Frontend — Verify build compiles

**Files:** None (verification only)

- [ ] **Step 1: Run frontend build check**

```bash
npm run build
```

Expected: Build succeeds with no errors. Fix any import errors or TypeScript issues if present.

- [ ] **Step 2: Commit if any fixes were needed**

---

### Task 14: Final verification

- [ ] **Step 1: Start backend locally and test all new endpoints**

```bash
cd D:\AppleStoreMini_api && node server.js
```

- [ ] **Step 2: Start frontend and navigate to /admin/dashboard**

```bash
cd D:\AppleStoreMini && npm run dev
```

- [ ] **Step 3: Verify all sections render correctly**
  - 9 stat cards with correct values
  - Revenue chart + category pie chart
  - Order stats table + bar chart with month/year toggle
  - Top products with week/month/year toggle
  - Order status distribution bars
  - Slow products (may show "all products are selling" if data is sparse)
  - Top customers
  - Recent orders + low stock warnings
