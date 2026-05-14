# Return & Refund Feature Design

**Date:** 2026-05-14  
**Status:** Design — awaiting implementation plan  
**Related:** Cancel Order feature (frontend: 916bd8f, f8932d2, 91d9417, 3bf5343; backend: 2b9308a, 159dc3d)

---

## 1. Requirements Summary

| Requirement | Decision |
|---|---|
| Return window | 7 days from `deliveredAt` |
| Return reasons | Product defective, wrong item, damaged in transit, missing accessories, other (`DEFECTIVE`, `WRONG_ITEM`, `DAMAGED`, `MISSING`, `OTHER`) |
| Return scope | Partial — user selects individual items from the order |
| Return shipping | Paid by shop (defective/wrong product policy) |
| Refund method | MoMo Refund API for MoMo-paid orders; manual bank transfer for COD (tracked via `refundTransactionId = "manual"`) |
| Points & coupons | Deduct earned loyalty points proportionally; restore coupon only if full order returned |
| Architecture | Separate `ReturnRequest` model with related `ReturnRequestItem` table |

---

## 2. Data Model

### 2.1 New Prisma Models

```prisma
enum ReturnReason {
  DEFECTIVE    // Sản phẩm lỗi
  WRONG_ITEM   // Giao sai sản phẩm
  DAMAGED      // Hư hỏng khi vận chuyển
  MISSING      // Thiếu phụ kiện
  OTHER        // Khác
}

enum ReturnRequestStatus {
  PENDING    // Chờ admin xem xét
  APPROVED   // Admin đồng ý, đang chờ hoàn tiền
  REJECTED   // Admin từ chối
  REFUNDED   // Đã hoàn tiền xong
}

model ReturnRequest {
  id                    String               @id @default(cuid())
  orderId               String
  userId                String
  reason                ReturnReason
  description           String?              @db.Text
  images                Json?                // string[] — Cloudinary URLs
  adminNote             String?              @db.Text
  refundAmount          Float                @default(0)
  refundTransactionId   String?              // MoMo transaction ID or "manual"
  status                ReturnRequestStatus  @default(PENDING)
  createdAt             DateTime             @default(now())
  updatedAt             DateTime             @updatedAt

  order                 Order                @relation(fields: [orderId], references: [id])
  user                  User                 @relation(fields: [userId], references: [id])
  items                 ReturnRequestItem[]

  @@index([orderId])
  @@index([userId])
  @@index([status])
}

model ReturnRequestItem {
  id               String         @id @default(cuid())
  returnRequestId  String
  orderItemId      String
  quantity         Int            @default(1)
  refundUnitPrice  Float          // giá hoàn lại cho 1 đơn vị sản phẩm (từ OrderItem.price)

  returnRequest    ReturnRequest  @relation(fields: [returnRequestId], references: [id])
  orderItem        OrderItem      @relation(fields: [orderItemId], references: [id])

  @@index([returnRequestId])
}
```

### 2.2 Relation Strategy

The Order model does **not** need a relation field to ReturnRequest. ReturnRequest references Order via `orderId` (non-unique FK — allows multiple historical return requests per order). The "one active at a time" rule is enforced in application logic:

- On create: query for existing ReturnRequest with `orderId` + status IN (PENDING, APPROVED); reject if found
- On query: fetch the latest ReturnRequest for an order to display current status

### 2.3 Key Design Decisions

- One order can have at most **one** active `ReturnRequest` (PENDING or APPROVED). After REJECTED, user can create a new one (within the 7-day window) — old rejected requests remain as history.
- `refundUnitPrice` is snapshotted from `OrderItem.price` at the time of purchase.
- `images` stores Cloudinary URLs as a JSON string array, matching the existing pattern used for product images.
- Existing `OrderStatus.REFUNDING` and `OrderStatus.REFUNDED` are reused — no new statuses needed.

---

## 3. API Design

### 3.1 User Endpoints (JWT required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/orders/:id/return` | Create return request |
| `GET`  | `/api/orders/:id/return` | Get return request for this order |
| `GET`  | `/api/returns`          | List user's return requests |
| `GET`  | `/api/returns/:id`      | Get single return request detail |

#### `POST /api/orders/:id/return`

**Body:**
```json
{
  "reason": "DEFECTIVE",
  "description": "Màn hình bị sọc xanh từ lúc mở hộp",
  "images": ["https://res.cloudinary.com/.../img1.jpg", "https://res.cloudinary.com/.../img2.jpg"],
  "items": [
    { "orderItemId": "clx...abc", "quantity": 1 }
  ]
}
```

**Validation:**
- Order must belong to requesting user
- `order.status` must be `DELIVERED` (lowercase)
- `deliveredAt` must be within 7 days from now
- No existing `ReturnRequest` with status `PENDING` or `APPROVED`
- Each `orderItemId` must belong to the order, `quantity` ≤ ordered quantity
- `reason` must be a valid `ReturnReason` enum value
- `description` min 10 chars (matching cancel pattern)

**Response:** The created `ReturnRequest` object with items.

#### `GET /api/returns`

Query params: `?page=1&limit=10&status=PENDING`  
Returns paginated list of user's return requests.

### 3.2 Admin Endpoints (JWT + `orders` permission)

| Method | Path | Description |
|---|---|---|
| `GET`  | `/api/admin/returns`         | List all return requests (filterable by status) |
| `GET`  | `/api/admin/returns/:id`     | Get return request detail + order info |
| `POST` | `/api/admin/returns/:id/approve` | Approve + trigger MoMo refund |
| `POST` | `/api/admin/returns/:id/reject`  | Reject with reason |

#### `POST /api/admin/returns/:id/approve`

**Logic (in transaction):**
1. Validate `ReturnRequest.status === PENDING`
2. Calculate `refundAmount` = sum over items of `refundUnitPrice * quantity`
3. If order was paid via MoMo (`paymentMethod === "momo"` and `isPaid === true`):
   - Call `momoService.refund(order.paymentTransactionId, refundAmount, order.code)`
   - Store MoMo refund `requestId` in `refundTransactionId`
   - On successful MoMo IPN callback → set status to `REFUNDED`
4. If order was COD or MoMo refund fails:
   - Set `refundTransactionId = "manual"` — admin handles manually
5. Restore stock for returned items (variant `stock += quantity`)
6. Decrement product `soldCount` for returned items
7. Calculate loyalty points to deduct:
   - Points earned on delivery are per-order total. Deduct proportionally: `pointsDeducted = Math.round(pointsEarned * refundAmount / order.totalAmount)`
   - Deduct from user's `totalPoints` (ensure not negative)
8. If returning **all** items in order:
   - Restore coupon: decrement `Coupon.usedCount`, reset `RedeemedCoupon.isUsed = false`
9. Set `ReturnRequest.status = APPROVED`, `order.status = REFUNDING`
10. Send email to user (reuse `sendOrderStatusUpdate` with REFUNDING label, add return info)

#### `POST /api/admin/returns/:id/reject`

**Body:** `{ "adminNote": "Sản phẩm không có lỗi như mô tả, vui lòng kiểm tra lại" }`

**Logic:**
1. Set `ReturnRequest.status = REJECTED`, `adminNote` = body value
2. Send email to user with rejection reason
3. User can create a new return request (if still within 7 days)

### 3.3 MoMo Refund Integration

Add to `src/services/momo.service.js`:

```javascript
async function refund(transactionId, amount, orderCode) {
  // POST to MoMo refund endpoint
  // Returns { requestId, resultCode, message }
}
```

MoMo refund IPN callback → update `ReturnRequest.refundTransactionId`, set status to `REFUNDED`, set `order.status = REFUNDED`.

### 3.4 Email Updates

Add to `sendOrderStatusUpdate` in `src/services/email.service.js`:
- When `REFUNDING`: show refund amount, list of returned items, and a note "Đang xử lý hoàn tiền..."
- When `REFUNDED`: show refund amount, transaction ID, "Tiền sẽ về ví MoMo trong 1-3 ngày"
- When request `REJECTED`: show admin's rejection reason

---

## 4. Frontend Design

**Note on data fetching:** The backend GET order endpoints (`getOrderById`, `getAdminOrderById`) should include the latest `ReturnRequest` (with items) in the response. The frontend accesses it as `order.returnRequest`.

### 4.1 User — OrderDetail (`src/features/orders/components/OrderDetail.jsx`)

**New state variables:**
```javascript
const [returnOpen, setReturnOpen] = useState(false);
const [selectedItems, setSelectedItems] = useState([]);
```

**Return eligibility condition:**
```javascript
const returnRequest = order.returnRequest; // included by backend
const canReturn =
  order.status === ORDER_STATUS.DELIVERED &&
  order.deliveredAt &&
  new Date(order.deliveredAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
  (!returnRequest || returnRequest.status === "REJECTED");
```

**When `canReturn` is true:**
- Show `Button variant="destructive"` with `RotateCcw` icon: "Yêu cầu trả hàng"
- Subtitle line: "Bạn còn X ngày để yêu cầu trả hàng (hết hạn DD/MM/YYYY)"

**When `order.returnRequest` exists with status PENDING/APPROVED/REFUNDED:**
- Replace button with a colored banner showing current status:
  - PENDING: yellow `bg-yellow-50 border-l-4 border-yellow-400` — "Yêu cầu trả hàng đang được xem xét"
  - APPROVED: blue — "Đã duyệt, đang xử lý hoàn tiền"
  - REJECTED: red — "Yêu cầu bị từ chối" + adminNote

**Return Request Dialog:**
- Uses `ConfirmDialog` + `Form` + `zod` (same pattern as cancel dialog)
- Form fields:
  - Checkbox list of order items (reuse `OrderItemRow` with checkbox variant)
  - `Select` for `reason` (ReturnReason enum with Vietnamese labels)
  - `Textarea` for `description`
  - Image upload (reuse existing Cloudinary upload pattern from admin product form)
- Schema: `returnRequestSchema` in `src/lib/validations.js`

### 4.2 Admin — Return Requests List (`/admin/returns`)

New page `src/pages/admin/AdminReturnList.jsx`:
- Table similar to `AdminOrderTable`:
  - Columns: Mã ĐH, Khách hàng, Lý do, Số tiền trả, Ngày yêu cầu, Trạng thái, Thao tác
  - Status filter tabs: Tất cả, Chờ duyệt, Đã duyệt, Đã từ chối, Đã hoàn tiền
  - Search by order code or customer name
  - Pagination
- Quick-action: "Duyệt" (green) / "Từ chối" (red) buttons per row

Route: add to `src/routes.jsx` under `/admin/returns`.
Navigation: add to AdminLayout sidebar under "Đơn hàng".

### 4.3 Admin — Return Request Detail (`/admin/returns/:id`)

New page `src/pages/admin/AdminReturnDetail.jsx`:
- Layout: 2-column grid (matching `AdminOrderDetail` pattern)
- Left column:
  - Return request header: reason badge, status badge, created date
  - Returned items list (with checkbox-like visual showing selected items)
  - User's description + attached images (lightbox/zoom)
- Right column:
  - Order summary card (items, totals, payment method)
  - Customer info card
  - Order timeline
- Action buttons at top:
  - `Button variant="default" className="bg-green-600"`: "Duyệt & Hoàn tiền"
  - `Button variant="destructive"`: "Từ chối" → opens dialog for adminNote

### 4.4 Admin — Navigation & Badge

- Add "Yêu cầu trả hàng" menu item in admin sidebar (under Orders section)
- Optional: badge showing count of PENDING return requests
- New RTK Query tag: `"Returns"` for cache invalidation

### 4.5 Constants Additions

In `src/lib/constants.js`:
```javascript
export const RETURN_REASON_MAP = {
  DEFECTIVE: "Sản phẩm lỗi",
  WRONG_ITEM: "Giao sai sản phẩm",
  DAMAGED: "Hư hỏng khi vận chuyển",
  MISSING: "Thiếu phụ kiện",
  OTHER: "Lý do khác",
};

export const RETURN_REQUEST_STATUS_MAP = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  REFUNDED: "Đã hoàn tiền",
};

export const RETURN_REQUEST_STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  REFUNDED: "bg-green-100 text-green-800",
};
```

---

## 5. API Slice Changes (`src/store/api/ordersApi.js`)

New RTK Query endpoints:

```javascript
// User
createReturnRequest: builder.mutation({
  query: ({ id, ...body }) => ({ url: `/orders/${id}/return`, method: "POST", body }),
  invalidatesTags: ["Orders", "Order", "Returns"],
}),
getReturnRequest: builder.query({
  query: (id) => `/orders/${id}/return`,
  providesTags: (result, error, id) => [{ type: "Returns", id }],
}),
getMyReturns: builder.query({
  query: (params) => ({ url: "/returns", params }),
  providesTags: ["Returns"],
}),
getReturnById: builder.query({
  query: (id) => `/returns/${id}`,
  providesTags: (result, error, id) => [{ type: "Returns", id }],
}),

// Admin
getAllReturns: builder.query({
  query: (params) => ({ url: "/admin/returns", params }),
  providesTags: ["Returns"],
}),
getAdminReturnById: builder.query({
  query: (id) => `/admin/returns/${id}`,
  providesTags: (result, error, id) => [{ type: "Returns", id }],
}),
approveReturn: builder.mutation({
  query: (id) => ({ url: `/admin/returns/${id}/approve`, method: "POST" }),
  invalidatesTags: ["Orders", "Order", "Returns"],
}),
rejectReturn: builder.mutation({
  query: ({ id, ...body }) => ({ url: `/admin/returns/${id}/reject`, method: "POST", body }),
  invalidatesTags: ["Orders", "Order", "Returns"],
}),
```

---

## 6. Timeline Extension (`src/features/orders/components/OrderTimeline.jsx`)

**Current behavior:** REFUNDING and REFUNDED are grouped with CANCELLED into `CancelledTimeline`, which only shows PENDING → CANCELLED. This is incorrect for refund orders that were successfully delivered first.

**New behavior:** Add a `RefundTimeline` component that shows:
- All 5 normal steps (PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED) as completed (green check)
- Then:
  - If `REFUNDING`: show REFUNDING step as current (pink circle + "Đang xử lý hoàn tiền")
  - If `REFUNDED`: show REFUNDING as completed + REFUNDED as final (gray + "Đã hoàn tiền")

Update the condition to NOT include REFUNDING/REFUNDED in `CancelledTimeline`:

---

## 7. Error Handling

| Scenario | HTTP | Message |
|---|---|---|
| Order not DELIVERED | 400 | "Chỉ có thể yêu cầu trả hàng khi đơn hàng đã được giao" |
| Exceeded 7-day window | 400 | "Đã hết thời hạn yêu cầu trả hàng (7 ngày kể từ khi nhận hàng)" |
| Existing active return request | 400 | "Đơn hàng đã có yêu cầu trả hàng đang được xử lý" |
| Invalid orderItemId | 400 | "Sản phẩm không thuộc đơn hàng này" |
| Quantity exceeds ordered | 400 | "Số lượng trả vượt quá số lượng đã mua" |
| Return request not in PENDING | 400 | "Yêu cầu này không thể xử lý (không ở trạng thái chờ duyệt)" |
| MoMo refund API failure | 500 | Frontend: toast "Hoàn tiền MoMo thất bại, vui lòng thử lại". Admin can retry. |

---

## 8. File Change Summary

### Backend (AppleStoreMini_api)

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Edit | Add `ReturnReason` enum, `ReturnRequestStatus` enum, `ReturnRequest` model, `ReturnRequestItem` model; add `returnRequest` relation to `Order` |
| `src/services/order.service.js` | Edit | Add `createReturnRequest`, `approveReturn`, `rejectReturn`, `getReturns`, `getReturnById` |
| `src/services/momo.service.js` | Edit | Add `refund()` function |
| `src/services/email.service.js` | Edit | Extend `sendOrderStatusUpdate` for REFUNDING/REFUNDED/rejected cases |
| `src/controllers/order.controller.js` | Edit | Add `createReturnRequest`, `getReturnRequest`, `getMyReturns`, `getReturnById` |
| `src/controllers/admin/order.controller.js` | Edit | Add `getAllReturns`, `getReturnById`, `approveReturn`, `rejectReturn` |
| `src/routes/order.routes.js` | Edit | Add user return routes |
| `src/routes/admin.routes.js` | Edit | Add admin return routes |
| `src/validators/order.validator.js` | Edit | Add `createReturnRequest` validation rules |

### Frontend (AppleStoreMini)

| File | Action | Description |
|---|---|---|
| `src/lib/constants.js` | Edit | Add `RETURN_REASON_MAP`, `RETURN_REQUEST_STATUS_MAP`, `RETURN_REQUEST_STATUS_COLOR` |
| `src/lib/validations.js` | Edit | Add `returnRequestSchema` |
| `src/store/api/ordersApi.js` | Edit | Add 8 new RTK Query endpoints |
| `src/features/orders/components/OrderDetail.jsx` | Edit | Add return button, return status banner, return dialog |
| `src/features/orders/components/OrderTimeline.jsx` | Edit | Adjust REFUNDING/REFUNDED timeline display |
| `src/features/orders/components/OrderItemRow.jsx` | Edit | Add checkbox variant for return item selection |
| `src/routes.jsx` | Edit | Add `/admin/returns` and `/admin/returns/:id` routes |
| `src/pages/admin/AdminReturnList.jsx` | **New** | Admin return requests list page |
| `src/pages/admin/AdminReturnDetail.jsx` | **New** | Admin return request detail page |
| `src/components/layout/AdminLayout.jsx` | Edit | Add sidebar navigation item |

---

## 9. Testing Strategy

- **Backend:** Unit tests for `createReturnRequest` (validation), `approveReturn` (stock restore, points deduction, coupon restore logic), MoMo refund mock
- **Frontend:** Component tests for return button visibility conditions, dialog form validation, admin list/approve/reject flows
- **Integration:** Full flow: user creates return → admin approves → MoMo refund callback → verify stock, points, coupon state
