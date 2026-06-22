import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import CouponInput from "@/features/checkout/components/CouponInput";
import { selectCartSelectedItems, selectCartSelectedStockIssues, selectCartSelectedTotal, selectCartCoupon, setCartCoupon } from "@/store/cartSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function CartSummaryCard() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const total = useSelector(selectCartSelectedTotal);
    const selectedItems = useSelector(selectCartSelectedItems);
    const stockIssues = useSelector(selectCartSelectedStockIssues);
    const appliedCoupon = useSelector(selectCartCoupon);

    const discountAmount = appliedCoupon?.discountAmount ?? 0;
    const grandTotal = Math.max(0, total - discountAmount);
    const canCheckout = selectedItems.length > 0 && stockIssues.length === 0;
    const disabledReason = selectedItems.length === 0
        ? "Vui lòng chọn ít nhất một sản phẩm để thanh toán."
        : stockIssues.length > 0
            ? "Có sản phẩm đã chọn không đủ số lượng. Vui lòng giảm số lượng hoặc bỏ chọn sản phẩm đó."
            : "";

    const handleApplyCoupon = (couponData) => {
        dispatch(setCartCoupon(couponData));
    };

    const handleRemoveCoupon = () => {
        dispatch(setCartCoupon(null));
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
                            Phí vận chuyển
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                            Miễn phí
                        </span>
                    </div>

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
                        isAuthenticated={isAuthenticated}
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

                {stockIssues.length > 0 && (
                    <p className="mt-4 text-xs font-medium text-destructive">
                        {"Có sản phẩm đã chọn không đủ số lượng. Vui lòng giảm số lượng hoặc bỏ chọn sản phẩm đó."}
                    </p>
                )}

                {!canCheckout && disabledReason && selectedItems.length === 0 && (
                    <p className="mt-4 text-xs text-muted-foreground" role="status">
                        {disabledReason}
                    </p>
                )}

                <Button className="mt-6 w-full rounded-full" disabled={!canCheckout} asChild={canCheckout}>
                    {canCheckout ? (
                        <Link to={ROUTES.CHECKOUT}>{"Tiến hành thanh toán"}</Link>
                    ) : (
                        <span>{"Tiến hành thanh toán"}</span>
                    )}
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
