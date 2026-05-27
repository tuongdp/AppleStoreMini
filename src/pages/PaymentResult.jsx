import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { clearCart } from "@/store/cartSlice";

export default function PaymentResult({ status }) {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(null);

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
    }, [isVnpay, searchParams, status]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Đang xác thực kết quả thanh toán...</p>
            </div>
        );
    }

    return (
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
            <div className="flex gap-3">
                <Button className="rounded-full px-8" asChild>
                    <Link to={ROUTES.ORDERS}>{"Theo dõi đơn hàng"}</Link>
                </Button>
                <Button variant="outline" className="rounded-full px-8" asChild>
                    <Link to={ROUTES.PRODUCTS}>{"Tiếp tục mua sắm"}</Link>
                </Button>
            </div>
        </div>
    );
}
