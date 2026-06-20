import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, MapPin, CreditCard, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Form, FormControl, FormField, FormItem, FormMessage,
} from "@/components/ui/form";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderItemRow from "./OrderItemRow";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useCancelOrderMutation, useConfirmDeliveredMutation } from "@/store/api/ordersApi";
import { cancelOrderSchema } from "@/lib/validations";
import { toast } from "sonner";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import { ORDER_STATUS, ROUTES } from "@/lib/constants";
import { useAddToCartFromOrder } from "@/features/cart/hooks/useAddToCartFromOrder";

export default function OrderDetail({ order }) {
    const [cancelOpen, setCancelOpen] = useState(false);

    const cancelForm = useForm({
        resolver: zodResolver(cancelOrderSchema),
        defaultValues: { reason: "" },
    });

    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [confirmDelivered, { isLoading: isConfirming }] = useConfirmDeliveredMutation();
    const handleReOrder = useAddToCartFromOrder();

    const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
        (order.status || "").toLowerCase(),
    );
    const canConfirm = (order.status || "").toLowerCase() === ORDER_STATUS.SHIPPING;

    const shippingInfo = {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        address: order.shippingAddress,
    };

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
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold text-foreground">#{order.code}</h2>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ngày đặt hàng: {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canConfirm && (
                            <Button size="sm" className="rounded-full" onClick={handleConfirmDelivered} disabled={isConfirming}>
                                {isConfirming ? "Đang xử lý..." : "Đã nhận hàng"}
                            </Button>
                        )}
                        {canCancel && (
                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleCancelOpen(true)}>
                                Huỷ đơn
                            </Button>
                        )}
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleReOrder(order)}>
                            <ShoppingCart className="mr-1 h-4 w-4" />Mua lại
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" asChild>
                            <Link to={ROUTES.PRODUCTS}>Tiếp tục mua sắm</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="h-4 w-4 text-muted-foreground" />Địa chỉ giao hàng
                    </div>
                    <p className="text-sm font-medium">{shippingInfo.fullName} - {formatPhone(shippingInfo.phone)}</p>
                    <p className="text-sm text-muted-foreground">{shippingInfo.address}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />Thanh toán
                    </div>
                    <p className="text-sm">{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : order.paymentMethod}</p>
                    {order.isPaid && <p className="text-xs text-green-600">Đã thanh toán</p>}
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Package className="h-4 w-4 text-muted-foreground" />Sản phẩm ({order.items?.length || 0})
                </div>
                <div className="space-y-3">
                    {order.items?.map((item, index) => (
                        <OrderItemRow key={item.id || index} item={item} />
                    ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Tạm tính</span>
                        <span>{formatPrice(Number(order.totalAmount || 0) + Number(discountAmount))}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Giảm giá</span>
                            <span>-{formatPrice(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold text-foreground">
                        <span>Tổng cộng</span>
                        <PriceDisplay price={Number(order.totalAmount || 0)} />
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={handleCancelOpen}
                title="Huỷ đơn hàng"
                description="Bạn có chắc muốn huỷ đơn hàng này?"
                onConfirm={cancelForm.handleSubmit(handleCancel)}
                isLoading={isCancelling}
            >
                <Form {...cancelForm}>
                    <form className="space-y-3">
                        <FormField control={cancelForm.control} name="reason" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Lý do huỷ đơn (tuỳ chọn)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </form>
                </Form>
            </ConfirmDialog>
        </div>
    );
}
