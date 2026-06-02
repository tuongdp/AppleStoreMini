# Design: Order History for Admin Detail Page

**Date:** 2026-06-03
**Scope:** Backend + Frontend

## Problem

Admin order detail page shows current status via `OrderTimeline` (5-step visual circles) but has no readable history of what happened to the order: when statuses changed, who changed them, and why. This is the #1 screen admins use when handling customer inquiries ("why is my order still not shipped?").

## Solution

Add a `triggeredBy` field to `OrderStatusHistory` in the backend, and replace the right-column `OrderTimeline` on the admin detail page with a new scrollable `OrderHistoryTimeline` component that renders every status history entry with timestamp, description, and actor.

## Backend Changes

### Schema

Add `TriggeredBy` enum and field to `OrderStatusHistory`:

```prisma
enum TriggeredBy {
  SYSTEM
  ADMIN
  CUSTOMER
}

model OrderStatusHistory {
  id          String      @id @default(cuid())
  orderId     String
  status      OrderStatus
  note        String?
  triggeredBy TriggeredBy @default(SYSTEM)
  createdAt   DateTime    @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@map("order_status_history")
}
```

### Service updates

Every `statusHistory.create` call in the services must include `triggeredBy`:

| Service | Function | Status | triggeredBy |
|---------|----------|--------|-------------|
| `order.service.js` | `createOrder()` | PENDING | CUSTOMER |
| `order.service.js` | `updateOrderStatus()` (admin) | any | ADMIN |
| `order.service.js` | `cancelOrder()` (user) | CANCELLED | CUSTOMER |
| `order.service.js` | `cancelOrderByAdmin()` | CANCELLED | ADMIN |
| `order.service.js` | `confirmDelivered()` | DELIVERED | CUSTOMER |
| `order.service.js` | `switchToCod()` | (current) | CUSTOMER |
| `order.service.js` | `processReturnRefund()` full | REFUNDED | ADMIN |
| `order.service.js` | `processReturnRefund()` partial | (current) | SYSTEM |
| `payment.service.js` | `confirmPayment()` | CONFIRMED | SYSTEM |
| `payment.service.js` | VNPay cancel handler | CANCELLED | SYSTEM |

No new API endpoints needed. Existing endpoints already return `statusHistory` with the order.

## Frontend Changes

### Files

| File | Action |
|------|--------|
| `src/features/orders/components/OrderHistoryTimeline.jsx` | **New** — renders history entries |
| `src/features/admin/components/orders/AdminOrderDetail.jsx` | Replace right column `OrderTimeline` with `OrderHistoryTimeline` |

### Component: `OrderHistoryTimeline`

**Props:** `{ statusHistory }` (array of `{ status, note, triggeredBy, createdAt }`)

**Rendering:**
- Vertical timeline with connecting lines
- Each entry is a row: icon + description + timestamp
- Scrollable container (max-h with overflow-y-auto)

**Actor icons** (lucide-react):
- `CUSTOMER` → `User` icon, label "Khách hàng"
- `ADMIN` → `Shield` icon, label "Quản trị viên"
- `SYSTEM` → `Bot` icon, label "Hệ thống"

**Description mapping** (Vietnamese text inferred from status + triggeredBy + note):

| Condition | Display |
|-----------|---------|
| `status === PENDING && triggeredBy === CUSTOMER` | "Đơn hàng được tạo" |
| `status === CONFIRMED && triggeredBy === SYSTEM` | "Thanh toán thành công" + note |
| `status === CONFIRMED && triggeredBy === ADMIN` | "Trạng thái chuyển sang Đã xác nhận" |
| `status === PROCESSING` | "Trạng thái chuyển sang Đang chuẩn bị hàng" |
| `status === SHIPPING` | "Trạng thái chuyển sang Đang giao hàng" |
| `status === DELIVERED && triggeredBy === CUSTOMER` | "Khách hàng xác nhận đã nhận hàng" |
| `status === DELIVERED && triggeredBy === ADMIN` | "Trạng thái chuyển sang Đã giao hàng" |
| `status === CANCELLED && triggeredBy === CUSTOMER` | "Khách hàng huỷ đơn" + note |
| `status === CANCELLED && triggeredBy === ADMIN` | "Admin huỷ đơn" + note |
| `status === CANCELLED && triggeredBy === SYSTEM` | "Thanh toán thất bại" + note |
| `status === REFUNDING` | "Trạng thái chuyển sang Đang hoàn tiền" |
| `status === REFUNDED` | "Đã hoàn tiền" + note |
| Fallback | status name + note |

### AdminOrderDetail.jsx change

Replace lines 457-464:
```jsx
// Before:
<div>
  <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
    <h3 className="mb-5 text-sm font-medium text-foreground">Trạng thái</h3>
    <OrderTimeline order={order} />
  </div>
</div>

// After:
<div>
  <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
    <h3 className="mb-5 text-sm font-medium text-foreground">Lịch sử đơn hàng</h3>
    <OrderHistoryTimeline statusHistory={order.statusHistory} />
  </div>
</div>
```

Remove unused `OrderTimeline` import.

### Empty state

If `statusHistory` is empty or missing, show "Chưa có lịch sử" placeholder.

### Visual style

Follow existing card patterns: `rounded-2xl border border-border bg-card p-5`. Timeline lines use `border-muted-foreground/20`. Active/current entry highlighted.

## Testing

- Frontend: unit test `OrderHistoryTimeline` rendering with mock statusHistory entries
- Backend: update existing service tests to verify `triggeredBy` field on statusHistory entries

## Verification

1. `npm run lint` + `npm run build` in frontend workspace
2. `npm run lint` in API workspace
3. Manual: open admin order detail, verify history renders for orders at various stages
4. Manual: update order status via admin, verify new entry appears with ADMIN actor
