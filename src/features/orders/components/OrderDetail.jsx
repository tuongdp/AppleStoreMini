import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, MapPin, CreditCard, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Form, FormControl, FormField, FormItem, FormMessage,
} from "@/components/ui/form";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderItemRow from "./OrderItemRow";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useCancelOrderMutation, useConfirmDeliveredMutation, useUpdateOrderShippingMutation } from "@/store/api/ordersApi";
import { useCreateReviewMutation } from "@/store/api/productReviewApi";
import { cancelOrderSchema } from "@/lib/validations";
import { toast } from "sonner";
import { formatPrice, formatDateTime, formatPhone } from "@/lib/utils";
import { ORDER_STATUS, ROUTES } from "@/lib/constants";
import { useAddToCartFromOrder } from "@/features/cart/hooks/useAddToCartFromOrder";
import { z } from "zod";

const reviewSchema = z.object({
    rating: z.number().min(1, "Vui lòng chọn sao"),
    content: z.string().min(5, "Ít nhất 5 ký tự"),
});

export default function OrderDetail({ order }) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [reviewItem, setReviewItem] = useState(null);
    const [isEditingShipping, setIsEditingShipping] = useState(false);

    const cancelForm = useForm({
        resolver: zodResolver(cancelOrderSchema),
        defaultValues: { reason: "" },
    });

    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [confirmDelivered, { isLoading: isConfirming }] = useConfirmDeliveredMutation();
    const [updateShipping, { isLoading: isUpdatingShipping }] = useUpdateOrderShippingMutation();
    const [createReview, { isLoading: isReviewing }] = useCreateReviewMutation();
    const handleReOrder = useAddToCartFromOrder();

    const reviewForm = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 5, content: "" },
    });

    const shippingInfo = {
        fullName: order.shippingFullName || order.user?.fullName || "",
        phone: order.shippingPhone || order.user?.phone || "",
        address: order.shippingAddress || order.user?.address || "",
    };

    const shippingForm = useForm({
        defaultValues: {
            fullName: shippingInfo.fullName,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            note: order.note || "",
        },
    });

    const isDelivered = (order.status || "").toLowerCase() === ORDER_STATUS.DELIVERED;
    const isPending = (order.status || "").toLowerCase() === ORDER_STATUS.PENDING;

    const canCancel = !order.isPaid && [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(
        (order.status || "").toLowerCase(),
    );
    const canConfirm = (order.status || "").toLowerCase() === ORDER_STATUS.SHIPPING;

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

    const handleReviewSubmit = async (values) => {
        if (!reviewItem) return;
        const product = reviewItem.product || reviewItem.variant?.product;
        const productId = product?.id || reviewItem.productId || reviewItem.variant?.productId;
        try {
            await createReview({
                productId,
                variantId: reviewItem.variantId || reviewItem.variant?.id,
                orderId: order.id,
                orderItemId: reviewItem.id,
                rating: values.rating,
                content: values.content,
            }).unwrap();
            toast.success("Đánh giá thành công");
            setReviewItem(null);
            reviewForm.reset({ rating: 5, content: "" });
        } catch {
            toast.error("Đánh giá thất bại");
        }
    };

    const handleUpdateShipping = async (values) => {
        try {
            await updateShipping({ id: order.id, ...values }).unwrap();
            toast.success("Cập nhật thông tin thành công");
            setIsEditingShipping(false);
        } catch (error) {
            toast.error(error?.data?.message || "Cập nhật thất bại");
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
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <MapPin className="h-4 w-4 text-muted-foreground" />Địa chỉ giao hàng
                        </div>
                        {isPending && !isEditingShipping && (
                            <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setIsEditingShipping(true)}>
                                Sửa
                            </Button>
                        )}
                    </div>
                    {isEditingShipping ? (
                        <Form {...shippingForm}>
                            <form onSubmit={shippingForm.handleSubmit(handleUpdateShipping)} className="space-y-3">
                                <FormField control={shippingForm.control} name="fullName" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Họ tên người nhận" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={shippingForm.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Số điện thoại" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={shippingForm.control} name="address" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Textarea placeholder="Địa chỉ" rows={2} {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={shippingForm.control} name="note" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Ghi chú (tuỳ chọn)" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <div className="flex gap-2">
                                    <Button type="submit" size="sm" className="rounded-full" disabled={isUpdatingShipping}>
                                        {isUpdatingShipping ? "Đang lưu..." : "Lưu"}
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setIsEditingShipping(false)}>
                                        Huỷ
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <>
                            <p className="text-sm font-medium">{shippingInfo.fullName} - {formatPhone(shippingInfo.phone)}</p>
                            <p className="text-sm text-muted-foreground">{shippingInfo.address}</p>
                            {order.note && <p className="mt-1 text-xs text-muted-foreground">Ghi chú: {order.note}</p>}
                        </>
                    )}
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
                    {order.items?.map((item, index) => {
                        const isReviewed = item.isReviewed || item.reviewed;
                        return (
                            <div key={item.id || index}>
                                <OrderItemRow item={item} isLast={false} />
                                {isDelivered && !isReviewed && (
                                    <div className="mt-2 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full text-xs"
                                            onClick={() => {
                                                setReviewItem(item);
                                                reviewForm.reset({ rating: 5, content: "" });
                                            }}
                                        >
                                            <Star className="mr-1 h-3 w-3" />Đánh giá
                                        </Button>
                                    </div>
                                )}
                                {index < (order.items?.length || 0) - 1 && <Separator className="mt-3" />}
                            </div>
                        );
                    })}
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

            <Dialog open={!!reviewItem} onOpenChange={(open) => { if (!open) setReviewItem(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
                        <DialogDescription>
                            {reviewItem?.product?.name || reviewItem?.variant?.product?.name || reviewItem?.name || "Sản phẩm"}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...reviewForm}>
                        <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-4">
                            <div className="flex items-center justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => reviewForm.setValue("rating", star)}
                                        className="text-3xl transition-colors"
                                    >
                                        <Star
                                            className={star <= reviewForm.watch("rating") ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <FormField control={reviewForm.control} name="content" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="Chia sẻ trải nghiệm của bạn..." rows={4} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" className="rounded-full" onClick={() => setReviewItem(null)}>
                                    Huỷ
                                </Button>
                                <Button type="submit" className="rounded-full" disabled={isReviewing}>
                                    {isReviewing ? "Đang gửi..." : "Gửi đánh giá"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={handleCancelOpen}
                title="Huỷ đơn hàng"
                description="Bạn có chắc muốn huỷ đơn hàng này?"
                onConfirm={() => cancelForm.handleSubmit(handleCancel)()}
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
