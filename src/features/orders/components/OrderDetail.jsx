import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, MapPin, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";
import OrderItemRow from "./OrderItemRow";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import {
    useCancelOrderMutation,
    useConfirmDeliveredMutation,
} from "@/store/api/ordersApi";
import { toast } from "sonner";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

export default function OrderDetail({ order }) {
    const { t } = useTranslation("order");
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [confirmDelivered, { isLoading: isConfirming }] =
        useConfirmDeliveredMutation();

    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(
        order.status,
    );
    const canConfirm = order.status === ORDER_STATUS.SHIPPING;

    // ✅ BE lưu shipping address dưới dạng flat fields (không phải object lồng nhau)
    // order.shippingFullName, order.shippingPhone, order.shippingAddress,
    // order.shippingWard, order.shippingDistrict, order.shippingProvince
    const shippingInfo = {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        address: order.shippingAddress,
        ward: order.shippingWard,
        district: order.shippingDistrict,
        province: order.shippingProvince,
    };

    // ✅ BE dùng discountAmount (không phải discount)
    const shippingFee = order.shippingFee ?? 0;
    const discountAmount = order.discountAmount ?? 0;

    const handleCancel = async () => {
        try {
            // ✅ MySQL id là integer, không có _id
            await cancelOrder({ id: order.id, reason: cancelReason }).unwrap();
            toast.success(t("toast.cancelSuccess"));
            setCancelReason("");
            setCancelOpen(false);
        } catch {
            toast.error(t("toast.cancelFailed"));
        }
    };

    const handleConfirmDelivered = async () => {
        try {
            await confirmDelivered(order.id).unwrap();
            toast.success(t("toast.confirmSuccess"));
        } catch {
            toast.error(t("status.error", { ns: "common" }));
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
                            {t("detail.orderDate")}:{" "}
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
                                    ? t("status.loading", { ns: "common" })
                                    : t("action.confirmDelivered")}
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-destructive hover:text-destructive"
                                onClick={() => setCancelOpen(true)}
                            >
                                {t("action.cancel")}
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
                                {t("detail.orderItems")}
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
                                    {t("detail.subtotal")}
                                </span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t("detail.shipping")}
                                </span>
                                <span>
                                    {shippingFee === 0
                                        ? t("detail.freeShipping")
                                        : formatPrice(shippingFee)}
                                </span>
                            </div>
                            {/* ✅ dùng discountAmount theo BE schema */}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>
                                        {t("detail.discount")}
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
                                <span>{t("detail.grandTotal")}</span>
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
                                {t("detail.shippingAddress")}
                            </h3>
                        </div>
                        <div className="space-y-0.5 text-sm">
                            <p className="font-medium text-foreground">
                                {shippingInfo.fullName}
                            </p>
                            <p className="text-muted-foreground">
                                {shippingInfo.phone}
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
                                {t("detail.paymentMethod")}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">
                                {order.paymentMethod
                                    ? t(`payment.${order.paymentMethod}`)
                                    : t("payment.unknown", {
                                          defaultValue: "Không xác định",
                                      })}
                            </span>
                            <span
                                className={
                                    order.isPaid
                                        ? "font-medium text-green-600 dark:text-green-400"
                                        : "text-muted-foreground"
                                }
                            >
                                {order.isPaid
                                    ? t("payment.paid")
                                    : t("payment.unpaid")}
                            </span>
                        </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <div className="mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium text-foreground">
                                    {t("detail.note")}
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
                            {t("detail.orderStatus")}
                        </h3>
                        <OrderTimeline order={order} />
                    </div>
                </div>
            </div>

            {/* Cancel dialog */}
            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                title={t("action.cancel")}
                description={
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {t("confirm.cancelOrder", { ns: "common" })}
                        </p>
                        <Textarea
                            placeholder={t("action.cancelReasonPlaceholder")}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                }
                confirmLabel={t("action.confirmCancel")}
                onConfirm={handleCancel}
                isLoading={isCancelling}
            />
        </div>
    );
}
