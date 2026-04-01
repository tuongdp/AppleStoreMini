import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateOrderMutation } from "@/store/api/ordersApi";
import { selectCartItems, selectCartTotal, clearCart } from "@/store/cartSlice";
import { SHIPPING } from "@/lib/constants";

export function useCheckout() {
    const { t } = useTranslation("checkout");
    const dispatch = useDispatch();

    const items = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);

    const [currentStep, setCurrentStep] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [checkoutData, setCheckoutData] = useState({
        addressId: null,
        address: null,
        paymentMethod: null,
        note: "",
    });

    const [appliedCoupon, setAppliedCoupon] = useState(null);
    // appliedCoupon shape: { code, discountAmount, description }

    const [createOrder, { isLoading }] = useCreateOrderMutation();

    // ── Computed ───────────────────────────────────────
    const shippingFee =
        total >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;

    const discountAmount = appliedCoupon?.discountAmount ?? 0;

    const grandTotal = Math.max(0, total + shippingFee - discountAmount);

    const canProceed = items.length > 0;

    // ── Step navigation ────────────────────────────────
    const goNext = () => setCurrentStep((s) => Math.min(s + 1, 2));
    const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const handleAddressNext = (data) => {
        setCheckoutData((prev) => ({ ...prev, ...data }));
        goNext();
    };

    const handlePaymentNext = (data) => {
        setCheckoutData((prev) => ({ ...prev, ...data }));
        goNext();
    };

    // ── Coupon handlers ────────────────────────────────
    const handleApplyCoupon = (couponData) => {
        setAppliedCoupon(couponData);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    // ── Place order ────────────────────────────────────
    const handlePlaceOrder = async () => {
        if (items.length === 0) {
            toast.error(t("error.emptyCart"));
            return;
        }
        if (!checkoutData.paymentMethod) {
            toast.error(t("error.placeOrderFailed"));
            return;
        }

        try {
            // ✅ ordersApi transformResponse → trả về order object trực tiếp
            const order = await createOrder({
                // BE nhận addressId hoặc address object
                ...(checkoutData.addressId
                    ? { addressId: checkoutData.addressId }
                    : { address: checkoutData.address }),
                // BE sẽ .toUpperCase() → không cần FE làm thủ công
                paymentMethod: checkoutData.paymentMethod,
                note: checkoutData.note || "",
                couponCode: appliedCoupon?.code || undefined,
                // ✅ MySQL dùng integer id — không có _id
                items: items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor || "",
                    selectedStorage: item.selectedStorage || "",
                })),
            }).unwrap();

            // order đã được unwrap từ transformResponse → object trực tiếp
            setCreatedOrder(order);
            dispatch(clearCart());
            setIsSuccess(true);
            toast.success(t("success.placeOrder"));
        } catch (error) {
            toast.error(t("error.placeOrderFailed"), {
                description: error?.data?.message,
            });
        }
    };

    // ── Reset ──────────────────────────────────────────
    const reset = () => {
        setCurrentStep(0);
        setIsSuccess(false);
        setCreatedOrder(null);
        setAppliedCoupon(null);
        setCheckoutData({
            addressId: null,
            address: null,
            paymentMethod: null,
            note: "",
        });
    };

    return {
        currentStep,
        isSuccess,
        createdOrder,
        checkoutData,
        items,
        total,
        shippingFee,
        discountAmount,
        grandTotal,
        canProceed,
        isLoading,
        appliedCoupon,
        handleAddressNext,
        handlePaymentNext,
        handlePlaceOrder,
        handleApplyCoupon,
        handleRemoveCoupon,
        goBack,
        reset,
    };
}
