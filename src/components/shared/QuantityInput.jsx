import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function QuantityInput({
    value = 1,
    min = 1,
    max = 99,
    onChange,
    disabled = false,
    size = "md",
    className,
}) {
    const sizes = {
        sm: {
            wrapper: "h-7 gap-0 px-0",
            btn: "h-7 w-7",
            input: "h-7 w-8 text-xs",
            icon: "h-3 w-3",
        },
        md: {
            wrapper: "h-8 gap-0 px-0",
            btn: "h-8 w-8",
            input: "h-8 w-10 text-sm",
            icon: "h-3.5 w-3.5",
        },
        lg: {
            wrapper: "h-10 gap-0 px-0",
            btn: "h-10 w-10",
            input: "h-10 w-12 text-base",
            icon: "h-4 w-4",
        },
    };

    const handleDecrease = () => {
        if (value > min) onChange(value - 1);
    };

    const handleIncrease = () => {
        if (value < max) onChange(value + 1);
    };

    const handleInputChange = (e) => {
        const newValue = parseInt(e.target.value);
        if (isNaN(newValue)) return;
        if (newValue < min) {
            onChange(min);
            return;
        }
        if (newValue > max) {
            onChange(max);
            return;
        }
        onChange(newValue);
    };

    const handleBlur = (e) => {
        const newValue = parseInt(e.target.value);
        if (isNaN(newValue) || newValue < min) onChange(min);
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-lg border border-border bg-background",
                "transition-colors hover:border-foreground/20",
                disabled && "cursor-not-allowed opacity-50 hover:border-border",
                sizes[size].wrapper,
                className,
            )}
        >
            <Button
                type="button"
                variant="ghost"
                onClick={handleDecrease}
                disabled={disabled || value <= min}
                className={cn(
                    "shrink-0 rounded-l-md border-none transition-colors",
                    "hover:bg-muted",
                    sizes[size].btn,
                )}
            >
                <Minus className={sizes[size].icon} strokeWidth={2} />
            </Button>

            <Input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={disabled}
                className={cn(
                    "rounded-none border-x border-border bg-transparent text-center font-medium",
                    "[appearance:textfield] focus-visible:ring-0",
                    "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    sizes[size].input,
                )}
            />

            <Button
                type="button"
                variant="ghost"
                onClick={handleIncrease}
                disabled={disabled || value >= max}
                className={cn(
                    "shrink-0 rounded-r-md border-none transition-colors",
                    "hover:bg-muted",
                    sizes[size].btn,
                )}
            >
                <Plus className={sizes[size].icon} strokeWidth={2} />
            </Button>
        </div>
    );
}
