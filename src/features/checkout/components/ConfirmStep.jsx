import { useTranslation } from "react-i18next";
import { MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import OrderItemRow from "./OrderItemRow";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

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
    const { t } = useTranslation("checkout");
    const { address, paymentMethod } = checkoutData;

    return (
        <div className="space-y-4">
            {/* Shipping address */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                        {t("confirm.shippingAddress")}
                    </h3>
                </div>
                {address && (
                    <div className="space-y-0.5 text-sm">
                        <p className="font-medium text-foreground">
                            {address.fullName}
                        </p>
                        <p className="text-muted-foreground">{address.phone}</p>
                        <p className="text-muted-foreground">
                            {address.address}, {address.ward},{" "}
                            {address.district}, {address.province}
                        </p>
                    </div>
                )}
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                        {t("confirm.paymentMethod")}
                    </h3>
                </div>
                <p className="text-sm text-foreground">
                    {paymentMethod
                        ? t(`payment.${paymentMethod}`)
                        : t("payment.unknown", {
                              defaultValue: "Không xác định",
                          })}
                </p>
                {paymentMethod === PAYMENT_METHODS.COD && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("payment.codDesc")}
                    </p>
                )}
            </div>

            {/* Order items */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                        {t("confirm.orderItems")}
                    </h3>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        // ✅ MySQL integer id — không dùng _id
                        <OrderItemRow
                            key={`${item.product.id}-${item.selectedColor}-${item.selectedStorage}-${index}`}
                            item={item}
                            index={index}
                            isLast={index === items.length - 1}
                        />
                    ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t("confirm.subtotal")}
                        </span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t("confirm.shipping")}
                        </span>
                        <span
                            className={
                                shippingFee === 0
                                    ? "text-green-600 dark:text-green-400"
                                    : ""
                            }
                        >
                            {shippingFee === 0
                                ? t("confirm.freeShipping")
                                : formatPrice(shippingFee)}
                        </span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>
                                {t("confirm.discount", {
                                    defaultValue: "Giảm giá",
                                })}
                            </span>
                            <span>-{formatPrice(discountAmount)}</span>
                        </div>
                    )}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                        {t("confirm.total")}
                    </span>
                    <PriceDisplay price={grandTotal} size="lg" />
                </div>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground">
                {t("confirm.agreeTerms")}{" "}
                <a href="/terms" className="text-apple-blue hover:opacity-70">
                    {t("confirm.terms")}
                </a>{" "}
                {t("confirm.and")}{" "}
                <a href="/privacy" className="text-apple-blue hover:opacity-70">
                    {t("confirm.privacy")}
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
                    {t("confirm.back")}
                </Button>
                <Button
                    className="rounded-full px-8"
                    onClick={onPlaceOrder}
                    disabled={isLoading}
                >
                    {isLoading ? t("confirm.placing") : t("confirm.placeOrder")}
                </Button>
            </div>
        </div>
    );
}
