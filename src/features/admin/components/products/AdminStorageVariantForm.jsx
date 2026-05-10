import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const DEFAULT_STORAGE = { label: "", price: 0, inStock: true };

export default function AdminStorageVariantForm({
    storage = [],
    basePrice = 0,
    onChange,
}) {
    const [items, setItems] = useState(
        storage.length > 0 ? storage : [{ ...DEFAULT_STORAGE }],
    );

    const update = (updated) => {
        setItems(updated);
        onChange?.(updated);
    };

    const handleAdd = () => {
        update([...items, { ...DEFAULT_STORAGE, price: basePrice }]);
    };

    const handleRemove = (index) => {
        update(items.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item,
        );
        update(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                    {"Dung lượng"}
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleAdd}
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {"Thêm dung lượng"}
                </Button>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index}>
                        <div className="flex items-center gap-3">
                            {/* Label */}
                            <Input
                                placeholder={"Nhãn dung lượng"}
                                value={item.label}
                                onChange={(e) =>
                                    handleChange(index, "label", e.target.value)
                                }
                                className="w-28"
                            />

                            {/* Price */}
                            <Input
                                type="number"
                                placeholder={"Giá theo dung lượng"}
                                value={item.price}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        "price",
                                        Number(e.target.value),
                                    )
                                }
                                className="flex-1"
                            />

                            {/* In stock toggle */}
                            <div className="flex shrink-0 items-center gap-2">
                                <Switch
                                    checked={item.inStock}
                                    onCheckedChange={(val) =>
                                        handleChange(index, "inStock", val)
                                    }
                                />
                                <span className="text-xs text-muted-foreground">
                                    {item.inStock
                                        ? "Còn hàng"
                                        : "Ngừng bán"}
                                </span>
                            </div>

                            {/* Remove */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemove(index)}
                                disabled={items.length <= 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {index < items.length - 1 && (
                            <Separator className="mt-3" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
