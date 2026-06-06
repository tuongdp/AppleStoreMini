import { cn } from "@/lib/utils";

const PAYMENT_LABELS = {
  cod: "Thanh toán khi nhận hàng",
  vnpay: "VNPay",
};

const PAYMENT_DESCS = {
  cod: "Thanh toán bằng tiền mặt khi nhận hàng",
  vnpay: "Thanh toán qua cổng VNPay (Internet Banking, thẻ ATM, Visa/Master)",
};

export default function PaymentMethodCard({ method, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(method.id)}
            data-testid={`payment-method-${method.id}`}
            className={cn(
                "w-full rounded-xl border p-4 text-left transition-[background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                selected
                    ? "border-foreground bg-muted/30"
                    : "border-border hover:border-foreground/30",
            )}
        >
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        method.bgColor,
                    )}
                >
                    <method.icon className={cn("h-5 w-5", method.color)} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                        {PAYMENT_LABELS[method.id] || method.id}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {PAYMENT_DESCS[method.id] || ""}
                    </p>
                </div>

                <div
                    className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color] duration-200",
                        selected
                            ? "border-foreground bg-foreground"
                            : "border-border",
                    )}
                >
                    {selected && (
                        <div className="h-2 w-2 rounded-full bg-background" />
                    )}
                </div>
            </div>
        </button>
    );
}
