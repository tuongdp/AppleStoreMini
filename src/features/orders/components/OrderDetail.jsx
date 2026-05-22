import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, MapPin, CreditCard, FileText, RotateCcw } from "lucide-react";
import VATInvoiceDialog from "@/components/shared/VATInvoiceDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";
import OrderItemRow from "./OrderItemRow";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import {
    useCancelOrderMutation,
    useConfirmDeliveredMutation,
    useCreateReturnRequestMutation,
    useGetOrderReturnRequestQuery,
} from "@/store/api/ordersApi";
import { cancelOrderSchema, returnRequestSchema } from "@/lib/validations";
import { toast } from "sonner";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import { ORDER_STATUS, RETURN_REASON_MAP } from "@/lib/constants";

const PAYMENT_MAP = {
  "cod": "Thanh toán khi nhận hàng",
  "momo": "MoMo",
  "paid": "Đã thanh toán",
  "refunded": "Đã hoàn tiền",
  "unknown": "Không xác định",
  "unpaid": "Chưa thanh toán"
};
export default function OrderDetail({ order }) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [returnOpen, setReturnOpen] = useState(false);
    const [vatDialogOpen, setVatDialogOpen] = useState(false);

    const returnForm = useForm({
        resolver: zodResolver(returnRequestSchema),
        defaultValues: { reason: "DEFECTIVE", description: "", items: [] },
    });

    const [createReturnRequest, { isLoading: isReturning }] = useCreateReturnRequestMutation();

    const { data: returnRequestData } = useGetOrderReturnRequestQuery(order.id, {
        skip: !order.id || (order.status || "").toLowerCase() !== "delivered",
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

    const cancelForm = useForm({
        resolver: zodResolver(cancelOrderSchema),
        defaultValues: { reason: "" },
    });

    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [confirmDelivered, { isLoading: isConfirming }] =
        useConfirmDeliveredMutation();

    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
        (order.status || "").toLowerCase(),
    );
    const canConfirm = (order.status || "").toLowerCase() === ORDER_STATUS.SHIPPING;

    const shippingInfo = {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        address: order.shippingAddress,
    };

    const shippingFee = order.shippingFee ?? 0;
    const discountAmount = order.discountAmount ?? 0;

    const handleCancel = async (values) => {
        try {
            await cancelOrder({ id: order.id, reason: values.reason }).unwrap();
            toast.success("Đã huỷ đơn hàng thành công");
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

    const handleConfirmDelivered = async () => {
        try {
            await confirmDelivered(order.id).unwrap();
            toast.success("Xác nhận nhận hàng thành công");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header card */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold text-foreground">
                                #{order.code}
                            </h2>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {"Ngày đặt hàng"}:{" "}
                            {formatDateTime(order.createdAt)}
                        </p>
                        {canReturn && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Bạn còn {daysLeft} ngày để yêu cầu trả hàng (hết hạn {order.deliveredAt ? new Date(new Date(order.deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN") : ""})
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {canConfirm && (
                            <Button
                                size="sm"
                                className="rounded-full"
                                onClick={handleConfirmDelivered}
                                disabled={isConfirming}
                            >
                                {isConfirming
                                    ? "Đang tải..."
                                    : "Xác nhận đã nhận hàng"}
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-destructive hover:text-destructive"
                                onClick={() => setCancelOpen(true)}
                            >
                                {"Huỷ đơn hàng"}
                            </Button>
                        )}
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
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setVatDialogOpen(true)}
                        >
                            Xuất hóa đơn GTGT
                        </Button>
                    </div>
                </div>
                {!canReturn && returnRequest && returnRequest.status !== "REJECTED" && returnRequest.status !== undefined && (
                    <div className={`mt-3 rounded-lg border-l-4 p-3 ${
                        returnRequest.status === "PENDING"
                            ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30"
                            : returnRequest.status === "APPROVED"
                            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                            : "border-green-400 bg-green-50 dark:bg-green-950/30"
                    }`}>
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
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* ── Left column ── */}
                <div className="space-y-4 lg:col-span-2">
                    {/* Order items */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">
                                {"Sản phẩm đã đặt"}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {order.items?.map((item, index) => (
                                <OrderItemRow
                                    key={index}
                                    item={item}
                                    isLast={index === order.items.length - 1}
                                />
                            ))}
                        </div>

                        <Separator className="my-4" />

                        {/* Totals */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {"Tạm tính"}
                                </span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {"Phí vận chuyển"}
                                </span>
                                <span>
                                    {shippingFee === 0
                                        ? "Miễn phí"
                                        : formatPrice(shippingFee)}
                                </span>
                            </div>
                            {/* ✅ dùng discountAmount theo BE schema */}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>
                                        {"Giảm giá"}
                                        {order.couponCode && (
                                            <code className="ml-1 text-xs">
                                                ({order.couponCode})
                                            </code>
                                        )}
                                    </span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex items-center justify-between font-semibold">
                                <span>{"Tổng cộng"}</span>
                                <PriceDisplay
                                    price={order.totalAmount}
                                    size="md"
                                 />
                            </div>
                        </div>
                    </div>

                    {/* ✅ Shipping address — dùng flat fields từ BE */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">
                                {"Địa chỉ giao hàng"}
                            </h3>
                        </div>
                        <div className="space-y-0.5 text-sm">
                            <p className="font-medium text-foreground">
                                {shippingInfo.fullName}
                            </p>
                            <p className="text-muted-foreground">
                                {formatPhone(shippingInfo.phone)}
                            </p>
                            <p className="text-muted-foreground">
                                {shippingInfo.address}
                            </p>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">
                                {"Phương thức thanh toán"}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">
                                {order.paymentMethod
                                    ? (PAYMENT_MAP[order.paymentMethod] || order.paymentMethod)
                                    : "Không xác định"}
                            </span>
                            <span
                                className={
                                    order.isPaid
                                        ? "font-medium text-green-600 dark:text-green-400"
                                        : "text-muted-foreground"
                                }
                            >
                                {order.isPaid
                                    ? "Đã thanh toán"
                                    : "Chưa thanh toán"}
                            </span>
                        </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <div className="mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium text-foreground">
                                    {"Ghi chú"}
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {order.note}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Right column — Timeline ── */}
                <div>
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-5 text-sm font-medium text-foreground">
                            {"Trạng thái"}
                        </h3>
                        <OrderTimeline order={order} />
                    </div>
                </div>
            </div>

            {/* Cancel dialog */}
            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={handleCancelOpen}
                title={"Huỷ đơn hàng"}
                description={
                    <Form {...cancelForm}>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {"Bạn có chắc chắn muốn huỷ đơn hàng này không?"}
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
                    </Form>
                }
                confirmLabel={"Xác nhận huỷ"}
                onConfirm={cancelForm.handleSubmit(handleCancel)}
                isLoading={isCancelling}
            />

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

                            <FormField
                                control={returnForm.control}
                                name="items"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="space-y-2">
                                            {order.items?.map((item) => (
                                                <label
                                                    key={item.id || item._id}
                                                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                                                >
                                                    <Checkbox
                                                        checked={field.value?.some((i) => i.orderItemId === (item.id || item._id))}
                                                        onCheckedChange={(checked) => {
                                                            const itemId = item.id || item._id;
                                                            if (checked) {
                                                                field.onChange([
                                                                    ...field.value,
                                                                    { orderItemId: itemId, quantity: item.quantity || 1 },
                                                                ]);
                                                            } else {
                                                                field.onChange(
                                                                    field.value.filter((i) => i.orderItemId !== itemId)
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatPrice(item.price)} x {item.quantity || 1}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
            <VATInvoiceDialog
                open={vatDialogOpen}
                onClose={() => setVatDialogOpen(false)}
                order={order}
            />
        </div>
    );
}
