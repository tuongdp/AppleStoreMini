import { useTranslation } from "react-i18next";
import { cn, formatPrice } from "@/lib/utils";

export default function ProductStoragePicker({
    storage = [],
    selectedStorage,
    onChange,
}) {
    const { t } = useTranslation("product");

    if (!storage.length) return null;

    return (
        <div>
            <p className="mb-3 text-sm font-medium text-foreground">
                {t("detail.selectStorage")}
            </p>
            <div className="flex flex-wrap gap-2">
                {storage.map((option) => (
                    <button
                        key={option.label}
                        type="button"
                        onClick={() => option.inStock && onChange(option)}
                        disabled={!option.inStock}
                        className={cn(
                            "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                            selectedStorage?.label === option.label
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-foreground hover:border-foreground/50",
                            !option.inStock &&
                                "cursor-not-allowed opacity-40 line-through",
                        )}
                    >
                        {option.label}
                        {option.price && (
                            <span className="ml-1.5 text-xs opacity-70">
                                {formatPrice(option.price)}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
