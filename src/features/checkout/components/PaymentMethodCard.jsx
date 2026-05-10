import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

export default function PaymentMethodCard({ method, selected, onSelect }) {
    const { t } = useTranslation("checkout");

    return (
        <button
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
                "w-full rounded-xl border p-4 text-left transition-all",
                selected
                    ? "border-foreground bg-muted/30"
                    : "border-border hover:border-foreground/30",
            )}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        method.bgColor,
                    )}
                >
                    <method.icon className={cn("h-5 w-5", method.color)} />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                        {t(`payment.${method.id}`)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {t(`payment.${method.id}Desc`)}
                    </p>
                </div>

                {/* Radio indicator */}
                <div
                    className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
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
