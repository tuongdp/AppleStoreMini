import { MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import OrderItemRow from "./OrderItemRow";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

const PAYMENT_MAP = {
  "cod": "Thanh toán khi nhận hàng",
  "momo": "MoMo",
  "paid": "Đã thanh toán",
  "refunded": "Đã hoàn tiền",
  "unknown": "Không xác định",
  "unpaid": "Chưa thanh toán"
};
export default function ConfirmStep({
    checkoutData,
    items,
    total,
    shippingFee,
    discountAmount = 0,
    grandTotal,
    onPlaceOrder,
    onBack,
    isLoading,
}) {
    const { fullName, phone, address, paymentMethod } = checkoutData;

    return (
        <div className="space-y-4">
            {/* Shipping address */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                        {"Địa chỉ giao hàng"}
                    </h3>
                </div>
                {fullName && (
                    <div className="space-y-0.5 text-sm">
                        <p className="font-medium text-foreground">
                            {fullName}
                        </p>
                        <p className="text-muted-foreground">{phone}</p>
                        <p className="text-muted-foreground">
                            {address}
                        </p>
                    </div>
                )}
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                        {"Phương thức thanh toán"}
                    </h3>
                </div>
                <p className="text-sm text-foreground">
                    {paymentMethod
                        ? (PAYMENT_MAP[paymentMethod] || paymentMethod)
                        : "Không xác định"}
                </p>
                {paymentMethod === PAYMENT_METHODS.COD && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {"Trả tiền mặt khi nhận hàng"}
                    </p>
                )}
            </div>

            {/* Order items */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                        {"Sản phẩm đặt hàng"}
                    </h3>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => {
                        const variantId = item.variantId || item.product?.variantId || index;
                        return (
                            <OrderItemRow
                                key={variantId}
                                item={item}
                                index={index}
                                isLast={index === items.length - 1}
                            />
                        );
                    })}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {"Tạm tính"}
                        </span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {"Phí vận chuyển"}
                        </span>
                        <span
                            className={
                                shippingFee === 0
                                    ? "text-green-600 dark:text-green-400"
                                    : ""
                            }
                        >
                            {shippingFee === 0
                                ? "Miễn phí"
                                : formatPrice(shippingFee)}
                        </span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>
                                {"Giảm giá"}
                            </span>
                            <span>-{formatPrice(discountAmount)}</span>
                        </div>
                    )}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                        {"Tổng cộng"}
                    </span>
                    <PriceDisplay price={grandTotal} size="lg" />
                </div>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground">
                {"Bằng cách đặt hàng, bạn đồng ý với"}{" "}
                <a href="/terms" className="text-apple-blue hover:opacity-70">
                    {"Điều khoản sử dụng"}
                </a>{" "}
                {"và"}{" "}
                <a href="/privacy" className="text-apple-blue hover:opacity-70">
                    {"Chính sách bảo mật"}
                </a>
            </p>

            {/* Actions */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    {"Quay lại"}
                </Button>
                <Button
                    className="rounded-full px-8"
                    onClick={onPlaceOrder}
                    disabled={isLoading}
                >
                    {isLoading ? "Đang đặt hàng..." : "Đặt hàng"}
                </Button>
            </div>
        </div>
    );
}
