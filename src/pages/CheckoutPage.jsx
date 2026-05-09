import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/shared/EmptyState";
import PriceDisplay from "@/components/shared/PriceDisplay";
import CheckoutStepper from "@/features/checkout/components/CheckoutStepper";
import AddressStep from "@/features/checkout/components/AddressStep";
import PaymentStep from "@/features/checkout/components/PaymentStep";
import ConfirmStep from "@/features/checkout/components/ConfirmStep";
import OrderSuccess from "@/features/checkout/components/OrderSuccess";
import CouponInput from "@/features/checkout/components/CouponInput";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function CheckoutPage() {
    const { t } = useTranslation("checkout");

    const {
        currentStep,
        isSuccess,
        createdOrder,
        checkoutData,
        items,
        total,
        shippingFee,
        discountAmount,
        grandTotal,
        isLoading,
        isPaying,
        appliedCoupon,
        handleAddressNext,
        handlePaymentNext,
        handlePlaceOrder,
        handleMoMoPayment,
        handleApplyCoupon,
        handleRemoveCoupon,
        goBack,
    } = useCheckout();

    if (items.length === 0 && !isSuccess) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <EmptyState
                    icon={ShoppingCart}
                    title={t("cart.empty", { ns: "cart" })}
                    description={t("cart.emptyDesc", { ns: "cart" })}
                    actionLabel={t("btn.continueShopping", { ns: "common" })}
                    actionHref={ROUTES.PRODUCTS}
                />
            </div>
        );
    }

    if (isSuccess && createdOrder) {
        return <OrderSuccess order={createdOrder} onMoMoPayment={handleMoMoPayment} isPaying={isPaying} />;
    }

    return (
        <div className="mx-auto max-w-5xl">
            {/* Back to cart */}
            <Button
                variant="ghost"
                size="sm"
                className="mb-6 rounded-full"
                asChild
            >
                <Link to={ROUTES.CART}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t("title", { ns: "cart" })}
                </Link>
            </Button>

            {/* Stepper */}
            <CheckoutStepper currentStep={currentStep} className="mb-8" />

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                {/* ── Left — Steps ── */}
                <div className="min-w-0 flex-1">
                    {currentStep === 0 && (
                        <AddressStep
                            defaultData={checkoutData}
                            onNext={handleAddressNext}
                        />
                    )}
                    {currentStep === 1 && (
                        <PaymentStep
                            defaultData={checkoutData}
                            onNext={handlePaymentNext}
                            onBack={goBack}
                        />
                    )}
                    {currentStep === 2 && (
                        <ConfirmStep
                            checkoutData={checkoutData}
                            items={items}
                            total={total}
                            shippingFee={shippingFee}
                            discountAmount={discountAmount}
                            grandTotal={grandTotal}
                            onPlaceOrder={handlePlaceOrder}
                            onBack={goBack}
                            isLoading={isLoading}
                        />
                    )}
                </div>

                {/* ── Right — Order summary ── */}
                <div className="w-full shrink-0 lg:w-80">
                    <div className="sticky top-6 rounded-2xl border border-border bg-card p-5">
                        <h3 className="mb-4 text-sm font-medium text-foreground">
                            {t("confirm.orderSummary")}
                        </h3>

                        {/* Items */}
                        <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                            {items.map((item, index) => {
                                const product = item.product || item.variant?.product;
                                const variant = item.variant;
                                const salePrice = variant?.salePrice || product?.salePrice;
                                const price = variant?.price || product?.price;
                                const effectivePrice =
                                    salePrice && salePrice < price
                                        ? salePrice
                                        : price;
                                const color = variant?.color || product?.color || "";
                                const storage = variant?.storage || product?.storage || "";
                                const variantId = item.variantId || product?.variantId || index;
                                return (
                                    <div key={variantId} className="flex gap-3">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                                            <img
                                                src={
                                                    product?.images?.[0] ||
                                                    product?.image ||
                                                    item.image
                                                }
                                                alt={product?.name || item.name}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium text-foreground">
                                                {product?.name || item.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {color && <span>{color}</span>}
                                                {color && storage && <span> · </span>}
                                                {storage && <span>{storage}</span>}
                                            </p>
                                            <div className="mt-0.5 flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    x{item.quantity}
                                                </span>
                                                <span className="text-xs font-medium">
                                                    {formatPrice(
                                                        effectivePrice *
                                                            item.quantity,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Separator className="mb-4" />

                        {/* Coupon input */}
                        <div className="mb-4">
                            <CouponInput
                                orderTotal={total}
                                appliedCoupon={appliedCoupon}
                                onApply={handleApplyCoupon}
                                onRemove={handleRemoveCoupon}
                            />
                        </div>

                        <Separator className="mb-4" />

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

                            {/* Discount row — chỉ hiện khi có coupon */}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>
                                        {t("confirm.discount", {
                                            defaultValue: "Giảm giá",
                                        })}{" "}
                                        <code className="text-xs">
                                            ({appliedCoupon?.code})
                                        </code>
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
                </div>
            </div>
        </div>
    );
}
