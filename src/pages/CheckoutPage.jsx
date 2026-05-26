import { Link } from "react-router-dom";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/shared/EmptyState";
import PriceDisplay from "@/components/shared/PriceDisplay";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import CheckoutStepper from "@/features/checkout/components/CheckoutStepper";
import AddressStep from "@/features/checkout/components/AddressStep";
import PaymentStep from "@/features/checkout/components/PaymentStep";
import ConfirmStep from "@/features/checkout/components/ConfirmStep";
import OrderSuccess from "@/features/checkout/components/OrderSuccess";
import CouponInput from "@/features/checkout/components/CouponInput";
import { getEffectivePrice } from "@/store/cartSlice";
import { formatPrice, parseJsonField } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { productPlaceholder } from "@/assets/images";

export default function CheckoutPage() {
    const {
        currentStep,
        isSuccess,
        createdOrder,
        checkoutData,
        items,
        total,
        shippingFee,
        discountAmount,
        availablePoints,
        pointsDiscount,
        usePoints,
        grandTotal,
        isLoading,
        isPaying,
        appliedCoupon,
        handleAddressNext,
        handlePaymentNext,
        handlePlaceOrder,
        handleOnlinePayment,
        handleApplyCoupon,
        handleRemoveCoupon,
        setUsePoints,
        goBack,
        paymentError,
    } = useCheckout();

    if (items.length === 0 && !isSuccess) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <EmptyState
                    icon={ShoppingCart}
                    title={"Giỏ hàng trống"}
                    description={"Hãy thêm sản phẩm vào giỏ hàng của bạn"}
                    actionLabel={"Tiếp tục mua sắm"}
                    actionHref={ROUTES.PRODUCTS}
                />
            </div>
        );
    }

    if (isSuccess && createdOrder) {
        return <OrderSuccess order={createdOrder} onOnlinePayment={handleOnlinePayment} isPaying={isPaying} paymentError={paymentError} />;
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
                    {"Giỏ hàng"}
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
                            {"Tóm tắt đơn hàng"}
                        </h3>

                        {/* Items */}
                        <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                            {items.map((item, index) => {
                                const product = item.product || item.variant?.product;
                                const variant = item.variant;
                                const effectivePrice = getEffectivePrice(product, variant);
                                const color = variant?.color || product?.color || "";
                                const storage = variant?.storage || product?.storage || "";
                                const variantId = item.variantId || product?.variantId || index;
                                return (
                                    <div key={variantId} className="flex gap-3">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                                            <ResponsiveImage
                                                src={
                                                    parseJsonField(product?.images)?.[0] ||
                                                    product?.image ||
                                                    item.image
                                                }
                                                fallbackSrc={productPlaceholder}
                                                alt={product?.name || item.name}
                                                width={56}
                                                height={56}
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

                        {availablePoints > 0 && (
                            <>
                                <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                                    <Checkbox
                                        checked={usePoints}
                                        onCheckedChange={(checked) => setUsePoints(Boolean(checked))}
                                        className="mt-0.5"
                                    />
                                    <span className="min-w-0 flex-1 text-sm">
                                        <span className="block font-medium text-foreground">
                                            Dùng điểm thưởng
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            Bạn có {availablePoints.toLocaleString("vi-VN")} điểm, có thể trừ trực tiếp vào đơn hàng.
                                        </span>
                                    </span>
                                </label>
                                <Separator className="mb-4" />
                            </>
                        )}

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

                            {/* Discount row — chỉ hiện khi có coupon */}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>
                                        {"Giảm giá"}{" "}
                                        <code className="text-xs">
                                            ({appliedCoupon?.code})
                                        </code>
                                    </span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            {pointsDiscount > 0 && (
                                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                    <span>Điểm thưởng</span>
                                    <span>-{formatPrice(pointsDiscount)}</span>
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
                </div>
            </div>
        </div>
    );
}
