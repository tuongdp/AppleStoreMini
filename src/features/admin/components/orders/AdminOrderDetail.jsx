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
import { useApproveReturnMutation, useRejectReturnMutation } from "@/store/api/ordersApi";
import { cancelOrderSchema } from "@/lib/validations";
import { toast } from "sonner";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import { ORDER_STATUS, RETURN_REQUEST_STATUS } from "@/lib/constants";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExportButton from "@/components/ui/export-button";
import VATInvoiceDialog from "@/components/shared/VATInvoiceDialog";

const PAYMENT_MAP = {
  "cod": "Thanh toán khi nhận hàng",
  "vnpay": "VNPay",
  "paid": "Đã thanh toán",
  "refunded": "Đã hoàn tiền",
  "unknown": "Không xác định",
  "unpaid": "Chưa thanh toán"
};
export default function AdminOrderDetail({ order }) {
    const returnRequest = order.returnRequest || order.returnRequests?.[0];

    const [approveReturn, { isLoading: isApproving }] = useApproveReturnMutation();
    const [rejectReturn, { isLoading: isRejecting }] = useRejectReturnMutation();

    const handleApprove = async () => {
        try {
            await approveReturn(returnRequest.id).unwrap();
            toast.success("Đã duyệt trả hàng và hoàn tiền");
        } catch {
            toast.error("Duyệt trả hàng thất bại");
        }
    };

    const handleReject = async () => {
        try {
            await rejectReturn({ returnId: returnRequest.id, adminNote: "" }).unwrap();
            toast.success("Đã từ chối yêu cầu trả hàng");
        } catch {
            toast.error("Từ chối thất bại");
        }
    };

    const handleExportOrderPDF = () => {
        if (!order) return;
        setIsExportingPDF(true);
        try {
            const items = order.items || [];
            const STATUS_LABELS = {
                pending: "Chờ xác nhận", confirmed: "Đã xác nhận", processing: "Đang xử lý",
                shipping: "Đang giao hàng", delivered: "Đã giao hàng", cancelled: "Đã huỷ",
                refunding: "Đang hoàn tiền", refunded: "Đã hoàn tiền",
            };
            const PAYMENT_LABELS = {
                cod: "COD", COD: "COD", vnpay: "VNPay", VNPAY: "VNPay",
            };

            const itemColumns = [
                { key: "name", label: "Sản phẩm" },
                { key: "variant", label: "Biến thể" },
                { key: "quantity", label: "SL" },
                { key: "price", label: "Đơn giá", format: "currency" },
                { key: "total", label: "Thành tiền", format: "currency" },
            ];

            const itemRows = items.map((it) => {
                const variantParts = [it.color, it.storage, it.ram].filter(Boolean);
                return {
                    name: it.name || "—",
                    variant: variantParts.length > 0 ? variantParts.join(" / ") : "—",
                    quantity: it.quantity,
                    price: it.price || 0,
                    total: (it.price || 0) * (it.quantity || 0),
                };
            });

            const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const pw = doc.internal.pageSize.getWidth();
            const m = 15;
            let y = 12;

            doc.setFontSize(9); doc.setTextColor(128);
            doc.text("AppleStore Mini", m, y);
            doc.text(new Date().toLocaleDateString("vi-VN"), pw - m, y, { align: "right" });
            y += 10;

            doc.setFontSize(16); doc.setTextColor(30, 64, 175);
            doc.text(`Đơn hàng #${order.code}`, pw / 2, y, { align: "center" });
            y += 8;

            doc.setFontSize(10); doc.setTextColor(80);
            doc.text(`Khách hàng: ${order.user?.fullName || "\u2014"}`, m, y); y += 5;
            doc.text(`Email: ${order.user?.email || "\u2014"}`, m, y); y += 5;
            doc.text(`SĐT: ${order.user?.phone || "\u2014"}`, m, y); y += 5;
            doc.text(`Ngày đặt: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`, m, y); y += 5;
            doc.text(`Trạng thái: ${STATUS_LABELS[order.status?.toLowerCase()] || order.status}`, m, y); y += 5;
            doc.text(`Thanh toán: ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "\u2014"}${order.isPaid ? " (Đã TT)" : " (Chưa TT)"}`, m, y);
            y += 10;

            if (order.shippingAddress || order.address) {
                const addr = order.shippingAddress || order.address;
                doc.setFontSize(10); doc.setTextColor(80);
                doc.text(`Địa chỉ giao: ${typeof addr === "string" ? addr : [addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}`, m, y);
                y += 8;
            }

            autoTable(doc, {
                startY: y, margin: { left: m, right: m },
                head: [itemColumns.map((c) => c.label)],
                body: itemRows.map((r) => itemColumns.map((c) => {
                    const v = r[c.key];
                    return c.format === "currency" ? Number(v).toLocaleString("vi-VN") + " đ" : (v ?? "\u2014");
                })),
                headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold", halign: "center", fontSize: 9 },
                bodyStyles: { fontSize: 8, cellPadding: 2 },
                alternateRowStyles: { fillColor: [243, 244, 246] },
                columnStyles: { 3: { halign: "right" }, 4: { halign: "right" } },
            });
            y = doc.lastAutoTable.finalY + 8;

            doc.setFontSize(10); doc.setTextColor(80);
            doc.text(`Tạm tính: ${(order.subtotal || 0).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" }); y += 5;
            if (order.discountAmount) {
                doc.setTextColor(200, 0, 0);
                doc.text(`Giảm giá: -${(order.discountAmount).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" }); y += 5;
            }
            if (order.shippingFee) {
                doc.setTextColor(80);
                doc.text(`Phí ship: ${(order.shippingFee).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" }); y += 5;
            }
            doc.setFontSize(12); doc.setTextColor(30, 64, 175);
            doc.text(`Tổng cộng: ${(order.totalAmount || 0).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" });

            doc.save(`DonHang_${order.code}.pdf`);
        } catch (err) {
            console.error("Export PDF failed:", err);
            toast.error("Xuất file thất bại");
        } finally {
            setIsExportingPDF(false);
        }
    };

    // ✅ BE lưu shipping address dưới dạng flat fields (giống OrderDetail user)
    const shippingInfo = {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        address: order.shippingAddress,
    };

    // ✅ BE dùng discountAmount (không phải discount)
    const shippingFee = order?.shippingFee ?? 0;
    const discountAmount = order?.discountAmount ?? 0;

    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
        (order.status || "").toLowerCase(),
    );

    const [cancelOpen, setCancelOpen] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [vatDialogOpen, setVatDialogOpen] = useState(false);

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
                    <ExportButton
                        onExportPDF={handleExportOrderPDF}
                        loading={isExportingPDF}
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setVatDialogOpen(true)}
                    >
                        Xuất hóa đơn GTGT
                    </Button>
                </div>

                {returnRequest && returnRequest.status === RETURN_REQUEST_STATUS.PENDING && (
                    <div className="mt-3 w-full rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3 dark:bg-yellow-950/30">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium">Yêu cầu trả hàng đang chờ duyệt</p>
                                <p className="text-xs text-muted-foreground">
                                    {returnRequest.reason && `Lý do: ${returnRequest.reason} — `}
                                    {returnRequest.description?.slice(0, 80)}
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <Button
                                    size="sm"
                                    className="rounded-full bg-green-600 hover:bg-green-700"
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                >
                                    {isApproving ? "..." : "Duyệt & Hoàn tiền"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full text-destructive"
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                >
                                    Từ chối
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {returnRequest && returnRequest.status === RETURN_REQUEST_STATUS.APPROVED && (
                    <div className="mt-3 w-full rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3 dark:bg-blue-950/30">
                        <p className="text-sm font-medium">Đã duyệt, đang xử lý hoàn tiền</p>
                    </div>
                )}

                {returnRequest && returnRequest.status === RETURN_REQUEST_STATUS.REFUNDED && (
                    <div className="mt-3 w-full rounded-lg border-l-4 border-green-400 bg-green-50 p-3 dark:bg-green-950/30">
                        <p className="text-sm font-medium">Đã hoàn tiền</p>
                    </div>
                )}

                {returnRequest && returnRequest.status === RETURN_REQUEST_STATUS.REJECTED && (
                    <div className="mt-3 w-full rounded-lg border-l-4 border-red-400 bg-red-50 p-3 dark:bg-red-950/30">
                        <p className="text-sm font-medium">Đã từ chối yêu cầu trả hàng</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* ── Left ── */}
                <div className="space-y-4 lg:col-span-2">
                    {/* Items */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">
                                {"Mã đơn hàng"} —{" "}
                                {order.items?.length ?? 0}{" "}
                                {"Số lượng"}
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
                            {/* ✅ dùng discountAmount + hiện couponCode nếu có */}
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
                                <span>
                                    {"Tổng cộng"}
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
                                {"Khách hàng"}
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p className="font-medium text-foreground">
                                    {order.user?.fullName}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.user?.email}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.user?.phone ? formatPhone(order.user.phone) : "—"}
                                </p>
                            </div>
                        </div>

                        {/* ✅ Dùng flat fields từ BE */}
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <div className="mb-3 flex items-center gap-2">
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
                    </div>

                    {/* Payment */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">
                                {"Phương thức thanh toán"}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">
                                {(PAYMENT_MAP[order.paymentMethod] || order.paymentMethod)}
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
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <StickyNote className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium text-foreground">
                                    Ghi chú đơn hàng
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {order.note}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Right — Timeline ── */}
                <div>
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-5 text-sm font-medium text-foreground">
                            {"Trạng thái"}
                        </h3>
                        <OrderTimeline order={order} />
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={handleCancelOpen}
                title={"Huỷ đơn hàng"}
                description={
                    <Form {...cancelForm}>
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
                    </Form>
                }
                confirmLabel={"Xác nhận huỷ"}
                onConfirm={cancelForm.handleSubmit(handleCancel)}
                isLoading={isCancelling}
            />
            <VATInvoiceDialog
                open={vatDialogOpen}
                onClose={() => setVatDialogOpen(false)}
                order={order}
            />
        </div>
    );
}
