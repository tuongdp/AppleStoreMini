# Design: Admin Return Detail UX Improvements

**Date:** 2026-06-03
**Scope:** Backend (schema + services) + Frontend (UI components)

## Problem

Admin Return Detail page lacks:
1. **Customer evidence** — images/video uploaded by customer are stored but not displayed
2. **Processing timeline** — no history of return status transitions (who did what, when)
3. **Clear reason display** — reject/approve reasons buried in small text

## Solution

Three additions to AdminReturnDetail page:
1. **Image grid + video player** section below customer description
2. **ReturnStatusHistory** model + timline component tracking full lifecycle
3. **Highlighted reason boxes** for reject/approve decisions

---

## Backend Changes

### Schema

#### Add `video` field to `ReturnRequest`

```prisma
model ReturnRequest {
  // ... existing fields ...
  video               String?             // NEW: single video URL
  // ... rest unchanged ...
}
```

#### New `ReturnStatusHistory` model

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

Add `statusHistory ReturnStatusHistory[]` relation on `ReturnRequest`.

### Migration

Run `npx prisma db push` to sync (existing DB has migration history issue).

### Service Updates

#### `createReturnRequest` (order.service.js:712-792)
- Accept optional `video` from `returnData`, store in create data
- Add status history: `{ status: "PENDING", triggeredBy: "CUSTOMER" }`

#### `approveReturn` (order.service.js:794-836)
- After updating return status → create history: `{ status: "APPROVED", triggeredBy: "ADMIN" }`

#### `rejectReturn` (order.service.js:1059-1111)
- After updating return status → create history: `{ status: "REJECTED", note: adminNote, triggeredBy: "ADMIN" }`

#### `updateReturnTracking` (order.service.js:838-859)
- After updating tracking → create history: `{ status: "RETURNING", note: trackingNumber, triggeredBy: "CUSTOMER" }`

#### `receiveReturn` (order.service.js:861-884)
- After updating status → create history: `{ status: "RECEIVED", note: condition, triggeredBy: "ADMIN" }`

#### `processReturnRefund` (order.service.js:886-1029)
- After updating status → create history: `{ status: "REFUNDED", note: refundTransactionId, triggeredBy: "ADMIN" }`

#### Query updates (orderReturn.service.js)
- `getReturnById` and `getAllReturns` → include `statusHistory: { orderBy: { createdAt: "asc" } }`

### Validator

`createReturnRules` in `order.validator.js` — add optional `video` field (string URL).

---

## Frontend Changes

### Files

| File | Action |
|------|--------|
| `src/pages/admin/AdminReturnDetail.jsx` | Add evidence section, timeline, highlighted reasons |
| `src/features/orders/components/ReturnHistoryTimeline.jsx` | **New** component |
| `src/components/shared/ImageLightbox.jsx` | **New** dialog for full-size image view |

### Component: ImageLightbox

**Props:** `{ images, open, onClose, initialIndex }`

- Full-screen dialog with navigation arrows
- Uses existing `Dialog` component pattern
- Shows current image with prev/next controls

### Component: ReturnHistoryTimeline

**Props:** `{ statusHistory }` (array of `{ status, note, triggeredBy, createdAt }`)

Same visual style as `OrderHistoryTimeline` but for return lifecycle:

| Entry | Description |
|-------|-------------|
| `PENDING + CUSTOMER` | "Khách hàng gửi yêu cầu trả hàng" |
| `APPROVED + ADMIN` | "Admin duyệt yêu cầu trả hàng" |
| `REJECTED + ADMIN` | "Admin từ chối yêu cầu — Lý do: {note}" |
| `RETURNING + CUSTOMER` | "Khách hàng gửi hàng — Tracking: {note}" |
| `RECEIVED + ADMIN` | "Admin xác nhận đã nhận hàng" + condition if present |
| `REFUNDED + ADMIN` | "Admin hoàn tiền — GD: {note}" |
| Fallback | Status label + note |

### AdminReturnDetail.jsx changes

#### 1. Evidence section (below description)

```jsx
{returnRequest.description && (
  <Card>
    <CardHeader><CardTitle>Mô tả của khách hàng</CardTitle></CardHeader>
    <CardContent><p>{returnRequest.description}</p></CardContent>
  </Card>
)}

{/* NEW: Evidence section */}
{(returnRequest.images?.length > 0 || returnRequest.video) && (
  <Card>
    <CardHeader><CardTitle>Bằng chứng khách hàng</CardTitle></CardHeader>
    <CardContent>
      {returnRequest.images?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {returnRequest.images.map((url, i) => (
            <img key={i} src={url} className="cursor-pointer rounded-lg object-cover aspect-square"
                 onClick={() => openLightbox(i)} />
          ))}
        </div>
      )}
      {returnRequest.video && (
        <video controls className="w-full rounded-lg max-h-[400px]">
          <source src={returnRequest.video} />
        </video>
      )}
    </CardContent>
  </Card>
)}
```

#### 2. Timeline section

Add `ReturnHistoryTimeline` card between evidence and admin note sections.

#### 3. Highlighted reason box

Replace plain `adminNote` text with colored banner:

- REJECTED: red border-left box — "Lý do từ chối: {adminNote}"
- APPROVED: green border-left box — "Đã duyệt yêu cầu trả hàng"
- RECEIVED: blue box — "Tình trạng hàng nhận: {condition}"

### Data handling

- `images` field is `Json` from backend → already parsed as array by Prisma
- Handle null/undefined safely
- Filter empty strings from image array

---

## Testing

- Backend: verify new fields in Prisma schema compile
- Frontend: verify lint + build pass
- Manual: open return detail page with images → verify grid renders
- Manual: approve/reject a return → verify timeline entries appear

## Verification

1. `npm run lint` in both repos
2. `npm run build` in frontend
3. `npx prisma db push` in API
