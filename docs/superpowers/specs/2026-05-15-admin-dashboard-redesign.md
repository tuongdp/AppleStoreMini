# Admin Dashboard Redesign

**Date:** 2026-05-15
**Status:** Approved

## Overview

Revamp the admin dashboard page (`/admin/dashboard`) with comprehensive statistics, better charts, and new analytics sections.

## Goals

1. Remove loyalty points from overview section
2. Add AOV (Average Order Value) and return rate indicators
3. Replace custom SVG donut with Recharts PieChart
4. Add order statistics table + bar chart by month/year
5. Add top-selling products with week/month/year toggle
6. Add slow-moving products
7. Add top customers by spending
8. Activate existing OrderStatusChart component
9. Show % change indicators on stat cards
10. Consolidate API calls (use existing `/dashboard/stats`)

## Layout

```
[Hàng 1] 9 Stat Cards (grid-cols-4)
[Hàng 2] RevenueChart (col-span-4) | CategoryPieChart (col-span-3)
[Hàng 3] OrderStats table + bar chart (full width, toggle Tháng/Năm)
[Hàng 4] TopProducts (1/2) | OrderStatusChart (1/2)
[Hàng 5] SlowProducts (1/2) | TopCustomers (1/2)
[Hàng 6] RecentOrders (1/2) | LowStock (1/2)
```

## Frontend Changes

### Stat Cards (AdminDashboard.jsx)
- Remove: "Điểm loyalty" card (line 80)
- Add: "Giá trị đơn TB (AOV)" — `stats.totalRevenue / stats.totalOrders`
- Add: Return rate badge (sub-label under "Đơn chờ xử lý")
- Add: % change arrow indicator on "Tổng doanh thu" card (data from existing `revenueChange`)
- Consolidate: Use `useGetDashboardStatsQuery()` (single API) instead of 4 separate calls

### CategoryDonut → CategoryPieChart
- New component: `CategoryPieChart.jsx` using Recharts `<PieChart>`, `<Pie>`, `<Cell>`, `<Tooltip>`
- Keep donut style (innerRadius) with center label
- Hover tooltip shows category name + value + percentage
- Legend displayed on the right side

### RevenueChart (minor updates)
- Accept `revenueChange` prop from parent, display as a % badge on the card header
- No structural changes (already good)

### OrderStats (NEW component)
- File: `src/features/admin/components/dashboard/OrderStats.jsx`
- Toggle: Tháng / Năm
- Left: Compact table (Tháng | Số đơn | Doanh thu | Đơn TB/ngày)
- Right: Recharts BarChart (revenue per month/year)
- API: calls `useGetOrderStatsQuery({ period })`

### TopProducts (update)
- Add period toggle: Tuần / Tháng / Năm (like RevenueChart)
- API: calls `useGetTopProductsQuery({ period, limit: 5 })`
- Keep existing layout (numbered list with product image, name, sold count, stock status, price)

### OrderStatusChart (activate existing)
- File: `src/features/admin/components/dashboard/OrderStatusChart.jsx` — already exists, not used
- Wire it up with new `useGetOrderStatusDistributionQuery()`
- Shows horizontal progress bars per order status with count

### SlowProducts (NEW component)
- File: `src/features/admin/components/dashboard/SlowProducts.jsx`
- 5 products with lowest soldCount in last 30 days (or 0)
- Shows: product name, image, sold count (red highlight if 0), stock
- API: calls `useGetSlowProductsQuery({ days: 30, limit: 5 })`

### TopCustomers (NEW component)
- File: `src/features/admin/components/dashboard/TopCustomers.jsx`
- 5 users with highest total spending (sum of DELIVERED order amounts)
- Shows: avatar/initial, name, email, total spent, order count
- API: calls `useGetTopCustomersQuery({ limit: 5 })`

## Backend Changes

### API: GET /admin/dashboard/stats (ALREADY EXISTS, UNUSED)
**File:** `src/controllers/admin/dashboard.controller.js:getStats`
- Returns: `{ totalRevenue, totalOrders, totalProducts, totalUsers, pendingOrders, todayRevenue }`
- Wire up RTK Query hook and use in frontend

### API: GET /admin/dashboard/order-stats (NEW)
**Query:** `?period=month|year`
**Response:**
```json
{
  "data": [
    { "label": "T1/2026", "orders": 45, "revenue": 50000000, "avgPerDay": 1.5 },
    ...
  ]
}
```
**Implementation:** Group orders by month/year, calculate revenue and avg orders/day.

### API: GET /admin/dashboard/top-products (NEW)
**Query:** `?period=week|month|year&limit=5`
**Response:**
```json
{
  "data": [
    { "id": 1, "name": "iPhone 16", "slug": "iphone-16", "images": [...], "soldCount": 120, "price": 25000000, "inStock": true, "categorySlug": "iphone" },
    ...
  ]
}
```
**Implementation:** Query OrderItem joined with Product, filter by createdAt within period, group by productId, sum quantity, sort DESC, limit.

### API: GET /admin/dashboard/slow-products (NEW)
**Query:** `?days=30&limit=5`
**Response:** Same shape as top-products but sorted ASC by sold count in period.
**Implementation:** Query products with lowest soldCount (or 0 sales in recent period).

### API: GET /admin/dashboard/order-status-distribution (NEW)
**Response:**
```json
{
  "data": [
    { "status": "PENDING", "count": 12 },
    { "status": "CONFIRMED", "count": 8 },
    ...
  ]
}
```
**Implementation:** `prisma.order.groupBy({ by: ["status"], _count: true })`

### API: GET /admin/dashboard/top-customers (NEW)
**Query:** `?limit=5`
**Response:**
```json
{
  "data": [
    { "id": "...", "fullName": "...", "email": "...", "totalSpent": 150000000, "orderCount": 12 },
    ...
  ]
}
```
**Implementation:** Query DELIVERED orders, group by userId, sum totalAmount, join User, sort DESC, limit.

## RTK Query Updates

**File:** `src/store/api/ordersApi.js`

New hooks to add:
- `useGetDashboardStatsQuery()` → `GET /admin/dashboard/stats`
- `useGetOrderStatsQuery({ period })` → `GET /admin/dashboard/order-stats?period=`
- `useGetTopProductsQuery({ period, limit })` → `GET /admin/dashboard/top-products?period=&limit=`
- `useGetSlowProductsQuery({ days, limit })` → `GET /admin/dashboard/slow-products?days=&limit=`
- `useGetOrderStatusDistributionQuery()` → `GET /admin/dashboard/order-status-distribution`
- `useGetTopCustomersQuery({ limit })` → `GET /admin/dashboard/top-customers?limit=`

Remove / consolidate:
- `useGetPointsStatsQuery` — remove (loyalty card deleted)
- `useGetCouponStatsQuery` — keep (still used for voucher cards)

## Implementation Order

1. **Backend APIs** — Add 5 new endpoints to `dashboard.controller.js` + `order.service.js`
2. **Frontend RTK Query** — Add new hooks to `ordersApi.js`
3. **Frontend Components** — Build OrderStats, SlowProducts, TopCustomers, CategoryPieChart
4. **Update AdminDashboard.jsx** — New layout, remove loyalty, add AOV
5. **Update TopProducts.jsx** — Add period toggle
6. **Activate OrderStatusChart.jsx** — Wire up API
7. **Test & Verify** — Run backend, verify all endpoints return correct data
