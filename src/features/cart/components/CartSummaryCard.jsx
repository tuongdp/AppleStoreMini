import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import CouponInput from "@/features/checkout/components/CouponInput";
import { selectCartTotal } from "@/store/cartSlice";
import { formatPrice } from "@/lib/utils";
import { ROUTES, SHIPPING } from "@/lib/constants";

export default function CartSummaryCard() {
    const total = useSelector(selectCartTotal);

    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const shippingFee =
        total >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;

    const discountAmount = appliedCoupon?.discountAmount ?? 0;
    const grandTotal = Math.max(0, total + shippingFee - discountAmount);

    const handleApplyCoupon = (couponData) => {
        setAppliedCoupon(couponData);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    return (
        <div className="w-full shrink-0 lg:w-80">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 text-base font-semibold text-foreground">
                    {"Tóm tắt đơn hàng"}
                </h2>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {"Tạm tính"}
                        </span>
                        <span className="font-medium">
                            {formatPrice(total)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {"Phí vận chuyển"}
                        </span>
                        <span
                            className={
                                shippingFee === 0
                                    ? "font-medium text-green-600 dark:text-green-400"
                                    : "font-medium"
                            }
                        >
                            {shippingFee === 0
                                ? "Miễn phí"
                                : formatPrice(shippingFee)}
                        </span>
                    </div>
                    {shippingFee > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {"Miễn phí vận chuyển cho đơn hàng từ 500.000đ"}
                        </p>
                    )}

                    {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                            <span>{"Giảm giá"}</span>
                            <span>-{formatPrice(discountAmount)}</span>
                        </div>
                    )}
                </div>

                <Separator className="my-4" />

                <div className="mb-4">
                    <CouponInput
                        orderTotal={total}
                        appliedCoupon={appliedCoupon}
                        onApply={handleApplyCoupon}
                        onRemove={handleRemoveCoupon}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                        {"Tổng cộng"}
                    </span>
                    <PriceDisplay price={grandTotal} size="lg" />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">
                    {"Đã bao gồm VAT"}
                </p>

                <Button className="mt-6 w-full rounded-full" asChild>
                    <Link to={ROUTES.CHECKOUT}>{"Tiến hành thanh toán"}</Link>
                </Button>

                <Button
                    variant="outline"
                    className="mt-2 w-full rounded-full"
                    asChild
                >
                    <Link to={ROUTES.PRODUCTS}>{"Tiếp tục mua sắm"}</Link>
                </Button>
            </div>
        </div>
    );
}
