import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import { useCreateOrderMutation, useCreatePaymentMutation } from "@/store/api/ordersApi";
import { useGetMyPointsQuery } from "@/store/api/pointsApi";
import {
    removeCheckedOutItems,
    selectCartSelectedItems,
    selectCartSelectedStockIssues,
    selectCartSelectedTotal,
} from "@/store/cartSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { PAYMENT_METHODS } from "@/lib/constants";

export function useCheckout() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const items = useSelector(selectCartSelectedItems);
    const total = useSelector(selectCartSelectedTotal);
    const stockIssues = useSelector(selectCartSelectedStockIssues);

    const [currentStep, setCurrentStep] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [checkoutData, setCheckoutData] = useState({
        fullName: "",
        phone: "",
        address: "",
        email: "",
        paymentMethod: null,
        note: "",
    });

    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [usePoints, setUsePoints] = useState(false);

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const [createPayment, { isLoading: isPaying }] = useCreatePaymentMutation();
    const { data: pointsData } = useGetMyPointsQuery(isAuthenticated ? undefined : skipToken);

    const shippingFee = 0;

    const discountAmount = appliedCoupon?.discountAmount ?? 0;
    const availablePoints = pointsData?.points ?? 0;
    const pointsDiscount = usePoints ? Math.min(availablePoints, Math.max(0, total - discountAmount)) : 0;

    const grandTotal = Math.max(0, total - discountAmount - pointsDiscount);

    const canProceed = items.length > 0 && stockIssues.length === 0;

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

    const handleOnlinePayment = async (orderId) => {
        try {
            const result = await createPayment(orderId).unwrap();
            if (result?.paymentUrl) {
                window.location.href = result.paymentUrl;
                return true;
            }
        } catch (error) {
            toast.error("Thanh toán thất bại", {
                description: error?.data?.message,
            });
        }
        return false;
    };

    const handlePlaceOrder = async () => {
        if (items.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }
        if (stockIssues.length > 0) {
            toast.error("Có sản phẩm không đủ số lượng", {
                description: "Vui lòng giảm số lượng hoặc bỏ chọn sản phẩm không đủ tồn kho.",
            });
            return;
        }
        if (!checkoutData.paymentMethod) {
            toast.error("Đặt hàng thất bại, vui lòng thử lại");
            return;
        }

        try {
            const order = await createOrder({
                fullName: checkoutData.fullName,
                phone: checkoutData.phone,
                address: checkoutData.address,
                email: checkoutData.email || undefined,
                paymentMethod: checkoutData.paymentMethod,
                note: checkoutData.note || "",
                couponCode: appliedCoupon?.code || undefined,
                usePoints,
                items: items.map((item) => ({
                    variantId: item.variantId || item.product.variantId,
                    quantity: item.quantity,
                })),
            }).unwrap();

            setCreatedOrder(order);
            dispatch(removeCheckedOutItems(items.map((item) => item.variantId || item.product?.variantId || item.variant?.id)));

            if (checkoutData.paymentMethod === PAYMENT_METHODS.VNPAY) {
                const redirected = await handleOnlinePayment(order.id);
                if (redirected) return;
            }

            setIsSuccess(true);
            if (checkoutData.paymentMethod === PAYMENT_METHODS.COD) {
                toast.success("Đặt hàng thành công");
            }
        } catch (error) {
            toast.error("Đặt hàng thất bại, vui lòng thử lại", {
                description: error?.data?.message,
            });
        }
    };

    const reset = () => {
        setCurrentStep(0);
        setIsSuccess(false);
        setCreatedOrder(null);
        setAppliedCoupon(null);
        setUsePoints(false);
        setCheckoutData({
            fullName: "",
            phone: "",
            address: "",
            email: "",
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
        availablePoints,
        pointsDiscount,
        usePoints,
        grandTotal,
        canProceed,
        isLoading,
        isPaying,
        appliedCoupon,
        isAuthenticated,
        handleAddressNext,
        handlePaymentNext,
        handlePlaceOrder,
        handleOnlinePayment,
        handleApplyCoupon,
        handleRemoveCoupon,
        setUsePoints,
        goBack,
        reset,
    };
}
