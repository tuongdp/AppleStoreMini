import { useTranslation } from "@/i18n/useTranslation";
import { Package, MapPin, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import OrderTimeline from "@/features/orders/components/OrderTimeline";
import OrderItemRow from "@/features/orders/components/OrderItemRow";
import AdminOrderStatusUpdate from "./AdminOrderStatusUpdate";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { formatPrice, formatDateTime } from "@/lib/utils";

export default function AdminOrderDetail({ order }) {
    const { t } = useTranslation("admin");

    // ✅ BE lưu shipping address dưới dạng flat fields (giống OrderDetail user)
    const shippingInfo = {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        address: order.shippingAddress,
        ward: order.shippingWard,
        district: order.shippingDistrict,
        province: order.shippingProvince,
    };

    // ✅ BE dùng discountAmount (không phải discount)
    const shippingFee = order?.shippingFee ?? 0;
    const discountAmount = order?.discountAmount ?? 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 md:p-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-foreground">
                            #{order.code}
                        </h2>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                    </p>
                </div>

                {/* ✅ MySQL integer id */}
                <AdminOrderStatusUpdate
                    orderId={order.id}
                    currentStatus={order.status}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* ── Left ── */}
                <div className="space-y-4 lg:col-span-2">
                    {/* Items */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">
                                {t("order.orderCode")} —{" "}
                                {order.items?.length ?? 0}{" "}
                                {t("item.quantity", { ns: "cart" })}
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

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t("detail.subtotal", { ns: "order" })}
                                </span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t("detail.shipping", { ns: "order" })}
                                </span>
                                <span>
                                    {shippingFee === 0
                                        ? t("detail.freeShipping", {
                                              ns: "order",
                                          })
                                        : formatPrice(shippingFee)}
                                </span>
                            </div>
                            {/* ✅ dùng discountAmount + hiện couponCode nếu có */}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>
                                        {t("detail.discount", { ns: "order" })}
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
                                <span>
                                    {t("detail.grandTotal", { ns: "order" })}
                                </span>
                                <PriceDisplay
                                    price={order.totalAmount}
                                    size="md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customer + Shipping */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="mb-3 text-sm font-medium text-foreground">
                                {t("order.customer")}
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p className="font-medium text-foreground">
                                    {order.user?.fullName}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.user?.email}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.user?.phone}
                                </p>
                            </div>
                        </div>

                        {/* ✅ Dùng flat fields từ BE */}
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium text-foreground">
                                    {t("detail.shippingAddress", {
                                        ns: "order",
                                    })}
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
                                    {shippingInfo.district},{" "}
                                    {shippingInfo.province}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">
                                {t("detail.paymentMethod", { ns: "order" })}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">
                                {t(`payment.${order.paymentMethod}`, {
                                    ns: "order",
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
                                    ? t("payment.paid", { ns: "order" })
                                    : t("payment.unpaid", { ns: "order" })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Right — Timeline ── */}
                <div>
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-5 text-sm font-medium text-foreground">
                            {t("detail.orderStatus", { ns: "order" })}
                        </h3>
                        <OrderTimeline order={order} />
                    </div>
                </div>
            </div>
        </div>
    );
}
