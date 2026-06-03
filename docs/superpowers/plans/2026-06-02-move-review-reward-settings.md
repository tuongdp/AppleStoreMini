# Move Review Reward Settings to Coupons Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the "Điểm thưởng mỗi đánh giá" configuration form from the admin dashboard to the Khuyến mãi (coupons) page.

**Architecture:** Two-file edit. Remove review reward block + state + queries from `AdminDashboard.jsx`. Add the same block as a "Chính sách thưởng đánh giá" section in `AdminCouponPage.jsx` below the coupon list.

**Tech Stack:** React, Redux Toolkit Query, Tailwind CSS, lucide-react

---

### Task 1: Remove review reward block from AdminDashboard

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx`

- [ ] **Step 1: Remove unused lucide-react imports**

Remove `Coins`, `Loader2`, `Save` from the import block:

```jsx
// Before (lines 1-19)
import {
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Coins,           // REMOVE
    Loader2,         // REMOVE
    MessageSquareReply,
    Package,
    RotateCcw,
    Save,            // REMOVE
    ShoppingBag,
    TrendingUp,
    Users,
} from "lucide-react";

// After
import {
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    MessageSquareReply,
    Package,
    RotateCcw,
    ShoppingBag,
    TrendingUp,
    Users,
} from "lucide-react";
```

- [ ] **Step 2: Remove unused shadcn UI imports**

Remove `Button`, `Input`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from imports:

```jsx
// Before (lines 22-27)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";         // REMOVE
import { Input } from "@/components/ui/input";             // REMOVE
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  // REMOVE
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// After
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
```

- [ ] **Step 3: Remove review reward API hooks from ordersApi import**

```jsx
// Before (lines 28-36)
import {
    useGetCategoryRevenueQuery,
    useGetDashboardOperationsQuery,
    useGetDashboardStatsQuery,
    useGetLowStockQuery,
    useGetReviewRewardSettingQuery,         // REMOVE
    useUpdateReviewRewardSettingMutation,    // REMOVE
} from "@/store/api/ordersApi";

// After
import {
    useGetCategoryRevenueQuery,
    useGetDashboardOperationsQuery,
    useGetDashboardStatsQuery,
    useGetLowStockQuery,
} from "@/store/api/ordersApi";
```

- [ ] **Step 4: Remove review reward state and queries from component body**

Remove these lines from inside `AdminDashboard()`:

```jsx
// REMOVE these lines:
const { data: reviewRewardSetting, isLoading: isRewardLoading } = useGetReviewRewardSettingQuery();
const [updateReviewReward, { isLoading: isUpdatingReward }] = useUpdateReviewRewardSettingMutation();
const [rewardPoints, setRewardPoints] = useState("");
const [rewardType, setRewardType] = useState("FIXED");

// REMOVE this useEffect block:
useEffect(() => {
    if (reviewRewardSetting?.points != null) setRewardPoints(String(reviewRewardSetting.points));
    if (reviewRewardSetting?.type) setRewardType(reviewRewardSetting.type);
}, [reviewRewardSetting?.points, reviewRewardSetting?.type]);
```

Also remove unused hooks `useState`, `useEffect` from React import if they're no longer used:

```jsx
// Check if useState and useEffect are still used elsewhere in the file.
// useState: also used by export? No — it's only used for rewardPoints/rewardType. Remove from import.
// useEffect: also used by? No — it's only used for reward sync. Remove from import.

// Before
import { useEffect, useMemo, useState } from "react";

// After
import { useMemo } from "react";
```

- [ ] **Step 5: Remove handleUpdateReviewReward handler**

Delete the entire `handleUpdateReviewReward` function (lines 194-211):

```jsx
// REMOVE this entire function
const handleUpdateReviewReward = async () => {
    const points = Number(rewardPoints);
    if (!Number.isInteger(points) || points < 0) {
        toast.error("Điểm thưởng phải là số nguyên không âm");
        return;
    }
    if (rewardType === "PERCENT" && points > 100) {
        toast.error("Phần trăm không được vượt quá 100%");
        return;
    }

    try {
        await updateReviewReward({ points, type: rewardType }).unwrap();
        toast.success("Đã cập nhật điểm thưởng đánh giá");
    } catch (error) {
        toast.error(error?.data?.message || "Cập nhật điểm thưởng thất bại");
    }
};
```

Note: check if `toast` from `sonner` is still used elsewhere in the file. If not, remove `import { toast } from "sonner"` as well.

Actually, `toast` is NOT used elsewhere in the file — it was only used in `handleUpdateReviewReward`. Remove the import:

```jsx
// REMOVE
import { toast } from "sonner";
```

- [ ] **Step 6: Remove the review reward Card block**

Delete the entire Card block (the `{/* Điểm thưởng ... */}` Card starting at line 311):

```jsx
// REMOVE this entire block:
<Card className="border-border">
    <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Coins className="h-4 w-4 text-amber-500" />
            Điểm thưởng mỗi đánh giá
        </CardTitle>
        <Badge variant="secondary">{rewardType === "PERCENT" ? `${reviewRewardSetting?.points ?? 20}%` : `${formatNumber(Number(reviewRewardSetting?.points ?? 20000))} điểm`}</Badge>
    </CardHeader>
    <CardContent>
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Select value={rewardType} onValueChange={setRewardType}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FIXED">Số điểm cố định</SelectItem>
                        <SelectItem value="PERCENT">% giá sản phẩm</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                    <Input
                        type="number"
                        min="0"
                        step="1"
                        value={rewardPoints}
                        onChange={(event) => setRewardPoints(event.target.value)}
                        disabled={isRewardLoading || isUpdatingReward}
                        className="w-28"
                    />
                    <span className="text-xs text-muted-foreground">{rewardType === "PERCENT" ? "%" : "điểm"}</span>
                </div>
            </div>
            <Button type="button" size="sm" onClick={handleUpdateReviewReward} disabled={isRewardLoading || isUpdatingReward} className="w-fit">
                {isUpdatingReward ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu
            </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
            {rewardType === "PERCENT"
                ? "Điểm thưởng = % × giá đơn hàng. Chỉ áp dụng trong 7 ngày từ khi nhận hàng."
                : "Điểm cố định cho mỗi đánh giá. Chỉ áp dụng trong 7 ngày từ khi nhận hàng."}
        </p>
    </CardContent>
</Card>
```

- [ ] **Step 7: Build and verify**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "refactor: remove review reward settings from dashboard"
```

---

### Task 2: Add review reward block to AdminCouponPage

**Files:**
- Modify: `src/pages/admin/AdminCouponPage.jsx`

- [ ] **Step 1: Rewrite AdminCouponPage with review reward section**

Replace the entire file content with:

```jsx
import { useEffect, useState } from "react";
import { Coins, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    useGetReviewRewardSettingQuery,
    useUpdateReviewRewardSettingMutation,
} from "@/store/api/ordersApi";
import { formatNumber } from "@/lib/utils";
import AdminCouponList from "@/features/admin/components/coupons/AdminCouponList";

export default function AdminCouponPage() {
    const { data: reviewRewardSetting, isLoading: isRewardLoading } = useGetReviewRewardSettingQuery();
    const [updateReviewReward, { isLoading: isUpdatingReward }] = useUpdateReviewRewardSettingMutation();
    const [rewardPoints, setRewardPoints] = useState("");
    const [rewardType, setRewardType] = useState("FIXED");

    useEffect(() => {
        if (reviewRewardSetting?.points != null) setRewardPoints(String(reviewRewardSetting.points));
        if (reviewRewardSetting?.type) setRewardType(reviewRewardSetting.type);
    }, [reviewRewardSetting?.points, reviewRewardSetting?.type]);

    const handleUpdateReviewReward = async () => {
        const points = Number(rewardPoints);
        if (!Number.isInteger(points) || points < 0) {
            toast.error("Điểm thưởng phải là số nguyên không âm");
            return;
        }
        if (rewardType === "PERCENT" && points > 100) {
            toast.error("Phần trăm không được vượt quá 100%");
            return;
        }

        try {
            await updateReviewReward({ points, type: rewardType }).unwrap();
            toast.success("Đã cập nhật điểm thưởng đánh giá");
        } catch (error) {
            toast.error(error?.data?.message || "Cập nhật điểm thưởng thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý khuyến mãi"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Tạo và quản lý mã giảm giá cho khách hàng"}
                </p>
            </div>
            <AdminCouponList />
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Coins className="h-4 w-4 text-amber-500" />
                        Chính sách thưởng đánh giá
                    </CardTitle>
                    <Badge variant="secondary">{rewardType === "PERCENT" ? `${reviewRewardSetting?.points ?? 20}%` : `${formatNumber(Number(reviewRewardSetting?.points ?? 20000))} điểm`}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Select value={rewardType} onValueChange={setRewardType}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FIXED">Số điểm cố định</SelectItem>
                                    <SelectItem value="PERCENT">% giá sản phẩm</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={rewardPoints}
                                    onChange={(event) => setRewardPoints(event.target.value)}
                                    disabled={isRewardLoading || isUpdatingReward}
                                    className="w-28"
                                />
                                <span className="text-xs text-muted-foreground">{rewardType === "PERCENT" ? "%" : "điểm"}</span>
                            </div>
                        </div>
                        <Button type="button" size="sm" onClick={handleUpdateReviewReward} disabled={isRewardLoading || isUpdatingReward} className="w-fit">
                            {isUpdatingReward ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Lưu
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {rewardType === "PERCENT"
                            ? "Điểm thưởng = % × giá đơn hàng. Chỉ áp dụng trong 7 ngày từ khi nhận hàng."
                            : "Điểm cố định cho mỗi đánh giá. Chỉ áp dụng trong 7 ngày từ khi nhận hàng."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: Build passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminCouponPage.jsx
git commit -m "feat: add review reward settings to coupons page as chinh sach thuong danh gia"
```
