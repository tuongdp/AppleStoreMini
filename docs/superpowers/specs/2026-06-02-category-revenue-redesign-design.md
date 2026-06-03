# Category Revenue Widget Redesign

**Date:** 2026-06-02
**Status:** Approved

## Summary

Overhaul the "Doanh thu theo danh mục" widget from a simple donut chart into a full decision-support widget with time filters, rankings table, trend indicators, and quick insights.

## Current State

`CategoryPieChart.jsx` renders a donut chart with total in center and legend on right. No time filter (hardcoded month), no trend data, no rankings, no clickable categories. API returns `Array<{ label, value }>`.

## Target State

Full widget with:
1. **Period filter tabs** (Tuần/Tháng/Năm) synced via URL search params
2. **Donut chart** with total revenue centered
3. **Rankings table** beside chart with 🥇🥈🥉 medals
4. **Trend indicators** per category (↑ green / ↓ red / ─ gray) vs previous period
5. **Clickable rows** → `/admin/products?category=<id>`
6. **Quick insights** text at bottom (top category, fastest growing, needs attention)
7. **Clean tooltip** (name + revenue + % only)
8. **BE returns** `{ categoryId, label, value, change }`

### Layout

```
┌-- Title + Period Tabs ----------------------┐
│  ┌──────────┐  Rankings Table                │
│  │  Donut   │  🥇 iPhone     626.8tr ↑ 12%  │
│  │  Total   │  🥈 Mac        170.4tr ↓  5%  │
│  └──────────┘  ...                           │
│  💡 Insights text (3 lines)                  │
└──────────────────────────────────────────────┘
```

### BE Changes

`src/services/dashboard.service.js` — `getCategoryRevenue`:
- Query orders for both current and previous period
- Compute `value` and `change` per category
- Include `categoryId` in response
- Response: `Array<{ categoryId, label, value, change }>`

### FE Changes

`src/features/admin/components/dashboard/CategoryPieChart.jsx` — rewrite with:
- Period tabs (reuse `PERIODS` pattern from RevenueChart)
- `useGetCategoryRevenueQuery({ period })`
- Donut chart + total center (keep existing)
- Rankings table with medals, trend arrows, clickable links
- Quick insights computed from data
