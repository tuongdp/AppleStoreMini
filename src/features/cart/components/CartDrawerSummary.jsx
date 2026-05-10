import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { selectCartTotal } from "@/store/cartSlice";
import { toggleCartDrawer } from "@/store/uiSlice";
import { formatPrice } from "@/lib/utils";
import { ROUTES, SHIPPING } from "@/lib/constants";

export default function CartDrawerSummary() {
    const { t } = useTranslation("cart");
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
                        {t("summary.subtotal")}
                    </span>
                    <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        {t("summary.shipping")}
                    </span>
                    <span
                        className={
                            shippingFee === 0
                                ? "text-green-600 dark:text-green-400"
                                : ""
                        }
                    >
                        {shippingFee === 0
                            ? t("summary.freeShipping")
                            : formatPrice(shippingFee)}
                    </span>
                </div>
            </div>

            <Separator className="mb-3" />

            {/* Total */}
            <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                    {t("summary.total")}
                </span>
                <PriceDisplay price={grandTotal} size="md" />
            </div>
            <p className="mb-4 text-right text-xs text-muted-foreground">
                {t("summary.vat")}
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
                <Button
                    className="w-full rounded-full"
                    asChild
                    onClick={handleClose}
                >
                    <Link to={ROUTES.CHECKOUT}>{t("drawer.checkout")}</Link>
                </Button>
                <Button
                    variant="outline"
                    className="w-full rounded-full"
                    asChild
                    onClick={handleClose}
                >
                    <Link to={ROUTES.CART}>{t("drawer.viewCart")}</Link>
                </Button>
            </div>
        </div>
    );
}
