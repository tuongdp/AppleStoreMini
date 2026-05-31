import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { clearCart } from "@/store/cartSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useSwitchToCodMutation } from "@/store/api/ordersApi";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function PaymentResult({ status }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(null);
    const [orderCode, setOrderCode] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [switchOpen, setSwitchOpen] = useState(false);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [switchToCod, { isLoading: isSwitching }] = useSwitchToCodMutation();

    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const isVnpay = vnpResponseCode !== null;

    useEffect(() => {
        if (isVnpay) {
            setIsLoading(true);
            const params = new URLSearchParams(window.location.search);
            const apiBase = import.meta.env.VITE_API_URL || "/api";
            fetch(`${apiBase}/payment/vnpay-return?${params.toString()}`)
                .then((res) => res.json())
                .then((data) => {
                    const success = data?.data?.isSuccess ?? data?.data?.isVerified ?? false;
                    setIsSuccess(success);
                    if (data?.data?.orderCode) {
                        setOrderCode(data.data.orderCode);
                    }
                    if (data?.data?.orderId) {
                        setOrderId(data.data.orderId);
                    }
                    if (success) {
                        dispatch(clearCart());
                    }
                })
                .catch(() => {
                    setIsSuccess(false);
                })
                .finally(() => setIsLoading(false));
        } else {
            const resultCode = searchParams.get("resultCode");
            setIsSuccess(resultCode !== null ? resultCode === "0" : status === "success");
        }
    }, [isVnpay, searchParams, status, dispatch]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Đang xác thực kết quả thanh toán...</p>
            </div>
        );
    }

    const trackLink = isAuthenticated || !orderCode
        ? ROUTES.ORDERS
        : `${ROUTES.ORDER_LOOKUP}?code=${encodeURIComponent(orderCode)}`;

    const handleSwitchToCod = async () => {
        try {
            await switchToCod(orderId).unwrap();
            toast.success("Đã chuyển sang COD. Vui lòng thanh toán khi nhận hàng.");
            setSwitchOpen(false);
            setIsSuccess(true);
        } catch {
            toast.error("Không thể chuyển sang COD");
        }
    };

    const handleRetry = () => {
        if (orderId && isAuthenticated) {
            navigate(`${ROUTES.ORDERS}/${orderId}`);
        } else if (orderCode) {
            navigate(`${ROUTES.ORDER_LOOKUP}?code=${encodeURIComponent(orderCode)}`);
        }
    };

    return (
        <>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                isSuccess ? "bg-green-100 dark:bg-green-950/30" : "bg-red-100 dark:bg-red-950/30"
            }`}>
                {isSuccess ? (
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                ) : (
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
                {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className="mb-8 text-sm text-muted-foreground">
                {isSuccess ? "Cảm ơn bạn, đơn hàng đã được thanh toán." : "Có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                {isSuccess ? (
                    <>
                        <Button className="rounded-full px-8" asChild>
                            <Link to={trackLink}>Theo dõi đơn hàng</Link>
                        </Button>
                        <Button variant="outline" className="rounded-full px-8" asChild>
                            <Link to={ROUTES.PRODUCTS}>Tiếp tục mua sắm</Link>
                        </Button>
                    </>
                ) : isVnpay ? (
                    <>
                        <Button className="rounded-full px-6" onClick={handleRetry}>
                            Thử lại VNPAY
                        </Button>
                        <Button variant="secondary" className="rounded-full px-6" onClick={() => setSwitchOpen(true)}>
                            <ArrowRight className="mr-1.5 h-4 w-4" />
                            Chuyển sang COD
                        </Button>
                        <Button variant="outline" className="rounded-full px-6" asChild>
                            <Link to={ROUTES.PRODUCTS}>Tiếp tục mua sắm</Link>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button className="rounded-full px-8" asChild>
                            <Link to={trackLink}>Theo dõi đơn hàng</Link>
                        </Button>
                        <Button variant="outline" className="rounded-full px-8" asChild>
                            <Link to={ROUTES.PRODUCTS}>Tiếp tục mua sắm</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>

        <ConfirmDialog
            open={switchOpen}
            onOpenChange={(open) => { if (!open) setSwitchOpen(false); }}
            title="Chuyển sang thanh toán COD"
            description={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Bạn sẽ chuyển đơn hàng <span className="font-mono font-medium text-foreground">#{orderCode}</span> từ VNPAY sang COD.</p>
                    <p>Vui lòng thanh toán bằng tiền mặt khi nhận hàng.</p>
                </div>
            }
            confirmLabel="Xác nhận chuyển COD"
            onConfirm={handleSwitchToCod}
            isLoading={isSwitching}
        />
        </>
    );
}
