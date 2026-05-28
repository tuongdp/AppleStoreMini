import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, XCircle, Package, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ROUTES, PAYMENT_METHODS } from "@/lib/constants";
import { productPlaceholder } from "@/assets/images";
import { selectIsAuthenticated } from "@/store/authSlice";

export default function OrderSuccess({ order, onOnlinePayment, isPaying, paymentError }) {
    const isOnlinePayment = order?.paymentMethod?.toLowerCase() === PAYMENT_METHODS.VNPAY;
    const isPaymentFailed = isOnlinePayment && !!paymentError;
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const trackLink = isAuthenticated
        ? ROUTES.ORDER_DETAIL(order?.id)
        : `${ROUTES.ORDER_LOOKUP}?code=${encodeURIComponent(order?.code || "")}`;

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                isPaymentFailed
                    ? "bg-red-100 dark:bg-red-950/30"
                    : "bg-green-100 dark:bg-green-950/30"
            }`}>
                {isPaymentFailed ? (
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                ) : (
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                )}
            </div>

            <h1 className="mb-2 text-2xl font-semibold text-foreground">
                {isPaymentFailed ? "Thanh toán thất bại" : "Đặt hàng thành công!"}
            </h1>
            <p className="mb-8 text-sm text-muted-foreground">
                {isPaymentFailed
                    ? paymentError
                    : "Cảm ơn bạn đã mua hàng"}
            </p>

            <div className="mb-8 w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-left">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {"Mã đơn hàng"}
                    </span>
                    <span className="font-semibold text-foreground">
                        #{order?.code}
                    </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {"Ngày đặt hàng"}
                    </span>
                    <span className="text-sm text-foreground">
                        {formatDateTime(order?.createdAt)}
                    </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {"Tổng cộng"}
                    </span>
                    <span className="font-semibold text-foreground">
                        {formatPrice(order?.totalAmount)}
                    </span>
                </div>

                <Separator className="mb-4" />

                {order?.items?.length > 0 && (
                    <div className="space-y-3">
                        {order.items.slice(0, 3).map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                                    {item.image && (
                                        <ResponsiveImage
                                            src={item.image}
                                            fallbackSrc={productPlaceholder}
                                            alt={item.name}
                                            width={48}
                                            height={48}
                                            className="h-full w-full object-contain"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-foreground">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        x{item.quantity}
                                        {item.color && <span> · {item.color}</span>}
                                        {item.storage && <span> · {item.storage}</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                                {"moreItems"}
                            </p>
                        )}
                    </div>
                )}

                <Separator className="my-4" />

                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                    <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        {"Dự kiến giao hàng"}:{" "}
                        <span className="font-medium text-foreground">
                            3-5 {"ngày làm việc"}
                        </span>
                    </p>
                </div>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                    {"Thông tin đơn hàng đã được gửi đến email của bạn"}
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                {isOnlinePayment && !isPaymentFailed && (
                    <Button
                        className="rounded-full px-8"
                        onClick={() => onOnlinePayment(order?.id)}
                        disabled={isPaying}
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        {isPaying ? "Đang đặt hàng..." : "Thanh toán VNPay"}
                    </Button>
                )}
                <Button className="rounded-full px-8" asChild>
                    <Link to={trackLink}>
                        {"Theo dõi đơn hàng"}
                    </Link>
                </Button>
                <Button variant="outline" className="rounded-full px-8" asChild>
                    <Link to={ROUTES.PRODUCTS}>
                        {"Tiếp tục mua sắm"}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
