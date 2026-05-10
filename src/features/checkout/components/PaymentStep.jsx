import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Truck, Wallet, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PaymentMethodCard from "./PaymentMethodCard";
import { PAYMENT_METHODS } from "@/lib/constants";

const PAYMENT_OPTIONS = [
    {
        id: PAYMENT_METHODS.COD,
        icon: Truck,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
        id: PAYMENT_METHODS.MOMO,
        icon: Wallet,
        color: "text-pink-600",
        bgColor: "bg-pink-50 dark:bg-pink-950/30",
    },
];

export default function PaymentStep({ defaultData, onNext, onBack }) {
    const { t } = useTranslation("checkout");

    const [selectedMethod, setSelectedMethod] = useState(
        defaultData?.paymentMethod || PAYMENT_METHODS.COD,
    );

    const handleNext = () => {
        if (!selectedMethod) return;
        onNext({ paymentMethod: selectedMethod });
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="mb-5 text-base font-semibold text-foreground">
                {t("payment.title")}
            </h2>

            <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => (
                    <PaymentMethodCard
                        key={option.id}
                        method={option}
                        selected={selectedMethod === option.id}
                        onSelect={setSelectedMethod}
                    />
                ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                {t("payment.secure")}
            </div>

            <Separator className="my-5" />

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={onBack}
                >
                    {t("payment.back")}
                </Button>
                <Button
                    className="rounded-full px-8"
                    onClick={handleNext}
                    disabled={!selectedMethod}
                >
                    {t("payment.continue")}
                </Button>
            </div>
        </div>
    );
}
