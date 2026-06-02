# Return Detail UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add customer evidence display (images + video), return processing timeline, and highlighted reason boxes to admin return detail page.

**Architecture:** Backend: add `video` field + `ReturnStatusHistory` model with Prisma, update all return service functions to log history. Frontend: new `ImageLightbox` + `ReturnHistoryTimeline` components, restructure `AdminReturnDetail.jsx` layout.

**Tech Stack:** Prisma, Node.js/Express, React, lucide-react, tailwind, native HTML5 `<video>`

---

### Task 1: Prisma schema — add video + ReturnStatusHistory

**Files:**
- Modify: `D:\AppleStoreMini_Api\prisma\schema.prisma`

- [ ] **Step 1: Add `video` field to ReturnRequest model**

In the `ReturnRequest` model (after `images` field, line 404), add:

```prisma
  video               String?
```

- [ ] **Step 2: Add `ReturnStatusHistory` model**

After the `OrderStatusHistory` model (after line 395), add:

```prisma
model ReturnStatusHistory {
  id              String              @id @default(cuid())
  returnRequestId String
  status          ReturnRequestStatus
  note            String?
  triggeredBy     TriggeredBy         @default(SYSTEM)
  createdAt       DateTime            @default(now())

  returnRequest ReturnRequest @relation(fields: [returnRequestId], references: [id], onDelete: Cascade)

  @@index([returnRequestId])
  @@map("return_status_history")
}
```

- [ ] **Step 3: Add relation on ReturnRequest model**

After `items ReturnRequestItem[]` in the `ReturnRequest` model (after line 420), add:

```prisma
  statusHistory     ReturnStatusHistory[]
```

- [ ] **Step 4: Sync database**

```bash
npx prisma db push
```

- [ ] **Step 5: Lint**

```bash
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add video field + ReturnStatusHistory model"
```

---

### Task 2: Validator — accept video in createReturnRequest

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\validators\order.validator.js`

- [ ] **Step 1: Add video validation rule**

After the `images` validation block (lines 50-53), add:

```js
    body("video")
        .optional({ values: "falsy" })
        .trim(),
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/validators/order.validator.js
git commit -m "feat: accept video field in return request validation"
```

---

### Task 3: Update createReturnRequest — video + history

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\order.service.js`

- [ ] **Step 1: Accept video in createReturnRequest (line 713)**

Change:
```js
    const { reason, description, images, items: returnItems } = returnData;
```
To:
```js
    const { reason, description, images, video, items: returnItems } = returnData;
```

- [ ] **Step 2: Store video in create data (line 769-785)**

Change the `prisma.returnRequest.create` data block to include `video`:

Change:
```js
            data: {
                orderId,
                userId,
                reason,
                description: description || "",
                images: images || [],
                refundAmount,
                bankName: returnData.bankName?.trim() || null,
                bankAccount: returnData.bankAccount?.trim() || null,
                bankOwner: returnData.bankOwner?.trim() || null,
                items: {
                    create: validatedItems,
                },
            },
```
To:
```js
            data: {
                orderId,
                userId,
                reason,
                description: description || "",
                images: images || [],
                video: video?.trim() || null,
                refundAmount,
                bankName: returnData.bankName?.trim() || null,
                bankAccount: returnData.bankAccount?.trim() || null,
                bankOwner: returnData.bankOwner?.trim() || null,
                statusHistory: {
                    create: { status: "PENDING", triggeredBy: "CUSTOMER" },
                },
                items: {
                    create: validatedItems,
                },
            },
```

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/services/order.service.js
git commit -m "feat: accept video + create return status history on create"
```

---

### Task 4: Add status history to approveReturn, updateReturnTracking, receiveReturn

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\order.service.js`

- [ ] **Step 1: approveReturn — add history entry (line 814-818)**

Change:
```js
        const updated = await prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: { status: "APPROVED" },
            include: { items: true },
        });
```
To:
```js
        const updated = await prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: {
                status: "APPROVED",
                statusHistory: {
                    create: { status: "APPROVED", triggeredBy: "ADMIN" },
                },
            },
            include: { items: true },
        });
```

- [ ] **Step 2: updateReturnTracking — add history entry (line 850-854)**

Change:
```js
        return prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: { status: "RETURNING", trackingNumber: trackingNumber.trim() },
            include: { items: true },
        });
```
To:
```js
        return prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: {
                status: "RETURNING",
                trackingNumber: trackingNumber.trim(),
                statusHistory: {
                    create: { status: "RETURNING", note: trackingNumber.trim(), triggeredBy: "CUSTOMER" },
                },
            },
            include: { items: true },
        });
```

- [ ] **Step 3: receiveReturn — add history entry (line 871-879)**

Change:
```js
        return prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: {
                status: "RECEIVED",
                condition: condition?.trim() || null,
                receivedAt: new Date(),
            },
            include: { items: true },
        });
```
To:
```js
        return prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: {
                status: "RECEIVED",
                condition: condition?.trim() || null,
                receivedAt: new Date(),
                statusHistory: {
                    create: { status: "RECEIVED", note: condition?.trim() || null, triggeredBy: "ADMIN" },
                },
            },
            include: { items: true },
        });
```

- [ ] **Step 4: Lint + commit**

```bash
npm run lint
git add src/services/order.service.js
git commit -m "feat: add return status history to approve, tracking, receive"
```

---

### Task 5: Add status history to processReturnRefund + rejectReturn

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\order.service.js`

- [ ] **Step 1: processReturnRefund — add history entry (line 985-989)**

Change:
```js
            data: {
                status: "REFUNDED",
                refundTransactionId: refundTransactionId === "manual" && onlineRefundFailed ? "manual_pending" : refundTransactionId,
```
To:
```js
            data: {
                status: "REFUNDED",
                refundTransactionId: refundTransactionId === "manual" && onlineRefundFailed ? "manual_pending" : refundTransactionId,
                statusHistory: {
                    create: { status: "REFUNDED", note: refundTransactionId, triggeredBy: "ADMIN" },
                },
```

- [ ] **Step 2: rejectReturn — add history entry (line 1077-1081)**

Change:
```js
        const updated = await prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: { status: "REJECTED", adminNote },
            include: { items: true },
        });
```
To:
```js
        const updated = await prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: {
                status: "REJECTED",
                adminNote,
                statusHistory: {
                    create: { status: "REJECTED", note: adminNote, triggeredBy: "ADMIN" },
                },
            },
            include: { items: true },
        });
```

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/services/order.service.js
git commit -m "feat: add return status history to refund and reject"
```

---

### Task 6: Include statusHistory in return queries

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\orderReturn.service.js`

- [ ] **Step 1: Add statusHistory to returnItemsInclude (line 5-22)**

Change the `returnItemsInclude` object:

```js
const returnItemsInclude = {
    items: {
        include: {
            orderItem: {
                include: {
                    variant: {
                        select: {
                            color: true,
                            storage: true,
                            images: true,
                            product: { select: { name: true, image: true, slug: true } },
                        },
                    },
                },
            },
        },
    },
    statusHistory: { orderBy: { createdAt: "asc" } },
};
```

- [ ] **Step 2: Add statusHistory to getAllReturns include (line 136-140)**

Change the `getAllReturns` include:

```js
                include: {
                    items: true,
                    user: { select: { fullName: true, email: true } },
                    order: { select: { code: true, totalAmount: true, status: true } },
                    statusHistory: { orderBy: { createdAt: "asc" } },
                },
```

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/services/orderReturn.service.js
git commit -m "feat: include statusHistory in return queries"
```

---

### Task 7: Create ImageLightbox component

**Files:**
- Create: `D:\AppleStoreMini\src\components\shared\ImageLightbox.jsx`

- [ ] **Step 1: Write component**

```jsx
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImageLightbox({ images, open, onClose, initialIndex = 0 }) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, open]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || !images?.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-10 text-white hover:bg-white/20"
            onClick={goPrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-10 text-white hover:bg-white/20"
            onClick={goNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      <img
        src={images[index]}
        alt={`Ảnh ${index + 1}`}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 text-sm text-white/70">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/ImageLightbox.jsx
git commit -m "feat: add ImageLightbox component for evidence viewer"
```

---

### Task 8: Create ReturnHistoryTimeline component

**Files:**
- Create: `D:\AppleStoreMini\src\features\orders\components\ReturnHistoryTimeline.jsx`

- [ ] **Step 1: Write component**

```jsx
import { User, Shield } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  RETURNING: "Đang gửi trả",
  RECEIVED: "Đã nhận hàng",
  REFUNDED: "Đã hoàn tiền",
};

const ACTOR_CONFIG = {
  CUSTOMER: { icon: User, label: "Khách hàng" },
  ADMIN: { icon: Shield, label: "Quản trị viên" },
};

function getDescription(entry) {
  const { status, triggeredBy, note } = entry;

  if (status === "PENDING" && triggeredBy === "CUSTOMER") {
    return "Khách hàng gửi yêu cầu trả hàng";
  }
  if (status === "APPROVED" && triggeredBy === "ADMIN") {
    return "Admin duyệt yêu cầu trả hàng";
  }
  if (status === "REJECTED" && triggeredBy === "ADMIN") {
    return note ? `Admin từ chối yêu cầu — Lý do: ${note}` : "Admin từ chối yêu cầu";
  }
  if (status === "RETURNING" && triggeredBy === "CUSTOMER") {
    return note ? `Khách hàng gửi hàng — Mã vận đơn: ${note}` : "Khách hàng gửi hàng";
  }
  if (status === "RECEIVED" && triggeredBy === "ADMIN") {
    return note ? `Admin xác nhận đã nhận hàng — Tình trạng: ${note}` : "Admin xác nhận đã nhận hàng";
  }
  if (status === "REFUNDED" && triggeredBy === "ADMIN") {
    return note ? `Admin hoàn tiền — GD: ${note}` : "Admin hoàn tiền";
  }

  const label = STATUS_LABELS[status] || status;
  return `Trạng thái: ${label}`;
}

export default function ReturnHistoryTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Chưa có lịch sử xử lý
      </p>
    );
  }

  const sorted = [...statusHistory].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="space-y-0">
        {sorted.map((entry, i) => {
          const isLast = i === sorted.length - 1;
          const actor = ACTOR_CONFIG[entry.triggeredBy] || ACTOR_CONFIG.ADMIN;
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

- [ ] **Step 2: Lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/components/ReturnHistoryTimeline.jsx
git commit -m "feat: add ReturnHistoryTimeline component"
```

---

### Task 9: Update AdminReturnDetail — evidence, timeline, highlighted reasons

**Files:**
- Modify: `D:\AppleStoreMini\src\pages\admin\AdminReturnDetail.jsx`

- [ ] **Step 1: Add imports**

Change lines 1-20 to add new imports:

```jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAdminReturnByIdQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
  useReceiveReturnMutation,
  useRefundReturnMutation,
} from "@/store/api/ordersApi";
import { RETURN_REASON_MAP, RETURN_REQUEST_STATUS_MAP, RETURN_REQUEST_STATUS_COLOR } from "@/lib/constants";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X, Package, MapPin, Image as ImageIcon, Video } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import ImageLightbox from "@/components/shared/ImageLightbox";
import ReturnHistoryTimeline from "@/features/orders/components/ReturnHistoryTimeline";
```

- [ ] **Step 2: Add lightbox state**

After line 27 (`const [condition, setCondition] = useState("");`), add:

```jsx
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
```

- [ ] **Step 3: Replace description card (lines 213-246) with evidence section**

Replace the entire "Description + images" card block with:

```jsx
          {/* Description */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">Mô tả của khách hàng</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {returnReq.description || "Không có mô tả"}
            </p>
          </div>

          {/* Evidence */}
          {(returnReq.images?.length > 0 || returnReq.video) && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-medium text-foreground">Bằng chứng khách hàng</h3>

              {returnReq.images?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Hình ảnh ({returnReq.images.length})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {returnReq.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Ảnh ${i + 1}`}
                        className="aspect-square cursor-pointer rounded-lg object-cover border hover:ring-2 hover:ring-primary/50 transition-shadow"
                        onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {returnReq.video && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Video</span>
                  </div>
                  <video controls className="w-full rounded-lg max-h-[400px] border">
                    <source src={returnReq.video} />
                    Trình duyệt không hỗ trợ phát video.
                  </video>
                </div>
              )}
            </div>
          )}

          {/* Tracking */}
          {returnReq.trackingNumber && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Mã vận đơn gửi trả</h3>
              <p className="text-sm font-mono font-medium">{returnReq.trackingNumber}</p>
            </div>
          )}

          {/* Condition */}
          {returnReq.condition && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Tình trạng hàng khi nhận</h3>
              <p className="text-sm whitespace-pre-wrap">{returnReq.condition}</p>
            </div>
          )}
```

- [ ] **Step 4: Add timeline section before admin note**

After the condition card block, add:

```jsx
          {/* Timeline */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-4 text-sm font-medium text-foreground">Lịch sử xử lý</h3>
            <ReturnHistoryTimeline statusHistory={returnReq.statusHistory} />
          </div>
```

- [ ] **Step 5: Replace admin note card (lines 248-254) with highlighted reason**

Replace:
```jsx
          {/* Admin note (if rejected) */}
          {returnReq.adminNote && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Ghi chú của admin</h3>
              <p className="text-sm text-muted-foreground">{returnReq.adminNote}</p>
            </div>
          )}
```
With:
```jsx
          {/* Rejected reason */}
          {returnReq.status === "REJECTED" && returnReq.adminNote && (
            <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-5 dark:bg-red-950/30">
              <h3 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">Lý do từ chối</h3>
              <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap">{returnReq.adminNote}</p>
            </div>
          )}

          {/* Approved banner */}
          {returnReq.status === "APPROVED" && (
            <div className="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-5 dark:bg-blue-950/30">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">Đã duyệt yêu cầu trả hàng</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">Vui lòng chờ khách hàng gửi hàng về</p>
            </div>
          )}
```

- [ ] **Step 6: Add ImageLightbox at end of return**

Before the final `</div>`, add:

```jsx
      <ImageLightbox
        images={returnReq.images}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
```

- [ ] **Step 7: Lint + build**

```bash
npm run lint
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/admin/AdminReturnDetail.jsx
git commit -m "feat: add evidence, timeline, and highlighted reasons to return detail"
```
