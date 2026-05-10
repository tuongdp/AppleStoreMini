import { useState } from "react";
import { Tag, X, CheckCircle2, Loader2 } from "lucide-react";
import { useApplyCouponMutation } from "@/store/api/couponsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

/**
 * CouponInput — nhập và áp dụng mã giảm giá ở CheckoutPage
 *
 * Props:
 *   orderTotal   — tổng tiền đơn hàng (để validate minOrderAmount)
 *   onApply      — (couponData) => void — trả về { code, discountAmount, finalTotal }
 *   onRemove     — () => void
 *   appliedCoupon — coupon đang được áp dụng
 */
export default function CouponInput({
    orderTotal,
    onApply,
    onRemove,
    appliedCoupon,
}) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [applyCoupon, { isLoading }] = useApplyCouponMutation();

    const handleApply = async () => {
        if (!code.trim()) return;
        setError("");

        try {
            const response = await applyCoupon({
                code: code.trim().toUpperCase(),
                orderTotal,
            }).unwrap();

            onApply?.(response);
            setCode("");
        } catch (err) {
            setError(err?.data?.message || "Mã giảm giá không hợp lệ");
        }
    };

    const handleRemove = () => {
        setError("");
        setCode("");
        onRemove?.();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
        }
    };

    // Đã áp dụng coupon
    if (appliedCoupon) {
        return (
            <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                    <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            <code className="font-bold">
                                {appliedCoupon.code}
                            </code>                            {" "}
                            — Giảm {formatPrice(appliedCoupon.discountAmount)}
                        </p>
                        {appliedCoupon.description && (
                            <p className="text-xs text-green-600/70 dark:text-green-400/70">
                                {appliedCoupon.description}
                            </p>
                        )}
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-green-600 hover:text-green-700 dark:text-green-400"
                    onClick={handleRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={"Nhập mã giảm giá"}
                        className="pl-9 uppercase"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 rounded-full px-5"
                    onClick={handleApply}
                    disabled={isLoading || !code.trim()}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Áp dụng"
                    )}
                </Button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
