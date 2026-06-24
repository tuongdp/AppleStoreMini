import { useState } from "react";
import { ChevronLeft, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, AlertTriangle } from "lucide-react";
import { useUpdateOrderStatusMutation, useCancelOrderByAdminMutation } from "@/store/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatPrice, formatDateTime, parseJsonField, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const STATUS_COLOR = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPING: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_LABEL = {
    PENDING: "Chờ duyệt",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
};

const ALL_STATUSES = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetail({ order }) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [confirmStatus, setConfirmStatus] = useState(null);
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderByAdminMutation();

    if (!order) return null;

    const oid = order.id || order._id;
    const items = order.items || [];
    const user = order.user || {};
    const shippingName = order.shippingFullName || user.fullName || "";
    const shippingPhone = order.shippingPhone || user.phone || "";
    const address = order.shippingAddress || user.address || "";

    const handleStatusChange = async (status) => {
        if (status === "CONFIRMED" || status === "SHIPPING") {
            const outOfStock = items.filter((item) => {
                const variant = item.variant || {};
                return variant.stock != null && variant.stock <= 0;
            });
            if (outOfStock.length > 0) {
                setConfirmStatus(status);
                return;
            }
        }
        await doUpdateStatus(status);
    };

    const doUpdateStatus = async (status) => {
        try {
            await updateStatus({ id: oid, status }).unwrap();
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleCancel = async () => {
        try {
            await cancelOrder({ id: oid, reason: "Admin huỷ" }).unwrap();
            setCancelOpen(false);
            toast.success("Đã huỷ đơn hàng");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">#{order.code}</h2>
                    <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                    {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                        <>
                            <Select value={order.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                                <SelectTrigger className="w-40 rounded-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_STATUSES.filter((s) => s !== "CANCELLED").map((s) => (
                                        <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="destructive" size="sm" className="rounded-full" onClick={() => setCancelOpen(true)} disabled={isCancelling}>
                                <XCircle className="mr-1 h-4 w-4" />Huỷ đơn
                            </Button>
                        </>
                    )}
                    <Badge className={cn("text-sm px-3 py-1", STATUS_COLOR[order.status] || "")}>
                        {STATUS_LABEL[order.status] || order.status}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader><CardTitle className="text-sm font-medium">Sản phẩm ({items.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {items.map((item) => {
                                const variant = item.variant || {};
                                const product = variant.product || {};
                                const images = parseJsonField(variant.images);
                                const img = Array.isArray(images) ? images[0] : null;
                                return (
                                    <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted/30 p-1">
                                            {img ? <img src={img} alt="" className="h-full w-full object-contain" /> : <div className="h-full w-full bg-muted/50 rounded" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{product.name || "Sản phẩm"}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {[variant.color, variant.storage, variant.size].filter(Boolean).join(" · ") || "—"}
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-sm">
                                                <span className="font-medium">{formatPrice(item.price)}</span>
                                                <span className="text-muted-foreground">x{item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-sm font-medium">Khách hàng</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{user.fullName || "—"}</span>
                            </div>
                            {user.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                            )}
                            {user.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {address && (
                        <Card>
                            <CardHeader><CardTitle className="text-sm font-medium">Địa chỉ giao hàng</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {shippingName && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{shippingName}</span>
                                    </div>
                                )}
                                {shippingPhone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{shippingPhone}</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <span>{address}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader><CardTitle className="text-sm font-medium">Thanh toán</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Phương thức</span>
                                <Badge variant="secondary">{order.paymentMethod}</Badge>
                            </div>
                            {order.coupon && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Mã giảm giá</span>
                                    <Badge variant="outline">{order.coupon.code}</Badge>
                                </div>
                            )}
                            {Number(order.discountAmount) > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Giảm giá</span>
                                    <span className="text-green-600 font-medium">-{formatPrice(order.discountAmount)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex items-center justify-between text-sm font-semibold">
                                <span>Tổng tiền</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {order.isPaid ? (
                                    <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-600">Đã thanh toán</span></>
                                ) : (
                                    <><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Chưa thanh toán</span></>
                                )}
                            </div>
                            {order.note && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span>Ghi chú: {order.note}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmDialog open={cancelOpen} onOpenChange={setCancelOpen} title="Huỷ đơn hàng?" description="Hành động này không thể hoàn tác." onConfirm={handleCancel} isLoading={isCancelling} />

            <ConfirmDialog
                open={!!confirmStatus}
                onOpenChange={(open) => { if (!open) setConfirmStatus(null); }}
                title="Cảnh báo tồn kho"
                description={`Có sản phẩm trong đơn đã hết hàng (tồn kho = 0). Bạn có chắc muốn tiếp tục?`}
                confirmLabel="Vẫn xác nhận"
                variant="destructive"
                onConfirm={() => {
                    const status = confirmStatus;
                    setConfirmStatus(null);
                    doUpdateStatus(status);
                }}
            />
        </div>
    );
}
