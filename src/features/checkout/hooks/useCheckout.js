import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useCreateOrderMutation, useCreatePaymentMutation } from "@/store/api/ordersApi";
import {
    removeCheckedOutItems,
    selectCartSelectedItems,
    selectCartSelectedStockIssues,
    selectCartSelectedTotal,
    selectCartCoupon,
    setCartCoupon,
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
    const [paymentError, setPaymentError] = useState(null);
    const [checkoutData, setCheckoutData] = useState({
        fullName: "",
        phone: "",
        address: "",
        email: "",
        paymentMethod: null,
        note: "",
    });

    const appliedCoupon = useSelector(selectCartCoupon);

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const [createPayment, { isLoading: isPaying }] = useCreatePaymentMutation();

    const shippingFee = 0;

    const discountAmount = appliedCoupon?.discountAmount ?? 0;

    const grandTotal = Math.max(0, total - discountAmount);

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
        dispatch(setCartCoupon(couponData));
    };

    const handleRemoveCoupon = () => {
        dispatch(setCartCoupon(null));
    };

    const handleOnlinePayment = async (orderId) => {
        try {
            const result = await createPayment(orderId).unwrap();
            if (result?.paymentUrl) {
                sessionStorage.setItem("pending_order_id", orderId);
                sessionStorage.setItem("pending_order_expires", String(Date.now() + 15 * 60 * 1000));
                window.location.href = result.paymentUrl;
                return true;
            }
            throw new Error(result?.message || "Không thể khởi tạo thanh toán");
        } catch (error) {
            const message = error?.data?.message || error?.message || "Không thể khởi tạo thanh toán";
            setPaymentError(message);
            toast.error("Thanh toán thất bại", {
                description: message,
            });
            return false;
        }
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
                items: items.map((item) => ({
                    variantId: item.variantId || item.product.variantId,
                    quantity: item.quantity,
                })),
            }).unwrap();

            setCreatedOrder(order);

            // Store phone for order lookup after VNPay redirect
            sessionStorage.setItem("order_phone", checkoutData.phone);
            sessionStorage.setItem("pending_order_code", order.code);

            if (checkoutData.paymentMethod === PAYMENT_METHODS.VNPAY) {
                const redirected = await handleOnlinePayment(order.id);
                if (redirected) return;
            }

            dispatch(removeCheckedOutItems(items.map((item) => item.variantId || item.product?.variantId || item.variant?.id)));

            if (checkoutData.paymentMethod === PAYMENT_METHODS.COD) {
                toast.success("Đặt hàng thành công");
            }
            setIsSuccess(true);
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
        dispatch(setCartCoupon(null));
        setPaymentError(null);
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
        grandTotal,
        canProceed,
        isLoading,
        isPaying,
        appliedCoupon,
        isAuthenticated,
        paymentError,
        handleAddressNext,
        handlePaymentNext,
        handlePlaceOrder,
        handleOnlinePayment,
        handleApplyCoupon,
        handleRemoveCoupon,
        goBack,
        reset,
    };
}
