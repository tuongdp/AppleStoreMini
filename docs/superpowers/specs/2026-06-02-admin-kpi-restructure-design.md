# Admin Dashboard KPI Restructure

**Date:** 2026-06-02
**Status:** Approved

## Summary

Restructure the admin dashboard KPI cards: reduce from 7 to 6, reorder by operational priority, add actionable notes, remove less critical metrics.

## Current State

7 metric cards in `AdminDashboard.jsx` displayed in `grid sm:grid-cols-2 xl:grid-cols-4`:

1. Doanh thu hôm nay
2. Đơn cần xử lý
3. Tỷ lệ giao thành công
4. Giá trị đơn trung bình
5. Tồn kho cần chú ý
6. Khách hàng mới
7. Voucher đã dùng

## Target State

6 metric cards in `grid sm:grid-cols-2 xl:grid-cols-3`:

| # | Title | Value | Note | Icon | Tone |
|---|-------|-------|------|------|------|
| 1 | Đơn cần xử lý | `pending + confirmed` | `Cần xác nhận / xử lý hôm nay` | Clock | danger/order |
| 2 | Doanh thu hôm nay | `revenue.today` | `Tháng này: <revenue.month>` | TrendingUp | revenue |
| 3 | Đơn hàng hôm nay | `orders.today` | `Tổng đơn đặt trong ngày` | ShoppingBag | order |
| 4 | Tỷ lệ giao thành công | `deliveryRate%` | `Hủy/hoàn <problemRate>%` | CheckCircle2 | order |
| 5 | Tồn kho cần chú ý | `lowStock + outOfStock` | `Có sản phẩm sắp hết / đã hết hàng` | Package | warning |
| 6 | Khách hàng mới | `newToday` | `<unverified> tài khoản chưa xác thực` | Users | default |

## Changes

### `src/pages/admin/AdminDashboard.jsx`

1. **metricCards array** — replace 7 cards with the 6 above, reorder, update notes
2. **Grid class** — `xl:grid-cols-4` → `xl:grid-cols-3`
3. **Remove imports** — `TicketPercent`, `Receipt` (if no other usage)
4. **Remove queries** — `useGetCouponStatsQuery` and `couponStats` variable
5. **Remove computed** — `aov` variable (no longer needed)

### Data

All values come from existing `useGetDashboardOperationsQuery` — no API changes needed.

## Out of Scope

- Creating new API endpoints
- Extracting KPI section to separate component
- Moving voucher stats to a marketing page (future work)
- Changing `MetricCard` component internals
