import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { useCreateOrderMutation, useCreatePaymentMutation } from "@/store/api/ordersApi";
import { selectCartItems, selectCartTotal, clearCart } from "@/store/cartSlice";
import { SHIPPING, PAYMENT_METHODS } from "@/lib/constants";

export function useCheckout() {
    const { t } = useTranslation("checkout");
    const dispatch = useDispatch();

    const items = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);

    const [currentStep, setCurrentStep] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [checkoutData, setCheckoutData] = useState({
        fullName: "",
        phone: "",
        address: "",
        paymentMethod: null,
        note: "",
    });

    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const [createPayment, { isLoading: isPaying }] = useCreatePaymentMutation();

    const shippingFee =
        total >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;

    const discountAmount = appliedCoupon?.discountAmount ?? 0;

    const grandTotal = Math.max(0, total + shippingFee - discountAmount);

    const canProceed = items.length > 0;

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

    const handleApplyCoupon = (couponData) => {
        setAppliedCoupon(couponData);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

            const handleMoMoPayment = async (orderId) => {
        try {
            const result = await createPayment(orderId).unwrap();
            if (result?.paymentUrl) {
                window.location.href = result.paymentUrl;
                return true;
            }
        } catch (error) {
            toast.error(t("error.paymentFailed"), {
                description: error?.data?.message,
            });
        }
        return false;
    };

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
            const order = await createOrder({
                fullName: checkoutData.fullName,
                phone: checkoutData.phone,
                address: checkoutData.address,
                paymentMethod: checkoutData.paymentMethod,
                note: checkoutData.note || "",
                couponCode: appliedCoupon?.code || undefined,
                items: items.map((item) => ({
                    variantId: item.variantId || item.product.variantId,
                    quantity: item.quantity,
                })),
            }).unwrap();

            setCreatedOrder(order);
            dispatch(clearCart());

            if (checkoutData.paymentMethod === PAYMENT_METHODS.MOMO) {
                const redirected = await handleMoMoPayment(order.id);
                if (redirected) return;
            }

            setIsSuccess(true);
            if (checkoutData.paymentMethod === PAYMENT_METHODS.COD) {
                toast.success(t("success.placeOrder"));
            }
        } catch (error) {
            toast.error(t("error.placeOrderFailed"), {
                description: error?.data?.message,
            });
        }
    };

    const reset = () => {
        setCurrentStep(0);
        setIsSuccess(false);
        setCreatedOrder(null);
        setAppliedCoupon(null);
        setCheckoutData({
            fullName: "",
            phone: "",
            address: "",
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
        isPaying,
        appliedCoupon,
        handleAddressNext,
        handlePaymentNext,
        handlePlaceOrder,
        handleMoMoPayment,
        handleApplyCoupon,
        handleRemoveCoupon,
        goBack,
        reset,
    };
}
