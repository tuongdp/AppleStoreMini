import { useTranslation } from "@/i18n/useTranslation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECKOUT_STEPS } from "@/lib/constants";

export default function CheckoutStepper({ currentStep, className }) {
    const { t } = useTranslation("checkout");

    return (
        <div className={cn("flex items-center justify-center", className)}>
            {CHECKOUT_STEPS.map((step, index) => {
                const isDone = index < currentStep;
                const isCurrent = index === currentStep;
                const isLast = index === CHECKOUT_STEPS.length - 1;

                return (
                    <div key={step.key} className="flex items-center">
                        {/* Step circle + label */}
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                                    isDone &&
                                        "border-green-500 bg-green-500 text-white",
                                    isCurrent &&
                                        "border-foreground bg-foreground text-background",
                                    !isDone &&
                                        !isCurrent &&
                                        "border-border bg-background text-muted-foreground",
                                )}
                            >
                                {isDone ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    step.step
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    isCurrent && "text-foreground",
                                    isDone &&
                                        "text-green-600 dark:text-green-400",
                                    !isDone &&
                                        !isCurrent &&
                                        "text-muted-foreground",
                                )}
                            >
                                {t(`steps.${step.key}`)}
                            </span>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "mx-3 mb-5 h-0.5 w-16 transition-colors sm:w-24 md:w-32",
                                    isDone ? "bg-green-500" : "bg-border",
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
