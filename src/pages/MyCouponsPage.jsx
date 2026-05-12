import { Link } from "react-router-dom";
import { Ticket, ArrowRight, Clock, Check, AlertCircle, Copy } from "lucide-react";
import { useGetMyCouponsQuery } from "@/store/api/pointsApi";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export default function MyCouponsPage() {
    const { data: coupons, isLoading } = useGetMyCouponsQuery();

    const handleCopy = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Đã sao chép mã");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const getStatus = (coupon) => {
        if (coupon.isUsed) return { label: "Đã dùng", color: "bg-muted text-muted-foreground", icon: Check };
        if (coupon.isExpired) return { label: "Hết hạn", color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400", icon: AlertCircle };
        if (!coupon.isActive) return { label: "Đã tắt", color: "bg-muted text-muted-foreground", icon: AlertCircle };
        return { label: "Có thể dùng", color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400", icon: Check };
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    const activeCoupons = (coupons || []).filter((c) => !c.isUsed && !c.isExpired && c.isActive);
    const inactiveCoupons = (coupons || []).filter((c) => c.isUsed || c.isExpired || !c.isActive);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Mã giảm giá của tôi
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Quản lý mã giảm giá đã đổi từ điểm thưởng
                    </p>
                </div>
                <Button className="rounded-full" asChild>
                    <Link to={ROUTES.POINTS}>
                        Đổi thêm mã
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {!coupons || coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Ticket className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">Chưa có mã giảm giá</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Đổi điểm thưởng để nhận mã giảm giá cho đơn hàng của bạn
                    </p>
                    <Button className="mt-4 rounded-full" asChild>
                        <Link to={ROUTES.POINTS}>Đi đến điểm thưởng</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {activeCoupons.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                    {activeCoupons.length} mã có thể dùng
                                </Badge>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {activeCoupons.map((rc) => (
                                    <CouponCard
                                        key={rc.id}
                                        coupon={rc}
                                        onCopy={() => handleCopy(rc.code)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {inactiveCoupons.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Đã dùng / hết hạn
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {inactiveCoupons.map((rc) => (
                                    <CouponCard
                                        key={rc.id}
                                        coupon={rc}
                                        onCopy={() => handleCopy(rc.code)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CouponCard({ coupon, onCopy }) {
    const status = {
        isUsed: coupon.isUsed,
        isExpired: coupon.isExpired,
        isActive: coupon.isActive,
    };

    const getStatusInfo = () => {
        if (status.isUsed) return { label: "Đã dùng", className: "bg-muted text-muted-foreground" };
        if (status.isExpired) return { label: "Hết hạn", className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" };
        if (!status.isActive) return { label: "Đã tắt", className: "bg-muted text-muted-foreground" };
        return { label: "Có thể dùng", className: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" };
    };

    const statusInfo = getStatusInfo();
    const isDisabled = status.isUsed || status.isExpired || !status.isActive;
    const c = coupon.coupon || {};

    const discountText =
        c.discountType === "PERCENT"
            ? `Giảm ${c.discountValue}%`
            : `Giảm ${formatPrice(c.discountValue)}`;

    const maxText =
        c.discountType === "PERCENT" && c.maxDiscountAmount
            ? ` (tối đa ${formatPrice(c.maxDiscountAmount)})`
            : "";

    const minText = c.minOrderAmount
        ? `Đơn tối thiểu ${formatPrice(c.minOrderAmount)}`
        : null;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border p-4 transition-colors ${
                isDisabled ? "border-border bg-muted/30" : "border-border bg-card"
            }`}
        >
            {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                </div>
            )}

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 shrink-0 text-amber-500" />
                        <code className="text-sm font-bold tracking-wider text-foreground">
                            {coupon.code}
                        </code>
                        <Badge variant="outline" className="shrink-0 text-xs">
                            {statusInfo.label}
                        </Badge>
                    </div>

                    <p className="mt-1.5 text-sm font-medium text-foreground">
                        {discountText}{maxText}
                    </p>

                    {c.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {c.description}
                        </p>
                    )}

                    {minText && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{minText}</p>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Đổi ngày {formatDate(coupon.redeemedAt)}
                    </div>
                </div>
            </div>

            {!isDisabled && (
                <div className="mt-3 border-t border-border pt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-full text-xs"
                        onClick={onCopy}
                    >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Sao chép mã
                    </Button>
                </div>
            )}
        </div>
    );
}
