import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const DEFAULT_COLOR = { name: "", images: [] };

export default function AdminColorVariantForm({ colors = [], onChange }) {
    const [items, setItems] = useState(
        colors.length > 0 ? colors : [{ ...DEFAULT_COLOR }],
    );

    const update = (updated) => {
        setItems(updated);
        onChange?.(updated);
    };

    const handleAdd = () => {
        update([...items, { ...DEFAULT_COLOR }]);
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
                    {"Màu sắc"}
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleAdd}
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {"Thêm màu"}
                </Button>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index}>
                        <div className="flex items-center gap-3">
                            {/* Color name */}
                            <Input
                                placeholder={"Tên màu"}
                                value={item.name}
                                onChange={(e) =>
                                    handleChange(index, "name", e.target.value)
                                }
                                className="flex-1"
                            />

                            {/* Hex input */}
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
