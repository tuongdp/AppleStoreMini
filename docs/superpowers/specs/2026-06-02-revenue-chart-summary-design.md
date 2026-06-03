# Revenue Chart — Richer Summary with Period-Based Stats

**Date:** 2026-06-02
**Status:** Approved

## Summary

Fix the comparison label bug and replace the summary section in the RevenueChart with a richer 3-row display showing revenue, orders, and average order value with period-based change percentages.

## Current State

The RevenueChart bottom summary shows 3 columns:
- Tổng doanh thu
- Tổng đơn hàng
- Change % (with wrong label: "so với năm trước" for month period)

The API returns: `{ chart, totalRevenue, totalOrders, revenueChange }`

## Target State

### BE Changes (`orderAnalytics.service.js`)

Add `_count: true` to previous period aggregate query to get `prevTotalOrders`. Compute and return:

```
{ chart, totalRevenue, totalOrders, revenueChange, orderChange, avgOrderValue, avgOrderChange }
```

### FE Changes (`RevenueChart.jsx`)

- Fix label: month → "so với tháng trước"
- Replace static 3-column grid with 3 rows:

```
Doanh thu              <amount>    ↑/↓ <revenueChange>%
Đơn hàng               <count>     ↑/↓ <orderChange>%
Giá trị trung bình đơn <amount>    ↑/↓ <avgOrderChange>%
```

Each row: label left, value + arrow right, green for increase, red for decrease.
