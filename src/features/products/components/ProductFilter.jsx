import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn, formatPrice } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { PRICE_RANGES } from "@/lib/constants";
import { useState } from "react";

export default function ProductFilter({ filters, onUpdate }) {
    const { categories } = useCategories();
    const [priceRange, setPriceRange] = useState([
        filters.minPrice || 0,
        filters.maxPrice || 100000000,
    ]);

    const handlePriceCommit = (value) => {
        onUpdate("minPrice", value[0] > 0 ? value[0] : "");
        onUpdate("maxPrice", value[1] < 100000000 ? value[1] : "");
    };

    return (
        <div className="space-y-6">
            {/* Category */}
            <div>
                <h3 className="mb-3 text-sm font-medium text-foreground">
                    {"Danh mục"}
                </h3>
                <div className="space-y-0.5">
                    <button
                        onClick={() => onUpdate("category", "")}
                        className={cn(
                            "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            !filters.category
                                ? "bg-accent font-medium text-foreground"
                                : "text-muted-foreground hover:bg-muted",
                        )}
                    >
                        {"Tất cả danh mục"}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => onUpdate("category", cat.value)}
                            className={cn(
                                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                filters.category === cat.value
                                    ? "bg-accent font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted",
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Price range */}
            <div>
                <h3 className="mb-3 text-sm font-medium text-foreground">
                    {"Khoảng giá"}
                </h3>
                <div className="space-y-3">
                    {/* Quick select */}
                    <div className="space-y-1">
                        {PRICE_RANGES.map((range, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onUpdate(
                                        "minPrice",
                                        range.min > 0 ? range.min : "",
                                    );
                                    onUpdate(
                                        "maxPrice",
                                        range.max < 999999999 ? range.max : "",
                                    );
                                    setPriceRange([range.min, range.max]);
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>

                    {/* Slider */}
                    <div className="px-1 pt-2">
                        <Slider
                            min={0}
                            max={100000000}
                            step={1000000}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            onValueCommit={handlePriceCommit}
                            className="mb-3"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatPrice(priceRange[0])}</span>
                            <span>{formatPrice(priceRange[1])}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Reset */}
            <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                onClick={() => {
                    onUpdate("category", "");
                    onUpdate("minPrice", "");
                    onUpdate("maxPrice", "");
                    setPriceRange([0, 100000000]);
                }}
            >
                {"Xoá bộ lọc"}
            </Button>
        </div>
    );
}
