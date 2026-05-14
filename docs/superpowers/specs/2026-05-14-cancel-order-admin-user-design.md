# Cancel Order Feature for Admin & User

**Date:** 2026-05-14
**Status:** Draft

## Overview

Add cancel order functionality for both admin and regular users, with reason required and email notification.

## Requirements

1. **Cancel condition**: Orders can be cancelled only when status is before SHIPPING (PENDING, CONFIRMED, PROCESSING). Once an order reaches SHIPPING or beyond, cancellation is no longer allowed.

2. **User cancel**: Extend existing cancel button to include PROCESSING status. User fills in a reason (min 10 characters). Reason is sent to backend which notifies admin.

3. **Admin cancel**: Add a dedicated "Huỷ đơn hàng" button on the admin order detail page. Admin fills in a reason (min 10 characters). Backend sends email notification to the customer.

## API Endpoints

| Endpoint | Method | Body | Notes |
|----------|--------|------|-------|
| `/orders/:id/cancel` | POST | `{ reason }` | Existing, extend backend to allow PROCESSING |
| `/admin/orders/:id/cancel` | POST | `{ reason }` | **New** - Admin cancel + send email to user |

## Implementation Plan

### 1. API Layer (`src/store/api/ordersApi.js`)
- Add `cancelOrderByAdmin` mutation: `POST /admin/orders/:id/cancel` with `{ reason }` body
- Invalidates `["Orders", "Order"]` tags

### 2. User Cancel (`src/features/orders/components/OrderDetail.jsx`)
- Extend `canCancel` from `[PENDING, CONFIRMED]` to `[PENDING, CONFIRMED, PROCESSING]`
- No other changes needed (dialog and API call already exist)

### 3. Admin Cancel (`src/features/admin/components/orders/AdminOrderDetail.jsx`)
- Add cancel button (red, outline, with X icon) next to status dropdown
- Add ConfirmDialog with reason textarea (reuse `cancelOrderSchema` from validations)
- Call `cancelOrderByAdmin` mutation on confirm
- Show toast success/error

## Files Changed

| File | Change |
|------|--------|
| `src/store/api/ordersApi.js` | Add `cancelOrderByAdmin` mutation |
| `src/features/orders/components/OrderDetail.jsx` | Extend `canCancel` to include PROCESSING |
| `src/features/admin/components/orders/AdminOrderDetail.jsx` | Add cancel button + dialog |

## Validation
- Reuse existing `cancelOrderSchema` (min 10 chars reason)
