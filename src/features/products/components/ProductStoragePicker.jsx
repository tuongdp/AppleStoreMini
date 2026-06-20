import { cn, formatPrice } from "@/lib/utils";

export default function ProductStoragePicker({
    storage = [],
    selectedStorage,
    onChange,
}) {
    if (!storage.length) return null;

    return (
        <div>
            <p className="mb-3 text-sm font-medium text-foreground">
                {"Chọn dung lượng"}
            </p>
            <div className="flex flex-wrap gap-2">
                {storage.map((option) => (
                    <button
                        key={option.label}
                        type="button"
                        onClick={() => (option.stock ?? 1) > 0 && onChange(option)}
                        disabled={(option.stock ?? 0) <= 0}
                        className={cn(
                            "rounded-xl border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                            selectedStorage?.label === option.label
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-foreground hover:border-foreground/50",
                            (option.stock ?? 0) <= 0 &&
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
