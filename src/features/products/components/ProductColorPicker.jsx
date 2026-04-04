import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function ProductColorPicker({
    colors = [],
    selectedColor,
    onChange,
}) {
    const { t } = useTranslation("product");
    if (!colors.length) return null;

    return (
        <div>
            <p className="mb-3 text-sm font-medium text-foreground">
                {t("detail.selectColor")}
                {selectedColor && (
                    <span className="ml-2 font-normal text-muted-foreground">
                        {selectedColor.label}
                    </span>
                )}
            </p>
            <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                    <button
                        key={color.label}
                        type="button"
                        onClick={() => onChange(color)}
                        title={color.label}
                        className={cn(
                            "h-10 w-10 rounded-full border-2 transition-all",
                            selectedColor?.label === color.label
                                ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                : "border-transparent ring-1 ring-border hover:ring-foreground/50",
                        )}
                        style={{ backgroundColor: color.hex }}
                    />
                ))}
            </div>
        </div>
    );
}
