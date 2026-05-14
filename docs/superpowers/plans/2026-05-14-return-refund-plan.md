# Return & Refund Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full return/refund flow: user requests return within 7 days of delivery → admin approves/rejects → MoMo refund → stock/points/coupon restore.

**Architecture:** New `ReturnRequest` + `ReturnRequestItem` Prisma models (1-to-many from Order). Backend services handle create/approve/reject with stock restore, points deduction, coupon restore, MoMo refund integration, and email notifications. Frontend extends OrderDetail with return UI, adds admin return list/detail pages.

**Tech Stack:** Express.js, Prisma (MySQL), MoMo Payment API, React 18, Redux Toolkit RTK Query, shadcn/ui, react-hook-form + zod, Tailwind CSS

---

## File Structure Map

### Backend (AppleStoreMini_api)

| File | Action | Responsibility |
|---|---|---|
| `prisma/schema.prisma` | Edit | Add enums + models |
| `src/services/order.service.js` | Edit | createReturnRequest, approveReturn, rejectReturn, getReturns, getReturnById |
| `src/services/momo.service.js` | Edit | refund() — MoMo refund API call |
| `src/services/email.service.js` | Edit | Extend sendOrderStatusUpdate for return emails |
| `src/controllers/order.controller.js` | Edit | 4 user return handlers |
| `src/controllers/admin/order.controller.js` | Edit | 4 admin return handlers |
| `src/routes/order.routes.js` | Edit | Add user return routes |
| `src/routes/admin.routes.js` | Edit | Add admin return routes |
| `src/validators/order.validator.js` | Edit | Add createReturnRequest rules |

### Frontend (AppleStoreMini)

| File | Action | Responsibility |
|---|---|---|
| `src/lib/constants.js` | Edit | RETURN_REASON_MAP, RETURN_REQUEST_STATUS_MAP, RETURN_REQUEST_STATUS_COLOR |
| `src/lib/validations.js` | Edit | returnRequestSchema (zod) |
| `src/store/api/ordersApi.js` | Edit | 8 new RTK Query endpoints |
| `src/features/orders/components/OrderDetail.jsx` | Edit | Return button, status banner, create dialog |
| `src/features/orders/components/OrderTimeline.jsx` | Edit | RefundTimeline component |
| `src/features/orders/components/OrderItemRow.jsx` | Edit | Checkbox variant for return selection |
| `src/pages/admin/AdminReturnList.jsx` | **New** | Admin return requests table |
| `src/pages/admin/AdminReturnDetail.jsx` | **New** | Admin return detail + approve/reject |
| `src/routes.jsx` | Edit | Add /admin/returns, /admin/returns/:id |
| `src/components/layout/AdminLayout.jsx` | Edit | Sidebar link |

---

### Task 1: Prisma Schema Migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add enums and models to schema**

```prisma
enum ReturnReason {
  DEFECTIVE
  WRONG_ITEM
  DAMAGED
  MISSING
  OTHER
}

enum ReturnRequestStatus {
  PENDING
  APPROVED
  REJECTED
  REFUNDED
}

model ReturnRequest {
  id                  String              @id @default(cuid())
  orderId             String
  userId              String
  reason              ReturnReason
  description         String?             @db.Text
  images              Json?
  adminNote           String?             @db.Text
  refundAmount        Float               @default(0)
  refundTransactionId String?
  status              ReturnRequestStatus @default(PENDING)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  order Order @relation(fields: [orderId], references: [id])
  user  User  @relation(fields: [userId], references: [id])
  items ReturnRequestItem[]

  @@index([orderId])
  @@index([userId])
  @@index([status])
}

model ReturnRequestItem {
  id              String          @id @default(cuid())
  returnRequestId String
  orderItemId     String
  quantity        Int             @default(1)
  refundUnitPrice Float

  returnRequest ReturnRequest @relation(fields: [returnRequestId], references: [id])
  orderItem     OrderItem     @relation(fields: [orderItemId], references: [id])

  @@index([returnRequestId])
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_return_request
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add ReturnRequest and ReturnRequestItem models"
```

---

### Task 2: Backend — createReturnRequest Service

**Files:**
- Modify: `src/services/order.service.js` (add at end of file, before module.exports)

- [ ] **Step 1: Add createReturnRequest function**

Add after the existing `updateOrderStatus` function:

```javascript
const createReturnRequest = async (orderId, userId, returnData) => {
  const { reason, description, images, items: returnItems } = returnData;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");

  if (order.status !== "DELIVERED") {
    throw new ApiError(400, "Chỉ có thể yêu cầu trả hàng khi đơn hàng đã được giao");
  }

  if (!order.deliveredAt) {
    throw new ApiError(400, "Đơn hàng chưa được xác nhận đã giao");
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (new Date(order.deliveredAt) < sevenDaysAgo) {
    throw new ApiError(400, "Đã hết thời hạn yêu cầu trả hàng (7 ngày kể từ khi nhận hàng)");
  }

  const existingActive = await prisma.returnRequest.findFirst({
    where: { orderId, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existingActive) {
    throw new ApiError(400, "Đơn hàng đã có yêu cầu trả hàng đang được xử lý");
  }

  if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) {
    throw new ApiError(400, "Vui lòng chọn ít nhất một sản phẩm để trả");
  }

  const orderItemMap = {};
  order.items.forEach((oi) => { orderItemMap[oi.id] = oi; });

  let refundAmount = 0;
  const validatedItems = [];

  for (const ri of returnItems) {
    const orderItem = orderItemMap[ri.orderItemId];
    if (!orderItem) throw new ApiError(400, `Sản phẩm ${ri.orderItemId} không thuộc đơn hàng này`);
    if (ri.quantity > orderItem.quantity) {
      throw new ApiError(400, `Số lượng trả của ${orderItem.name} vượt quá số lượng đã mua`);
    }

    const unitPrice = orderItem.price;
    validatedItems.push({
      orderItemId: ri.orderItemId,
      quantity: ri.quantity,
      refundUnitPrice: unitPrice,
    });
    refundAmount += unitPrice * ri.quantity;
  }

  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderId,
      userId,
      reason,
      description: description || "",
      images: images || [],
      refundAmount,
      items: {
        create: validatedItems,
      },
    },
    include: { items: true },
  });

  return returnRequest;
};
```

- [ ] **Step 2: Add to module.exports**

```javascript
module.exports = {
  // ... existing exports ...
  createReturnRequest,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/services/order.service.js
git commit -m "feat: add createReturnRequest service"
```

---

### Task 3: Backend — approveReturn Service

**Files:**
- Modify: `src/services/order.service.js` (add before module.exports)

- [ ] **Step 1: Add approveReturn function**

```javascript
const approveReturn = async (returnRequestId) => {
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: {
      items: true,
      order: {
        include: { user: { select: { email: true, fullName: true } } },
      },
    },
  });
  if (!returnReq) throw new ApiError(404, "Không tìm thấy yêu cầu trả hàng");
  if (returnReq.status !== "PENDING") {
    throw new ApiError(400, "Yêu cầu này không ở trạng thái chờ duyệt");
  }

  const order = returnReq.order;
  let refundTransactionId = null;

  // MoMo refund for paid MoMo orders
  if (order.paymentMethod === "MOMO" && order.isPaid && order.paymentTransactionId) {
    try {
      const momoService = require("./momo.service");
      const refundResult = await momoService.refund(
        order.paymentTransactionId,
        returnReq.refundAmount,
        order.code,
      );
      refundTransactionId = refundResult.requestId;
    } catch (err) {
      console.error("MoMo refund failed:", err.message);
      refundTransactionId = "manual";
    }
  } else {
    refundTransactionId = "manual";
  }

  const updatedReturn = await prisma.$transaction(async (tx) => {
    // Restore stock
    await restoreOrderStock(tx, returnReq.orderId);

    // Decrement product soldCount
    await updateProductsSoldCount(tx, returnReq.orderId, false);

    // Deduct points proportionally
    const pointTx = await tx.pointTransaction.findFirst({
      where: { orderId: returnReq.orderId, type: "EARN_ORDER" },
    });
    if (pointTx && pointTx.points > 0) {
      const proportion = returnReq.refundAmount / order.totalAmount;
      const pointsToDeduct = Math.min(
        Math.round(pointTx.points * proportion),
        pointTx.points,
      );
      if (pointsToDeduct > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: { points: { decrement: pointsToDeduct } },
        });
        await tx.pointTransaction.create({
          data: {
            userId: order.userId,
            orderId: returnReq.orderId,
            type: "REFUND_DEDUCT",
            points: -pointsToDeduct,
            description: `-${pointsToDeduct} điểm do trả hàng đơn #${order.code}`,
          },
        });
      }
    }

    // Restore coupon if all items returned
    const allOrderItemIds = (await tx.orderItem.findMany({
      where: { orderId: returnReq.orderId },
      select: { id: true, quantity: true },
    })).reduce((acc, oi) => { acc[oi.id] = oi.quantity; return acc; }, {});

    let isFullReturn = true;
    const returnItemMap = {};
    returnReq.items.forEach((ri) => { returnItemMap[ri.orderItemId] = ri.quantity; });

    for (const [oiId, qty] of Object.entries(allOrderItemIds)) {
      if ((returnItemMap[oiId] || 0) < qty) { isFullReturn = false; break; }
    }

    if (isFullReturn && order.couponCode) {
      await tx.coupon.update({
        where: { code: order.couponCode },
        data: { usedCount: { decrement: 1 } },
      });
      await tx.redeemedCoupon.updateMany({
        where: { userId: order.userId, code: order.couponCode, isUsed: true },
        data: { isUsed: false, usedAt: null },
      });
    }

    // Update return request
    const updated = await tx.returnRequest.update({
      where: { id: returnRequestId },
      data: {
        status: refundTransactionId === "manual" ? "REFUNDED" : "APPROVED",
        refundTransactionId,
      },
      include: { items: true },
    });

    // Update order status
    const orderStatus = refundTransactionId === "manual" ? "REFUNDED" : "REFUNDING";
    await tx.order.update({
      where: { id: returnReq.orderId },
      data: {
        status: orderStatus,
        statusHistory: { create: [{ status: orderStatus, note: "Hoàn tiền do trả hàng" }] },
      },
    });

    return updated;
  });

  // Send email
  const emailStatus = updated.status === "REFUNDED" ? "REFUNDED" : "REFUNDING";
  emailService.sendOrderStatusUpdate(
    order.user.email,
    order.user.fullName,
    { ...order, status: emailStatus },
  ).catch((err) => console.error("Gửi email hoàn tiền thất bại", err));

  return updatedReturn;
};
```

- [ ] **Step 2: Add to module.exports**

```javascript
module.exports = {
  // ... existing exports ...
  approveReturn,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/services/order.service.js
git commit -m "feat: add approveReturn service with stock/points/coupon restore"
```

---

### Task 4: Backend — rejectReturn + query functions

**Files:**
- Modify: `src/services/order.service.js`

- [ ] **Step 1: Add rejectReturn, getReturns, getReturnById, getAllReturns**

Add before module.exports:

```javascript
const rejectReturn = async (returnRequestId, adminNote) => {
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: {
      order: {
        include: { user: { select: { email: true, fullName: true } } },
      },
    },
  });
  if (!returnReq) throw new ApiError(404, "Không tìm thấy yêu cầu trả hàng");
  if (returnReq.status !== "PENDING") {
    throw new ApiError(400, "Yêu cầu này không ở trạng thái chờ duyệt");
  }

  const updated = await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: { status: "REJECTED", adminNote },
    include: { items: true },
  });

  emailService.sendOrderStatusUpdate(
    returnReq.order.user.email,
    returnReq.order.user.fullName,
    {
      ...returnReq.order,
      status: "REJECTED_RETURN",
      adminNote,
    },
  ).catch((err) => console.error("Gửi email từ chối trả hàng thất bại", err));

  return updated;
};

const getReturnById = async (returnId, userId) => {
  const where = { id: returnId };
  if (userId) where.userId = userId;

  const returnReq = await prisma.returnRequest.findFirst({
    where,
    include: {
      items: {
        include: {
          orderItem: {
            include: {
              variant: {
                select: { color: true, storage: true, images: true, product: { select: { name: true, images: true, slug: true } } },
              },
            },
          },
        },
      },
      order: {
        select: {
          code: true,
          status: true,
          subtotal: true,
          shippingFee: true,
          discountAmount: true,
          totalAmount: true,
          paymentMethod: true,
          isPaid: true,
          createdAt: true,
          deliveredAt: true,
          shippingFullName: true,
          shippingPhone: true,
          shippingAddress: true,
          shippingWard: true,
          shippingDistrict: true,
          shippingProvince: true,
          user: { select: { fullName: true, email: true } },
          items: {
            include: {
              variant: {
                select: { color: true, storage: true, images: true, product: { select: { name: true, images: true, slug: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!returnReq) throw new ApiError(404, "Không tìm thấy yêu cầu trả hàng");
  return returnReq;
};

const getMyReturns = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query, 10);
  const where = { userId };
  if (query.status) where.status = query.status;

  const [data, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: true,
        order: { select: { code: true, totalAmount: true, status: true } },
      },
    }),
    prisma.returnRequest.count({ where }),
  ]);
  return { data, pagination: buildPagination(page, limit, total) };
};

const getAllReturns = async (query) => {
  const { page, limit, skip } = parsePagination(query, 10);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.search) {
    where.order = { code: { contains: query.search } };
  }

  const [data, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: true,
        user: { select: { fullName: true, email: true } },
        order: { select: { code: true, totalAmount: true, status: true } },
      },
    }),
    prisma.returnRequest.count({ where }),
  ]);
  return { data, pagination: buildPagination(page, limit, total) };
};
```

- [ ] **Step 2: Add all to module.exports**

```javascript
module.exports = {
  // ... existing exports ...
  rejectReturn,
  getReturnById,
  getMyReturns,
  getAllReturns,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/services/order.service.js
git commit -m "feat: add rejectReturn, getReturnById, getMyReturns, getAllReturns"
```

---

### Task 5: Backend — MoMo Refund Service

**Files:**
- Modify: `src/services/momo.service.js`

- [ ] **Step 1: Add refund function**

Add before `module.exports`:

```javascript
const REFUND_API_URL = process.env.MOMO_REFUND_API_URL || "https://test-payment.momo.vn/v2/gateway/api/refund";

const refund = (transactionId, amount, orderCode) => {
  if (!ACCESS_KEY || !SECRET_KEY) {
    throw new Error("MoMo chưa được cấu hình (thiếu MOMO_ACCESS_KEY / MOMO_SECRET_KEY)");
  }

  const requestId = `REFUND-${orderCode}-${Date.now()}`;
  const rawSignature = `accessKey=${ACCESS_KEY}&amount=${Math.round(amount)}&description=Hoan tien don hang ${orderCode}&orderId=${orderCode}&partnerCode=${PARTNER_CODE}&requestId=${requestId}&transId=${transactionId}`;
  const signature = sign(rawSignature);

  const body = JSON.stringify({
    partnerCode: PARTNER_CODE,
    accessKey: ACCESS_KEY,
    requestId,
    orderId: orderCode,
    amount: Math.round(amount),
    transId: transactionId,
    description: `Hoan tien don hang ${orderCode}`,
    signature,
    lang: "vi",
  });

  return new Promise((resolve, reject) => {
    const url = new URL(REFUND_API_URL);
    const opts = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const r = JSON.parse(data);
          if (r.resultCode === 0) resolve({ requestId, transactionId: r.transId || transactionId });
          else reject(new Error(r.message || "MoMo refund failed"));
        } catch (e) {
          reject(new Error(`Parse MoMo refund response failed: ${e.message}`));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
};
```

- [ ] **Step 2: Add to module.exports**

```javascript
module.exports = { createPaymentUrl, verifyReturn, verifyIpn, refund };
```

- [ ] **Step 3: Commit**

```bash
git add src/services/momo.service.js
git commit -m "feat: add MoMo refund API integration"
```

---

### Task 6: Backend — Email Service Extension

**Files:**
- Modify: `src/services/email.service.js`

- [ ] **Step 1: Extend sendOrderStatusUpdate for return cases**

In `sendOrderStatusUpdate`, replace the existing `order.status === "CANCELLED"` block with a more general condition:

Replace:
```javascript
${order.status === "CANCELLED" && order.cancelReason ? `
<div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px;
            padding: 16px; margin-bottom: 28px;">
    <p style="font-size: 13px; color: #92400e; margin: 0 0 4px; font-weight: 600;">Lý do huỷ</p>
    <p style="font-size: 14px; color: #92400e; margin: 0;">${order.cancelReason}</p>
</div>` : ""}
```

With:
```javascript
${renderStatusNote(order)}
```

And add a helper function before `sendOrderStatusUpdate`:

```javascript
const renderStatusNote = (order) => {
  // Cancel reason
  if (order.status === "CANCELLED" && order.cancelReason) {
    return `<div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px;
              padding: 16px; margin-bottom: 28px;">
      <p style="font-size: 13px; color: #92400e; margin: 0 0 4px; font-weight: 600;">Lý do huỷ</p>
      <p style="font-size: 14px; color: #92400e; margin: 0;">${order.cancelReason}</p>
    </div>`;
  }

  // Return rejected
  if (order.status === "REJECTED_RETURN" && order.adminNote) {
    return `<div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px;
              padding: 16px; margin-bottom: 28px;">
      <p style="font-size: 13px; color: #991b1b; margin: 0 0 4px; font-weight: 600;">Yêu cầu trả hàng bị từ chối</p>
      <p style="font-size: 14px; color: #991b1b; margin: 0;">${order.adminNote}</p>
    </div>`;
  }

  // Refunding / Refunded
  if ((order.status === "REFUNDING" || order.status === "REFUNDED") && order.refundAmount) {
    const label = order.status === "REFUNDING" ? "Đang xử lý hoàn tiền" : "Đã hoàn tiền";
    const color = order.status === "REFUNDING" ? "#fef3c7" : "#dcfce7";
    const borderColor = order.status === "REFUNDING" ? "#fcd34d" : "#86efac";
    const textColor = order.status === "REFUNDING" ? "#92400e" : "#166534";
    return `<div style="background: ${color}; border: 1px solid ${borderColor}; border-radius: 12px;
              padding: 16px; margin-bottom: 28px;">
      <p style="font-size: 13px; color: ${textColor}; margin: 0 0 4px; font-weight: 600;">${label}</p>
      <p style="font-size: 14px; color: ${textColor}; margin: 0;">Số tiền: ${formatPrice(order.refundAmount)}</p>
      ${order.refundTransactionId && order.refundTransactionId !== "manual" ? `<p style="font-size: 12px; color: ${textColor}; margin: 4px 0 0;">Mã giao dịch: ${order.refundTransactionId}</p>` : ""}
    </div>`;
  }

  return "";
};
```

- [ ] **Step 2: Also extend the `sendOrderStatusUpdate` to pass refundAmount**

In the service functions that call `sendOrderStatusUpdate` for return emails, ensure the `order` object includes `refundAmount` and `refundTransactionId`. The `approveReturn` function should include these when sending the email:

Update the email call in `approveReturn`:
```javascript
emailService.sendOrderStatusUpdate(
  order.user.email,
  order.user.fullName,
  {
    ...order,
    status: emailStatus,
    refundAmount: returnReq.refundAmount,
    refundTransactionId,
  },
).catch(...);
```

- [ ] **Step 3: Commit**

```bash
git add src/services/email.service.js
git commit -m "feat: extend email for return/refund status notifications"
```

---

### Task 7: Backend — User Return Controllers

**Files:**
- Modify: `src/controllers/order.controller.js`

- [ ] **Step 1: Add 4 handler functions**

Add before `module.exports`:

```javascript
const createReturnRequest = catchAsync(async (req, res) => {
  const returnRequest = await orderService.createReturnRequest(
    req.params.id,
    req.user.id,
    req.body,
  );
  res.status(201).json(new ApiResponse(201, returnRequest, "Gửi yêu cầu trả hàng thành công"));
});

const getOrderReturnRequest = catchAsync(async (req, res) => {
  const returnReq = await orderService.getReturnById(req.params.id, req.user.id);
  res.json(new ApiResponse(200, returnReq, "Thành công"));
});

const getMyReturns = catchAsync(async (req, res) => {
  const result = await orderService.getMyReturns(req.user.id, req.query);
  res.json(new ApiResponse(200, result.data, "Thành công", result.pagination));
});

const getReturnById = catchAsync(async (req, res) => {
  const returnReq = await orderService.getReturnById(req.params.returnId, req.user.id);
  res.json(new ApiResponse(200, returnReq, "Thành công"));
});
```

- [ ] **Step 2: Add to module.exports**

```javascript
module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  confirmDelivered,
  createReturnRequest,
  getOrderReturnRequest,
  getMyReturns,
  getReturnById,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/controllers/order.controller.js
git commit -m "feat: add user return request controllers"
```

---

### Task 8: Backend — Admin Return Controllers

**Files:**
- Modify: `src/controllers/admin/order.controller.js`

- [ ] **Step 1: Add 4 admin handler functions**

Add before `module.exports`:

```javascript
const getAllReturns = catchAsync(async (req, res) => {
  const result = await orderService.getAllReturns(req.query);
  res.json(new ApiResponse(200, result.data, "Thành công", result.pagination));
});

const getReturnById = catchAsync(async (req, res) => {
  const returnReq = await orderService.getReturnById(req.params.returnId);
  res.json(new ApiResponse(200, returnReq, "Thành công"));
});

const approveReturn = catchAsync(async (req, res) => {
  const result = await orderService.approveReturn(req.params.returnId);
  res.json(new ApiResponse(200, result, "Duyệt trả hàng và hoàn tiền thành công"));
});

const rejectReturn = catchAsync(async (req, res) => {
  const result = await orderService.rejectReturn(req.params.returnId, req.body.adminNote);
  res.json(new ApiResponse(200, result, "Đã từ chối yêu cầu trả hàng"));
});
```

- [ ] **Step 2: Add to module.exports**

```javascript
module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllReturns,
  getReturnById,
  approveReturn,
  rejectReturn,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/controllers/admin/order.controller.js
git commit -m "feat: add admin return request controllers"
```

---

### Task 9: Backend — Routes & Validators

**Files:**
- Modify: `src/routes/order.routes.js`
- Modify: `src/routes/admin.routes.js`
- Modify: `src/validators/order.validator.js`

- [ ] **Step 1: Add user return routes**

In `src/routes/order.routes.js`, add after `router.post("/:id/payment", ...)`:

```javascript
// Return requests
router.post("/:id/return", controller.createReturnRequest);
router.get("/:id/return", controller.getOrderReturnRequest);
router.get("/returns", controller.getMyReturns);
router.get("/returns/:returnId", controller.getReturnById);
```

Note: the `/returns` routes need to be defined before `/:id` to avoid conflict. Since `/returns` doesn't start with a param, it's fine — but the order in Express matters. Define `/returns` before `/:id`:

The final file:

```javascript
const router = require("express").Router();
const controller = require("../controllers/order.controller");
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createOrderRules } = require("../validators/order.validator");

router.use(protect);

router.post("/", createOrderRules, validate, controller.createOrder);
router.get("/", controller.getOrders);
router.get("/returns", controller.getMyReturns);
router.get("/returns/:returnId", controller.getReturnById);
router.get("/:id", controller.getOrderById);
router.post("/:id/cancel", controller.cancelOrder);
router.post("/:id/confirm-delivered", controller.confirmDelivered);
router.post("/:id/payment", paymentController.createPaymentUrl);
router.post("/:id/return", controller.createReturnRequest);
router.get("/:id/return", controller.getOrderReturnRequest);

module.exports = router;
```

- [ ] **Step 2: Add admin return routes**

In `src/routes/admin.routes.js`, add after the existing admin order routes:

```javascript
// ── Returns ───────────────────────────────────────────
router.get("/returns", hasPermission("orders"), adminOrderCtrl.getAllReturns);
router.get("/returns/:returnId", hasPermission("orders"), adminOrderCtrl.getReturnById);
router.post("/returns/:returnId/approve", hasPermission("orders"), adminOrderCtrl.approveReturn);
router.post("/returns/:returnId/reject", hasPermission("orders"), adminOrderCtrl.rejectReturn);
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/order.routes.js src/routes/admin.routes.js
git commit -m "feat: add return request routes (user + admin)"
```

---

### Task 10: Frontend — API Slice (8 new endpoints)

**Files:**
- Modify: `src/store/api/ordersApi.js`

- [ ] **Step 1: Add endpoints after existing ones**

Add inside the `endpoints` builder, after `cancelOrderByAdmin`:

```javascript
// ── Return / Refund ───────────────────────────────────
createReturnRequest: builder.mutation({
  query: ({ id, ...body }) => ({
    url: `/orders/${id}/return`,
    method: "POST",
    body,
  }),
  invalidatesTags: (result, error, { id }) => [
    "Orders",
    { type: "Order", id },
    "Returns",
  ],
}),
getOrderReturnRequest: builder.query({
  query: (id) => `/orders/${id}/return`,
  providesTags: (result, error, id) => [{ type: "Returns", id: `order-${id}` }],
}),
getMyReturns: builder.query({
  query: (params = {}) => ({ url: "/returns", params }),
  providesTags: ["Returns"],
}),
getReturnById: builder.query({
  query: (returnId) => `/returns/${returnId}`,
  providesTags: (result, error, returnId) => [{ type: "Returns", id: returnId }],
}),
// Admin
getAllReturns: builder.query({
  query: (params = {}) => ({ url: "/admin/returns", params }),
  providesTags: ["Returns"],
}),
getAdminReturnById: builder.query({
  query: (returnId) => `/admin/returns/${returnId}`,
  providesTags: (result, error, returnId) => [{ type: "Returns", id: returnId }],
}),
approveReturn: builder.mutation({
  query: (returnId) => ({
    url: `/admin/returns/${returnId}/approve`,
    method: "POST",
  }),
  invalidatesTags: (result, error, returnId) => [
    "Orders",
    { type: "Order" },
    "Returns",
    { type: "Returns", id: returnId },
  ],
}),
rejectReturn: builder.mutation({
  query: ({ returnId, adminNote }) => ({
    url: `/admin/returns/${returnId}/reject`,
    method: "POST",
    body: { adminNote },
  }),
  invalidatesTags: (result, error, { returnId }) => [
    "Orders",
    { type: "Order" },
    "Returns",
    { type: "Returns", id: returnId },
  ],
}),
```

Also, add the return-related hooks to the export list at the bottom of the file. After the existing `useCancelOrderByAdminMutation` line:

```javascript
export const {
  // ... all existing exports ...
  useCreateReturnRequestMutation,
  useGetOrderReturnRequestQuery,
  useGetMyReturnsQuery,
  useGetReturnByIdQuery,
  useGetAllReturnsQuery,
  useGetAdminReturnByIdQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
} = ordersApi;
```

- [ ] **Step 2: Add "Returns" tag to baseApi.js**

In `src/store/api/baseApi.js`, add `"Returns"` to the `tagTypes` array.

- [ ] **Step 3: Commit**

```bash
git add src/store/api/ordersApi.js src/store/api/baseApi.js
git commit -m "feat: add return/refund RTK Query endpoints"
```

---

### Task 11: Frontend — Constants & Validations

**Files:**
- Modify: `src/lib/constants.js`
- Modify: `src/lib/validations.js`

- [ ] **Step 1: Add return constants**

In `src/lib/constants.js`, add after `ORDER_STATUS_COLOR`:

```javascript
export const RETURN_REASON = {
  DEFECTIVE: "DEFECTIVE",
  WRONG_ITEM: "WRONG_ITEM",
  DAMAGED: "DAMAGED",
  MISSING: "MISSING",
  OTHER: "OTHER",
};

export const RETURN_REASON_MAP = {
  DEFECTIVE: "Sản phẩm lỗi",
  WRONG_ITEM: "Giao sai sản phẩm",
  DAMAGED: "Hư hỏng khi vận chuyển",
  MISSING: "Thiếu phụ kiện",
  OTHER: "Lý do khác",
};

export const RETURN_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REFUNDED: "REFUNDED",
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

- [ ] **Step 2: Add returnRequestSchema**

In `src/lib/validations.js`, add:

```javascript
import { z } from "zod";

export const returnRequestSchema = z.object({
  reason: z.enum(["DEFECTIVE", "WRONG_ITEM", "DAMAGED", "MISSING", "OTHER"], {
    errorMap: () => ({ message: "Vui lòng chọn lý do trả hàng" }),
  }),
  description: z
    .string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(1000, "Mô tả không được vượt quá 1000 ký tự"),
  items: z
    .array(
      z.object({
        orderItemId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Vui lòng chọn ít nhất một sản phẩm để trả"),
});
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.js src/lib/validations.js
git commit -m "feat: add return request constants and validation schema"
```

---

### Task 12: Frontend — OrderDetail Return UI

**Files:**
- Modify: `src/features/orders/components/OrderDetail.jsx`

- [ ] **Step 1: Add imports**

```javascript
import { RotateCcw, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  useCreateReturnRequestMutation,
  useGetOrderReturnRequestQuery,
} from "@/store/api/ordersApi";
import { returnRequestSchema } from "@/lib/validations";
import { RETURN_REASON_MAP, RETURN_REQUEST_STATUS_MAP, RETURN_REQUEST_STATUS_COLOR } from "@/lib/constants";
```

- [ ] **Step 2: Add state and queries in component**

After existing state declarations:

```javascript
const [returnOpen, setReturnOpen] = useState(false);

const returnForm = useForm({
  resolver: zodResolver(returnRequestSchema),
  defaultValues: { reason: "DEFECTIVE", description: "", items: [] },
});

const [createReturnRequest, { isLoading: isReturning }] = useCreateReturnRequestMutation();

const { data: returnRequestData } = useGetOrderReturnRequestQuery(order.id, {
  skip: !order.id || order.status !== "delivered",
});
const returnRequest = returnRequestData?.data;

const canReturn =
  (order.status || "").toLowerCase() === ORDER_STATUS.DELIVERED &&
  order.deliveredAt &&
  new Date(order.deliveredAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
  (!returnRequest || returnRequest.status === "REJECTED");

const daysLeft = order.deliveredAt
  ? Math.ceil((new Date(order.deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
  : 0;
```

- [ ] **Step 3: Add return button in header (alternative to canCancel/canConfirm)**

Add after the existing `canCancel` button section:

```jsx
{canReturn && (
  <Button
    size="sm"
    variant="destructive"
    className="rounded-full"
    onClick={() => {
      const initialItems = order.items?.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
      })) || [];
      returnForm.reset({ reason: "DEFECTIVE", description: "", items: initialItems });
      setReturnOpen(true);
    }}
  >
    <RotateCcw className="mr-1.5 h-4 w-4" />
    Yêu cầu trả hàng
  </Button>
)}
```

- [ ] **Step 4: Add return status banner (when returnRequest exists and is active)**

After the buttons section:

```jsx
{!canReturn && returnRequest && returnRequest.status !== "REJECTED" && (
  <div
    className={`mt-3 rounded-lg border-l-4 p-3 ${
      returnRequest.status === "PENDING"
        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30"
        : returnRequest.status === "APPROVED"
        ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
        : "border-green-400 bg-green-50 dark:bg-green-950/30"
    }`}
  >
    <p className="text-sm font-medium">
      {returnRequest.status === "PENDING"
        ? "Yêu cầu trả hàng đang được xem xét"
        : returnRequest.status === "APPROVED"
        ? "Đã duyệt, đang xử lý hoàn tiền"
        : "Đã hoàn tiền"}
    </p>
    {returnRequest.status === "PENDING" && (
      <p className="mt-1 text-xs text-muted-foreground">
        Admin sẽ phản hồi trong thời gian sớm nhất
      </p>
    )}
  </div>
)}

{!canReturn && returnRequest && returnRequest.status === "REJECTED" && (
  <div className="mt-3 rounded-lg border-l-4 border-red-400 bg-red-50 dark:bg-red-950/30 p-3">
    <p className="text-sm font-medium text-red-700 dark:text-red-400">
      Yêu cầu trả hàng bị từ chối
    </p>
    {returnRequest.adminNote && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-500">
        {returnRequest.adminNote}
      </p>
    )}
  </div>
)}
```

- [ ] **Step 5: Add days-left subtitle (when canReturn)**

Add below the status badge area, after the date:

```jsx
{canReturn && (
  <p className="mt-1 text-xs text-muted-foreground">
    Bạn còn {daysLeft} ngày để yêu cầu trả hàng (hết hạn {new Date(new Date(order.deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")})
  </p>
)}
```

- [ ] **Step 6: Add return request dialog**

Add at the end, before the closing `</div>`:

```jsx
{/* Return request dialog */}
<ConfirmDialog
  open={returnOpen}
  onOpenChange={(open) => {
    setReturnOpen(open);
    if (!open) returnForm.reset();
  }}
  title="Yêu cầu trả hàng"
  description={
    <Form {...returnForm}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Chọn sản phẩm bạn muốn trả và cung cấp lý do
        </p>

        {/* Select items */}
        <FormField
          control={returnForm.control}
          name="items"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={field.value?.some((i) => i.orderItemId === item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([
                            ...field.value,
                            { orderItemId: item.id, quantity: item.quantity },
                          ]);
                        } else {
                          field.onChange(
                            field.value.filter((i) => i.orderItemId !== item.id)
                          );
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reason select */}
        <FormField
          control={returnForm.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do trả hàng" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RETURN_REASON_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={returnForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Mô tả chi tiết vấn đề gặp phải..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  }
  confirmLabel="Gửi yêu cầu"
  onConfirm={returnForm.handleSubmit(async (values) => {
    try {
      await createReturnRequest({ id: order.id, ...values }).unwrap();
      toast.success("Đã gửi yêu cầu trả hàng");
      returnForm.reset();
      setReturnOpen(false);
    } catch {
      toast.error("Gửi yêu cầu thất bại, vui lòng thử lại");
    }
  })}
  isLoading={isReturning}
/>
```

- [ ] **Step 7: Commit**

```bash
git add src/features/orders/components/OrderDetail.jsx
git commit -m "feat: add return request UI to OrderDetail"
```

---

### Task 13: Frontend — Refund Timeline

**Files:**
- Modify: `src/features/orders/components/OrderTimeline.jsx`

- [ ] **Step 1: Add RefundTimeline component and update routing logic**

Replace the condition that routes to `CancelledTimeline`:

```javascript
const statusKey = (order.status || "").toLowerCase();

// Refund timeline (order was delivered, now refunding/refunded)
if (statusKey === ORDER_STATUS.REFUNDING || statusKey === ORDER_STATUS.REFUNDED) {
  return <RefundTimeline order={order} />;
}

// Cancel timeline (never delivered)
if (statusKey === ORDER_STATUS.CANCELLED) {
  return <CancelledTimeline order={order} />;
}
```

Add the `RefundTimeline` component before the default export:

```javascript
function RefundTimeline({ order }) {
  const steps = TIMELINE_STEPS.map((step) => ({
    status: step,
    timestamp: order.statusHistory?.find((h) => h.status === step)?.createdAt,
    done: true,
  }));

  const isRefunded = (order.status || "").toLowerCase() === ORDER_STATUS.REFUNDED;
  const refundingStep = {
    status: ORDER_STATUS.REFUNDING,
    timestamp: order.statusHistory?.find(
      (h) => h.status === ORDER_STATUS.REFUNDING,
    )?.createdAt,
    done: isRefunded,
    current: !isRefunded,
  };

  const allSteps = [...steps, refundingStep];
  if (isRefunded) {
    allSteps.push({
      status: ORDER_STATUS.REFUNDED,
      timestamp: order.statusHistory?.find(
        (h) => h.status === ORDER_STATUS.REFUNDED,
      )?.createdAt,
      done: true,
      current: true,
    });
  }

  return (
    <div className="space-y-0">
      {allSteps.map((step, index) => {
        const isLast = index === allSteps.length - 1;
        const isDone = step.done && !step.current;
        const isCurrent = step.current;
        const isRefundStep =
          step.status === ORDER_STATUS.REFUNDING ||
          step.status === ORDER_STATUS.REFUNDED;

        return (
          <div key={`${step.status}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isDone &&
                    (isRefundStep
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-green-500 bg-green-500 text-white"),
                  isCurrent &&
                    step.status === ORDER_STATUS.REFUNDING &&
                    "border-pink-500 bg-pink-500 text-white",
                  isCurrent &&
                    step.status === ORDER_STATUS.REFUNDED &&
                    "border-gray-400 bg-gray-400 text-white",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-border" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mt-1 w-0.5 flex-1 min-h-[32px]",
                    isDone ? "bg-green-500" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6 min-w-0 flex-1", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm",
                  isDone && "font-semibold text-green-600 dark:text-green-400",
                  isCurrent &&
                    step.status === ORDER_STATUS.REFUNDING &&
                    "font-semibold text-pink-600 dark:text-pink-400",
                  isCurrent &&
                    step.status === ORDER_STATUS.REFUNDED &&
                    "font-semibold text-gray-600 dark:text-gray-400",
                )}
              >
                {TIMELINE_MAP[step.status] || step.status}
              </p>
              {step.timestamp && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(step.timestamp)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/orders/components/OrderTimeline.jsx
git commit -m "feat: add RefundTimeline for return/refund flow"
```

---

### Task 14: Frontend — Admin Return List Page

**Files:**
- Create: `src/pages/admin/AdminReturnList.jsx`

- [ ] **Step 1: Create the page component**

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllReturnsQuery, useApproveReturnMutation, useRejectReturnMutation } from "@/store/api/ordersApi";
import { RETURN_REQUEST_STATUS_MAP, RETURN_REQUEST_STATUS_COLOR } from "@/lib/constants";
import { RETURN_REASON_MAP } from "@/lib/constants";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X, Eye, Search } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";

const STATUS_FILTERS = [
  { label: "Tất cả", value: "" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Đã hoàn tiền", value: "REFUNDED" },
];

export default function AdminReturnList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading } = useGetAllReturnsQuery({ page, limit: 10, status: statusFilter || undefined, search: search || undefined });
  const [approveReturn, { isLoading: isApproving }] = useApproveReturnMutation();
  const [rejectReturn, { isLoading: isRejecting }] = useRejectReturnMutation();

  const returns = data?.data || [];
  const pagination = data?.pagination;

  const handleApprove = async (id) => {
    try {
      await approveReturn(id).unwrap();
      toast.success("Đã duyệt và xử lý hoàn tiền");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !adminNote.trim()) return;
    try {
      await rejectReturn({ returnId: rejectId, adminNote }).unwrap();
      toast.success("Đã từ chối yêu cầu trả hàng");
      setRejectId(null);
      setAdminNote("");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yêu cầu trả hàng</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý yêu cầu trả hàng và hoàn tiền
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn hàng..."
            className="pl-9 rounded-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 rounded-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã ĐH</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Số tiền trả</TableHead>
              <TableHead>Ngày yêu cầu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không có yêu cầu trả hàng nào
                </TableCell>
              </TableRow>
            ) : (
              returns.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-mono text-sm">
                    #{ret.order?.code || "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{ret.user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{ret.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {RETURN_REASON_MAP[ret.reason] || ret.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(ret.refundAmount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(ret.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge className={RETURN_REQUEST_STATUS_COLOR[ret.status] || ""}>
                      {RETURN_REQUEST_STATUS_MAP[ret.status] || ret.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ret.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(ret.id)}
                            disabled={isApproving}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-destructive hover:text-destructive"
                            onClick={() => setRejectId(ret.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Link to={`/admin/returns/${ret.id}`}>
                        <Button size="sm" variant="ghost" className="h-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Reject dialog */}
      <ConfirmDialog
        open={!!rejectId}
        onOpenChange={(open) => { if (!open) { setRejectId(null); setAdminNote(""); } }}
        title="Từ chối yêu cầu trả hàng"
        description={
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nhập lý do từ chối để gửi cho khách hàng
            </p>
            <Textarea
              placeholder="Lý do từ chối..."
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </div>
        }
        confirmLabel="Xác nhận từ chối"
        onConfirm={handleReject}
        isLoading={isRejecting}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/AdminReturnList.jsx
git commit -m "feat: add admin return requests list page"
```

---

### Task 15: Frontend — Admin Return Detail Page

**Files:**
- Create: `src/pages/admin/AdminReturnDetail.jsx`

- [ ] **Step 1: Create the page component**

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
} from "@/store/api/ordersApi";
import { RETURN_REASON_MAP, RETURN_REQUEST_STATUS_MAP, RETURN_REQUEST_STATUS_COLOR } from "@/lib/constants";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X, Package, MapPin, CreditCard } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import OrderItemRow from "@/features/orders/components/OrderItemRow";

export default function AdminReturnDetail() {
  const { returnId } = useParams();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading } = useGetAdminReturnByIdQuery(returnId);
  const [approveReturn, { isLoading: isApproving }] = useApproveReturnMutation();
  const [rejectReturn, { isLoading: isRejecting }] = useRejectReturnMutation();

  const returnReq = data?.data;
  const order = returnReq?.order;

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>;
  }

  if (!returnReq) {
    return <p className="text-muted-foreground">Không tìm thấy yêu cầu trả hàng</p>;
  }

  const shippingFee = order.shippingFee ?? 0;
  const discountAmount = order.discountAmount ?? 0;

  const handleApprove = async () => {
    try {
      await approveReturn(returnReq.id).unwrap();
      toast.success("Đã duyệt và xử lý hoàn tiền");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) return;
    try {
      await rejectReturn({ returnId: returnReq.id, adminNote }).unwrap();
      toast.success("Đã từ chối yêu cầu trả hàng");
      setRejectOpen(false);
      setAdminNote("");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 md:p-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Yêu cầu trả hàng #{returnReq.id.slice(0, 8)}
            </h2>
            <Badge className={RETURN_REQUEST_STATUS_COLOR[returnReq.status]}>
              {RETURN_REQUEST_STATUS_MAP[returnReq.status]}
            </Badge>
            <Badge variant="outline">
              {RETURN_REASON_MAP[returnReq.reason]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Đơn hàng: <span className="font-mono font-medium text-foreground">#{order.code}</span>
            {" — "}Ngày yêu cầu: {formatDateTime(returnReq.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {returnReq.status === "PENDING" && (
            <>
              <Button
                size="sm"
                className="rounded-full bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={isApproving}
              >
                <Check className="mr-1.5 h-4 w-4" />
                {isApproving ? "Đang xử lý..." : "Duyệt & Hoàn tiền"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full"
                onClick={() => setRejectOpen(true)}
              >
                <X className="mr-1.5 h-4 w-4" />
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Returned items */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                Sản phẩm yêu cầu trả ({returnReq.items?.length || 0})
              </h3>
            </div>

            <div className="space-y-4">
              {returnReq.items?.map((ri) => {
                const oi = ri.orderItem;
                if (!oi) return null;
                return (
                  <div key={ri.id}>
                    <div className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-1.5">
                        <img
                          src={oi.variant?.images?.[0] || oi.variant?.product?.images?.[0] || ""}
                          alt={oi.variant?.product?.name || ""}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {oi.variant?.product?.name || "Sản phẩm"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[oi.variant?.color, oi.variant?.storage].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-sm">
                            {formatPrice(ri.refundUnitPrice)} x {ri.quantity}
                          </span>
                          <span className="text-sm font-medium">
                            {formatPrice(ri.refundUnitPrice * ri.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>

            <div className="mt-2 text-right">
              <span className="text-sm text-muted-foreground">Tổng hoàn: </span>
              <span className="text-lg font-bold text-destructive">
                {formatPrice(returnReq.refundAmount)}
              </span>
            </div>
          </div>

          {/* Description + images */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">Mô tả của khách hàng</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {returnReq.description || "Không có mô tả"}
            </p>
            {returnReq.images?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {returnReq.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Ảnh ${i + 1}`}
                    className="h-20 w-20 rounded-lg object-cover border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Admin note (if rejected) */}
          {returnReq.adminNote && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Ghi chú của admin</h3>
              <p className="text-sm text-muted-foreground">{returnReq.adminNote}</p>
            </div>
          )}

          {/* Refund transaction */}
          {returnReq.refundTransactionId && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Thông tin hoàn tiền</h3>
              <p className="text-sm font-mono text-muted-foreground">
                {returnReq.refundTransactionId === "manual"
                  ? "Hoàn tiền thủ công (chuyển khoản)"
                  : `Mã GD: ${returnReq.refundTransactionId}`}
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Order info */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-medium text-foreground">Thông tin đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã ĐH</span>
                <span className="font-mono">{order.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <Badge variant="outline" className="text-xs">{order.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng đơn</span>
                <PriceDisplay price={order.totalAmount} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thanh toán</span>
                <span>{order.paymentMethod === "MOMO" ? "MoMo" : "COD"}</span>
              </div>
              {order.isPaid && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã thanh toán</span>
                  <span className="text-green-600 font-medium">Có</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer info */}
          {order.user && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-medium text-foreground">Khách hàng</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.user.fullName}</p>
                <p className="text-muted-foreground">{order.user.email}</p>
              </div>
            </div>
          )}

          {/* Shipping info */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Địa chỉ giao hàng</h3>
            </div>
            <div className="space-y-0.5 text-sm">
              <p className="font-medium">{order.shippingFullName}</p>
              <p className="text-muted-foreground">{order.shippingPhone}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reject dialog */}
      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={(open) => { if (!open) { setRejectOpen(false); setAdminNote(""); } }}
        title="Từ chối yêu cầu trả hàng"
        description={
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nhập lý do từ chối, email sẽ được gửi đến khách hàng
            </p>
            <Textarea
              placeholder="Lý do từ chối..."
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </div>
        }
        confirmLabel="Xác nhận từ chối"
        onConfirm={handleReject}
        isLoading={isRejecting}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/AdminReturnDetail.jsx
git commit -m "feat: add admin return request detail page"
```

---

### Task 16: Frontend — Routes & Admin Navigation

**Files:**
- Modify: `src/routes.jsx`
- Modify: `src/components/layout/AdminLayout.jsx`

- [ ] **Step 1: Add routes**

In `src/routes.jsx`, import the new pages:

```javascript
import AdminReturnList from "@/pages/admin/AdminReturnList";
import AdminReturnDetail from "@/pages/admin/AdminReturnDetail";
```

Add routes inside the admin section (after admin order routes):

```jsx
{
  path: "returns",
  element: <AdminReturnList />,
},
{
  path: "returns/:returnId",
  element: <AdminReturnDetail />,
},
```

- [ ] **Step 2: Add sidebar link**

In `src/components/layout/AdminLayout.jsx`, find the Orders section in the sidebar navigation and add a child link:

```jsx
<Link
  to="/admin/returns"
  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
>
  <RotateCcw className="h-4 w-4" />
  Yêu cầu trả hàng
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/routes.jsx src/components/layout/AdminLayout.jsx
git commit -m "feat: add return request routes and admin sidebar link"
```

---

### Task 17: Backend — Include ReturnRequest in getOrderById

**Files:**
- Modify: `src/services/order.service.js`

- [ ] **Step 1: Update getOrderById to include latest ReturnRequest**

In the `getOrderById` function, add `returnRequests` to the `include` block of the `prisma.order.findFirst` call, taking only the latest one:

```javascript
const order = await prisma.order.findFirst({
  where,
  include: {
    items: { /* existing include */ },
    statusHistory: { orderBy: { createdAt: "asc" } },
    coupon: { select: { code: true, discountType: true, discountValue: true } },
    user: { select: { fullName: true, email: true } },
    returnRequests: {
      orderBy: { createdAt: "desc" },
      take: 1,
      include: { items: true },
    },
  },
});

// Map the first returnRequest to a flat field for easier frontend access
if (order.returnRequests?.length > 0) {
  order.returnRequest = order.returnRequests[0];
}
delete order.returnRequests;
```

Also update the admin version of `getOrderById` (when `userId` is not passed) with the same include.

- [ ] **Step 2: Commit**

```bash
git add src/services/order.service.js
git commit -m "feat: include latest returnRequest in order detail response"
```

---

### Task 18: Integration Verification

- [ ] **Step 1: Verify backend compiles**

```bash
node -e "require('./src/app')" && echo "OK"
```

- [ ] **Step 2: Verify frontend builds**

```bash
npm run build
```

- [ ] **Step 3: Manual test flow**

1. Create a test order → admin set SHIPPING → user confirm DELIVERED
2. User visits `/profile/orders/:id` → sees "Yêu cầu trả hàng" button
3. Click → select item + reason → submit → PENDING banner appears
4. Admin visits `/admin/returns` → sees request → click approve
5. Verify: stock restored, points deducted, order status = REFUNDING/REFUNDED
6. Test reject flow: user sees rejection reason

- [ ] **Step 4: Commit any fixes**

```bash
git add . && git commit -m "fix: integration fixes for return/refund flow"
```
