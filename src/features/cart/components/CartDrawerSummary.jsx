import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { selectCartTotal } from "@/store/cartSlice";
import { toggleCartDrawer } from "@/store/uiSlice";
import { formatPrice } from "@/lib/utils";
import { ROUTES, SHIPPING } from "@/lib/constants";

export default function CartDrawerSummary() {
    const dispatch = useDispatch();
    const total = useSelector(selectCartTotal);

    const shippingFee =
        total >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;
    const grandTotal = total + shippingFee;

    const handleClose = () => dispatch(toggleCartDrawer(false));

    return (
        <div className="border-t border-border bg-muted/10 px-6 py-4">
            {/* Subtotal */}
            <div className="mb-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        {"Tạm tính"}
                    </span>
                    <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between">
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
            </div>

            <Separator className="mb-3" />

            {/* Total */}
            <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                    {"Tổng cộng"}
                </span>
                <PriceDisplay price={grandTotal} size="md" />
            </div>
            <p className="mb-4 text-right text-xs text-muted-foreground">
                {"Đã bao gồm VAT"}
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
                <Button
                    className="w-full rounded-full"
                    asChild
                    onClick={handleClose}
                >
                    <Link to={ROUTES.CHECKOUT}>{"Thanh toán"}</Link>
                </Button>
                <Button
                    variant="outline"
                    className="w-full rounded-full"
                    asChild
                    onClick={handleClose}
                >
                    <Link to={ROUTES.CART}>{"Xem giỏ hàng"}</Link>
                </Button>
            </div>
        </div>
    );
}
