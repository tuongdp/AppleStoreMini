# Admin Dashboard — Chăm sóc khách hàng Block

**Date:** 2026-06-02
**Status:** Approved

## Summary

Merge the two standalone "Yêu cầu trả hàng" and "Đánh giá chưa phản hồi" cards into a single "Chăm sóc khách hàng" block with clickable rows.

## Current State

Two separate `<Card>` components in a `grid lg:grid-cols-3` (occupying only 2 of 3 columns, leaving empty space):

```jsx
<div className="grid gap-4 lg:grid-cols-3">
    <Card>...</Card>  {/* Yêu cầu trả hàng */}
    <Card>...</Card>  {/* Đánh giá chưa phản hồi */}
</div>
```

Each card shows icon + label + count, non-clickable.

## Target State

One unified `<Card>` with:

- **CardHeader:** title "Chăm sóc khách hàng"
- **CardContent:** 2 clickable rows, each as a full-width `<Link>`:
  - ↩️ Yêu cầu trả hàng → count → arrow (links to `/admin/returns`)
  - 💬 Đánh giá chưa phản hồi → count → arrow (links to `/admin/reviews`)

```
┌── Chăm sóc khách hàng ──────────────────────┐
│ ↩️  Yêu cầu trả hàng                 0   →  │
│ 💬  Đánh giá chưa phản hồi            6   →  │
└──────────────────────────────────────────────┘
```

Row styling: icon + label left, count + arrow right, hover bg, full-width click.

## Changes

### `src/pages/admin/AdminDashboard.jsx`

1. **Remove** the `grid lg:grid-cols-3` block (lines 289-308) with the 2 standalone cards
2. **Add** a new unified Card after the tasks/alerts section (or in place of the old block)
3. Each row reuses the existing `Link` + `ArrowUpRight` pattern (similar to `WorkItem`)
4. Data: same `tasks.find(item => item.key === "returnRequests")` and `tasks.find(item => item.key === "reviews")`

### Data

No API changes. All data from existing `useGetDashboardOperationsQuery`.

## Out of Scope

- Adding "Liên hệ chưa xử lý" (no API yet)
- Improving "Việc cần xử lý" section (separate sub-project)
- Improving "Cảnh báo vận hành" section (separate sub-project)
