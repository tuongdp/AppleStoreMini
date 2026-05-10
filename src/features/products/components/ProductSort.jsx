import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";

export default function ProductSort({ value, onChange }) {
    return (
        <Select value={value || "featured"} onValueChange={onChange}>
            <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder={"Sắp xếp theo"} />
            </SelectTrigger>
            <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.label)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
