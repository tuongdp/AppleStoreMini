import { useState } from "react";
import { Link } from "react-router-dom";
import { Tag, X, CheckCircle2, Loader2, LogIn } from "lucide-react";
import { useApplyCouponMutation } from "@/store/api/couponsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const getCouponErrorMessage = (err) => {
    const message = err?.data?.message || err?.error;
    if (message) return message;
    if (err?.status === 404) return "Mã giảm giá không tồn tại";
    return "Mã giảm giá không hợp lệ";
};

export default function CouponInput({
    orderTotal,
    onApply,
    onRemove,
    appliedCoupon,
    isAuthenticated = false,
}) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [applyCoupon, { isLoading }] = useApplyCouponMutation();

    const handleApply = async () => {
        const normalizedCode = code.trim().toUpperCase();
        if (!normalizedCode) {
            setError("Vui lòng nhập mã giảm giá");
            return;
        }

        setError("");
        try {
            const response = await applyCoupon({
                code: normalizedCode,
                orderTotal,
            }).unwrap();

            onApply?.(response);
            setCode("");
        } catch (err) {
            setError(getCouponErrorMessage(err));
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

    if (appliedCoupon) {
        return (
            <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex min-w-0 items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            <code className="font-bold">{appliedCoupon.code}</code>{" "}
                            - Giảm {formatPrice(appliedCoupon.discountAmount)}
                        </p>
                        {appliedCoupon.description && (
                            <p className="truncate text-xs text-green-600/70 dark:text-green-400/70">
                                {appliedCoupon.description}
                            </p>
                        )}
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700 dark:text-green-400"
                    onClick={handleRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LogIn className="h-4 w-4 shrink-0" />
                    <span>
                        Vui lòng{" "}
                        <Link to={ROUTES.LOGIN} className="font-medium text-primary underline underline-offset-2 hover:text-primary/80">
                            đăng nhập
                        </Link>{" "}
                        để sử dụng mã giảm giá
                    </span>
                </div>
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
                        placeholder="Nhập mã giảm giá"
                        className="pl-9 uppercase"
                        disabled={isLoading}
                        aria-invalid={!!error}
                        data-testid="coupon-code-input"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 rounded-full px-5"
                    onClick={handleApply}
                    disabled={isLoading}
                    data-testid="coupon-apply-button"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Áp dụng"
                    )}
                </Button>
            </div>
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
}
