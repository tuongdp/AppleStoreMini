# Cancel Order for Admin & User Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cancel order functionality for admin (with email notification) and extend user cancel to include PROCESSING status.

**Architecture:** Reuse existing cancel pattern from user OrderDetail. Admin gets a dedicated cancel button with reason dialog calling a new API endpoint. User cancel condition simply extended.

**Tech Stack:** React, Redux Toolkit Query, react-hook-form, zod, shadcn/ui

---

### Task 1: Add `cancelOrderByAdmin` API mutation

**Files:**
- Modify: `src/store/api/ordersApi.js:46-47`

- [ ] **Step 1: Add mutation after `cancelOrder`**

After line 47 (`});` closing `cancelOrder`), insert:

```js

        // POST /admin/orders/:id/cancel — admin huỷ + gửi email cho user
        cancelOrderByAdmin: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/admin/orders/${id}/cancel`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Orders", "Order"],
        }),
```

- [ ] **Step 2: Export the hook**

In the exports block at the bottom (after `useCancelOrderMutation` on line 135), add:

```js
    useCancelOrderByAdminMutation,
```

- [ ] **Step 3: Commit**

```bash
git add src/store/api/ordersApi.js
git commit -m "feat: add cancelOrderByAdmin API mutation"
```

---

### Task 2: Extend user cancel to include PROCESSING status

**Files:**
- Modify: `src/features/orders/components/OrderDetail.jsx:49-51`

- [ ] **Step 1: Add PROCESSING to canCancel**

Change line 49 from:

```js
    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(
        order.status,
    );
```

To:

```js
    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
        order.status,
    );
```

- [ ] **Step 2: Commit**

```bash
git add src/features/orders/components/OrderDetail.jsx
git commit -m "feat: extend user cancel to include PROCESSING status"
```

---

### Task 3: Add admin cancel button with reason dialog

**Files:**
- Modify: `src/features/admin/components/orders/AdminOrderDetail.jsx:1-17 (imports)`
- Modify: `src/features/admin/components/orders/AdminOrderDetail.jsx:18-32 (component body)`
- Modify: `src/features/admin/components/orders/AdminOrderDetail.jsx:48-54 (header buttons area)`

- [ ] **Step 1: Add new imports**

Replace the import block (lines 1-8) with:

```js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, MapPin, CreditCard, StickyNote, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import OrderTimeline from "@/features/orders/components/OrderTimeline";
import OrderItemRow from "@/features/orders/components/OrderItemRow";
import AdminOrderStatusUpdate from "./AdminOrderStatusUpdate";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useCancelOrderByAdminMutation } from "@/store/api/ordersApi";
import { cancelOrderSchema } from "@/lib/validations";
import { toast } from "sonner";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
```

- [ ] **Step 2: Add state and hooks inside component**

After line 31 (`const discountAmount = order?.discountAmount ?? 0;`), insert:

```js
    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
        order.status,
    );

    const [cancelOpen, setCancelOpen] = useState(false);

    const cancelForm = useForm({
        resolver: zodResolver(cancelOrderSchema),
        defaultValues: { reason: "" },
    });

    const [cancelOrderByAdmin, { isLoading: isCancelling }] = useCancelOrderByAdminMutation();

    const handleCancel = async (values) => {
        try {
            await cancelOrderByAdmin({ id: order.id, reason: values.reason }).unwrap();
            toast.success("Đã huỷ đơn hàng và gửi email thông báo cho khách hàng");
            cancelForm.reset();
            setCancelOpen(false);
        } catch {
            toast.error("Huỷ đơn hàng thất bại, vui lòng thử lại");
        }
    };

    const handleCancelOpen = (open) => {
        setCancelOpen(open);
        if (!open) cancelForm.reset();
    };
```

- [ ] **Step 3: Add cancel button next to status dropdown**

Replace lines 48-53 (the `AdminOrderStatusUpdate` and closing tags):

```js
                <div className="flex items-center gap-2">
                    {canCancel && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-destructive hover:text-destructive"
                            onClick={() => setCancelOpen(true)}
                        >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            {"Huỷ đơn hàng"}
                        </Button>
                    )}
                    <AdminOrderStatusUpdate
                        orderId={order.id}
                        currentStatus={order.status}
                    />
                </div>
```

- [ ] **Step 4: Add cancel dialog before closing `</div>` of component**

Before line 221 (`</div>` final closing of the outer div), insert:

```js

            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={handleCancelOpen}
                title={"Huỷ đơn hàng"}
                description={
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {"Bạn có chắc chắn muốn huỷ đơn hàng này? Email thông báo sẽ được gửi đến khách hàng."}
                        </p>
                        <FormField
                            control={cancelForm.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder={"Nhập lý do huỷ đơn hàng"}
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                }
                confirmLabel={"Xác nhận huỷ"}
                onConfirm={cancelForm.handleSubmit(handleCancel)}
                isLoading={isCancelling}
            />
```

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/orders/AdminOrderDetail.jsx
git commit -m "feat: add admin cancel order button with reason dialog and email notification"
```
