import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, MapPin, CreditCard, FileText } from "lucide-react";
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
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";
import OrderItemRow from "./OrderItemRow";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import {
    useCancelOrderMutation,
    useConfirmDeliveredMutation,
} from "@/store/api/ordersApi";
import { cancelOrderSchema } from "@/lib/validations";
import { toast } from "sonner";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

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

    const cancelForm = useForm({
        resolver: zodResolver(cancelOrderSchema),
        defaultValues: { reason: "" },
    });

    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [confirmDelivered, { isLoading: isConfirming }] =
        useConfirmDeliveredMutation();

    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
        order.status,
    );
    const canConfirm = order.status === ORDER_STATUS.SHIPPING;

    const shippingInfo = {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        address: order.shippingAddress,
        ward: order.shippingWard,
        district: order.shippingDistrict,
        province: order.shippingProvince,
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
                    </div>
                </div>
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
                                {shippingInfo.address}, {shippingInfo.ward},{" "}
                                {shippingInfo.district}, {shippingInfo.province}
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
                }
                confirmLabel={"Xác nhận huỷ"}
                onConfirm={cancelForm.handleSubmit(handleCancel)}
                isLoading={isCancelling}
            />
        </div>
    );
}
