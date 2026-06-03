# Move Review Reward Settings to Coupons Page

**Date:** 2026-06-02
**Status:** Approved

## Summary

Remove the "Điểm thưởng mỗi đánh giá" configuration form from the admin dashboard and relocate it to the Khuyến mãi (coupons) page as a "Chính sách thưởng đánh giá" section.

## Current State

The review reward settings block lives inside `AdminDashboard.jsx` (a Card with Select, Input, Button), interrupting the dashboard's operational flow (metrics → tasks → alerts → customer care). It uses:
- `useGetReviewRewardSettingQuery()` / `useUpdateReviewRewardSettingMutation()` from `ordersApi`
- Local state: `rewardPoints`, `rewardType`
- `handleUpdateReviewReward` handler
- Icons: `Coins`, `Save`, `Loader2`

## Target State

- **Dashboard:** Clean, no configuration forms — only operational KPIs, tasks, alerts, charts.
- **AdminCouponPage:** A new "Chính sách thưởng đánh giá" section below the coupon list, reusing the same API hooks and UI.

## Changes

### `src/pages/admin/AdminDashboard.jsx`

Remove:
- State declarations: `rewardPoints`, `rewardType` (lines 129-130)
- `useEffect` syncing reward setting (lines 132-135)
- `useGetReviewRewardSettingQuery`, `useUpdateReviewRewardSettingMutation` hooks
- `handleUpdateReviewReward` handler (lines 194-211)
- The review reward Card block (lines 311-358)
- Unused imports: `Coins`, `Save`, `Loader2`, `Input`, `Select` (verify each is not used elsewhere in the file)

### `src/pages/admin/AdminCouponPage.jsx`

Add a new Card section below `<AdminCouponList />` with:
- CardHeader: title "Chính sách thưởng đánh giá"
- CardContent: same Select + Input + Button + description as the old dashboard block
- Same state, queries, and handler logic

### Data

No API changes. Same endpoints:
- `GET /admin/dashboard/review-reward` (useGetReviewRewardSettingQuery)
- `PUT /admin/dashboard/review-reward` (useUpdateReviewRewardSettingMutation)

## Out of Scope

- Adding a new admin route
- Changing the API contract
- Modifying AdminCouponList component
