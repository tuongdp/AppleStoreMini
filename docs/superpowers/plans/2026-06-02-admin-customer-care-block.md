# Admin Dashboard — Chăm sóc khách hàng Block: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge two standalone "Yêu cầu trả hàng" and "Đánh giá chưa phản hồi" cards into a unified "Chăm sóc khách hàng" block with clickable rows.

**Architecture:** Single-file edit in `AdminDashboard.jsx`. Replace the `grid lg:grid-cols-3` block containing 2 cards with a single Card using clickable row links patterned after the existing `WorkItem` component.

**Tech Stack:** React, React Router (Link), Tailwind CSS, lucide-react

---

### Task 1: Replace bottom 2 cards with Customer Care block

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx` (lines 289-308)

- [ ] **Step 1: Remove the old grid block and replace with unified Card**

Delete the old code block (the `<div className="grid gap-4 lg:grid-cols-3">` containing 2 standalone cards) and replace with:

```jsx
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Chăm sóc khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <Link to="/admin/returns" className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <RotateCcw className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-foreground">Yêu cầu trả hàng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={returnRequestsCount > 0 ? "destructive" : "secondary"}>
                                {formatNumber(returnRequestsCount)}
                            </Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </Link>
                    <Link to="/admin/reviews" className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <MessageSquareReply className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-foreground">Đánh giá chưa phản hồi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={reviewsCount > 0 ? "destructive" : "secondary"}>
                                {formatNumber(reviewsCount)}
                            </Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </Link>
                </CardContent>
            </Card>
```

- [ ] **Step 2: Add computed variables for counts**

Above the return statement, after the existing `const alerts = ...` line (around line 140), add:

```jsx
    const returnRequestsCount = tasks.find((item) => item.key === "returnRequests")?.count || 0;
    const reviewsCount = tasks.find((item) => item.key === "reviews")?.count || 0;
```

This ensures each `tasks.find()` call happens only once (used in both the task section and the new block).

- [ ] **Step 3: Update existing usage of tasks.find in task section**

If the tasks/WorkItem section (around line 296) also uses `tasks.find((item) => item.key === "returnRequests")`, update it to use the new `returnRequestsCount` variable instead. Same for `reviewsCount`.

Check line ~296:
```jsx
// Before
<p className="text-lg font-semibold">{formatNumber(tasks.find((item) => item.key === "returnRequests")?.count || 0)}</p>
// After
<p className="text-lg font-semibold">{formatNumber(returnRequestsCount)}</p>
```

And line ~303:
```jsx
// Before
<p className="text-lg font-semibold">{formatNumber(tasks.find((item) => item.key === "reviews")?.count || 0)}</p>
// After
<p className="text-lg font-semibold">{formatNumber(reviewsCount)}</p>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: Build passes with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "feat: merge return requests & reviews cards into customer care block"
```
