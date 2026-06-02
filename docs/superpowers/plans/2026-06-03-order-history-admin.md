# Order History for Admin Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `triggeredBy` field to backend `OrderStatusHistory` and replace admin detail's right-column `OrderTimeline` with a detailed `OrderHistoryTimeline` showing every status change with timestamp, description, and actor.

**Architecture:** Backend: add `TriggeredBy` enum + field to Prisma `OrderStatusHistory`, update all service call sites to set it. Frontend: new `OrderHistoryTimeline` component renders `statusHistory` array as a vertical scrollable timeline with actor icons, descriptions, and timestamps.

**Tech Stack:** Prisma, Node.js/Express, React, lucide-react, tailwind

---

### Task 1: Add triggeredBy to Prisma schema + migrate

**Files:**
- Modify: `D:\AppleStoreMini_Api\prisma\schema.prisma`

- [ ] **Step 1: Add TriggeredBy enum and field to OrderStatusHistory**

In `D:\AppleStoreMini_Api\prisma\schema.prisma`, between the existing `OrderStatus` enum and the `OrderStatusHistory` model: add the `TriggeredBy` enum. Then add the field to the model.

```prisma
// After OrderStatus enum (after line 329)

enum TriggeredBy {
  SYSTEM
  ADMIN
  CUSTOMER
}
```

Then modify the `OrderStatusHistory` model (lines 378-389):

```prisma
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

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_triggered_by
```

Expected: migration file created in `prisma/migrations/`, Prisma client regenerated.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add TriggeredBy enum to OrderStatusHistory"
```

---

### Task 2: Update order.service.js — all statusHistory.create calls

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\order.service.js`

- [ ] **Step 1: createOrder() — PENDING → CUSTOMER (line 136)**

Change:
```js
statusHistory: { create: [{ status: "PENDING" }] },
```
To:
```js
statusHistory: { create: [{ status: "PENDING", triggeredBy: "CUSTOMER" }] },
```

- [ ] **Step 2: cancelOrder() (user) — CANCELLED → CUSTOMER (line 498)**

Change:
```js
statusHistory: { create: [{ status: "CANCELLED", note: reason }] },
```
To:
```js
statusHistory: { create: [{ status: "CANCELLED", note: reason, triggeredBy: "CUSTOMER" }] },
```

- [ ] **Step 3: cancelOrderByAdmin() — CANCELLED → ADMIN (line 538)**

Change:
```js
statusHistory: { create: [{ status: "CANCELLED", note: reason }] },
```
To:
```js
statusHistory: { create: [{ status: "CANCELLED", note: reason, triggeredBy: "ADMIN" }] },
```

- [ ] **Step 4: confirmDelivered() — DELIVERED → CUSTOMER (line 570)**

Change:
```js
statusHistory: { create: [{ status: "DELIVERED" }] },
```
To:
```js
statusHistory: { create: [{ status: "DELIVERED", triggeredBy: "CUSTOMER" }] },
```

- [ ] **Step 5: updateOrderStatus() (admin) → ADMIN (line 644)**

Change:
```js
statusHistory: { create: [{ status: statusUpper, note }] },
```
To:
```js
statusHistory: { create: [{ status: statusUpper, note, triggeredBy: "ADMIN" }] },
```

- [ ] **Step 6: processReturnRefund() full return — REFUNDED → ADMIN (line 999)**

Change:
```js
statusHistory: { create: [{ status: "REFUNDED", note: statusNote }] },
```
To:
```js
statusHistory: { create: [{ status: "REFUNDED", note: statusNote, triggeredBy: "ADMIN" }] },
```

- [ ] **Step 7: processReturnRefund() partial return → SYSTEM (line 1006)**

Change:
```js
statusHistory: { create: [{ status: order.status || "DELIVERED", note: `Trả một phần - ${statusNote}` }] },
```
To:
```js
statusHistory: { create: [{ status: order.status || "DELIVERED", note: `Trả một phần - ${statusNote}`, triggeredBy: "SYSTEM" }] },
```

- [ ] **Step 8: switchToCod() → CUSTOMER (line 1048)**

Change:
```js
statusHistory: { create: [{ status: order.status, note: "Khách chuyển từ VNPAY sang COD" }] },
```
To:
```js
statusHistory: { create: [{ status: order.status, note: "Khách chuyển từ VNPAY sang COD", triggeredBy: "CUSTOMER" }] },
```

- [ ] **Step 9: Run lint**

```bash
npm run lint
```

- [ ] **Step 10: Commit**

```bash
git add src/services/order.service.js
git commit -m "feat: add triggeredBy to all order status history entries"
```

---

### Task 3: Update payment.service.js — triggeredBy

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\payment.service.js`

- [ ] **Step 1: confirmPayment() → SYSTEM (line 29)**

Change:
```js
create: { status: "CONFIRMED", note },
```
To:
```js
create: { status: "CONFIRMED", note, triggeredBy: "SYSTEM" },
```

- [ ] **Step 2: VNPay cancel handler → SYSTEM (line 111)**

Change:
```js
create: { status: "CANCELLED", note: "VNPay: thanh toán thất bại hoặc bị hủy" },
```
To:
```js
create: { status: "CANCELLED", note: "VNPay: thanh toán thất bại hoặc bị hủy", triggeredBy: "SYSTEM" },
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/services/payment.service.js
git commit -m "feat: add triggeredBy to payment status history entries"
```

---

### Task 4: Create OrderHistoryTimeline component

**Files:**
- Create: `D:\AppleStoreMini\src\features\orders\components\OrderHistoryTimeline.jsx`

- [ ] **Step 1: Write the component**

```jsx
import { User, Shield, Bot } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị hàng",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã huỷ",
  refunding: "Đang hoàn tiền",
  refunded: "Đã hoàn tiền",
};

const ACTOR_CONFIG = {
  CUSTOMER: { icon: User, label: "Khách hàng" },
  ADMIN: { icon: Shield, label: "Quản trị viên" },
  SYSTEM: { icon: Bot, label: "Hệ thống" },
};

function getDescription(entry) {
  const { status, triggeredBy, note } = entry;

  if (status === "PENDING" && triggeredBy === "CUSTOMER") {
    return "Đơn hàng được tạo";
  }
  if (status === "CONFIRMED" && triggeredBy === "SYSTEM") {
    return note ? `Thanh toán thành công — ${note}` : "Thanh toán thành công";
  }
  if (status === "CONFIRMED" && triggeredBy === "ADMIN") {
    return "Trạng thái chuyển sang Đã xác nhận";
  }
  if (status === "PROCESSING") {
    return "Trạng thái chuyển sang Đang chuẩn bị hàng";
  }
  if (status === "SHIPPING") {
    return "Trạng thái chuyển sang Đang giao hàng";
  }
  if (status === "DELIVERED" && triggeredBy === "CUSTOMER") {
    return "Khách hàng xác nhận đã nhận hàng";
  }
  if (status === "DELIVERED" && triggeredBy === "ADMIN") {
    return "Trạng thái chuyển sang Đã giao hàng";
  }
  if (status === "CANCELLED" && triggeredBy === "CUSTOMER") {
    return note ? `Khách hàng huỷ đơn — ${note}` : "Khách hàng huỷ đơn";
  }
  if (status === "CANCELLED" && triggeredBy === "ADMIN") {
    return note ? `Admin huỷ đơn — ${note}` : "Admin huỷ đơn";
  }
  if (status === "CANCELLED" && triggeredBy === "SYSTEM") {
    return note ? `Thanh toán thất bại — ${note}` : "Thanh toán thất bại";
  }
  if (status === "REFUNDING") {
    return "Trạng thái chuyển sang Đang hoàn tiền";
  }
  if (status === "REFUNDED") {
    return note ? `Đã hoàn tiền — ${note}` : "Đã hoàn tiền";
  }

  const label = STATUS_LABELS[status?.toLowerCase()] || status;
  return note ? `Trạng thái chuyển sang ${label} — ${note}` : `Trạng thái chuyển sang ${label}`;
}

export default function OrderHistoryTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Chưa có lịch sử đơn hàng
      </p>
    );
  }

  const sorted = [...statusHistory].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="max-h-[500px] overflow-y-auto">
      <div className="space-y-0">
        {sorted.map((entry, i) => {
          const isLast = i === sorted.length - 1;
          const actor = ACTOR_CONFIG[entry.triggeredBy] || ACTOR_CONFIG.SYSTEM;
          const ActorIcon = actor.icon;

          return (
            <div key={entry.id || i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <ActorIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {!isLast && (
                  <div className="mt-0.5 w-0.5 flex-1 min-h-[24px] bg-border" />
                )}
              </div>
              <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
                <p className="text-sm font-medium text-foreground">
                  {getDescription(entry)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {actor.label} &middot; {formatDateTime(entry.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/components/OrderHistoryTimeline.jsx
git commit -m "feat: add OrderHistoryTimeline component for admin detail"
```

---

### Task 5: Wire OrderHistoryTimeline into AdminOrderDetail

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\orders\AdminOrderDetail.jsx`

- [ ] **Step 1: Replace import**

Change line 16:
```jsx
import OrderTimeline from "@/features/orders/components/OrderTimeline";
```
To:
```jsx
import OrderHistoryTimeline from "@/features/orders/components/OrderHistoryTimeline";
```

- [ ] **Step 2: Replace right column content (lines 456-464)**

Change:
```jsx
                {/* ── Right — Timeline ── */}
                <div>
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-5 text-sm font-medium text-foreground">
                            {"Trạng thái"}
                        </h3>
                        <OrderTimeline order={order} />
                    </div>
                </div>
```
To:
```jsx
                {/* ── Right — Lịch sử đơn hàng ── */}
                <div>
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-5 text-sm font-medium text-foreground">
                            {"Lịch sử đơn hàng"}
                        </h3>
                        <OrderHistoryTimeline statusHistory={order.statusHistory} />
                    </div>
                </div>
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/orders/AdminOrderDetail.jsx
git commit -m "feat: replace OrderTimeline with OrderHistoryTimeline on admin detail"
```
