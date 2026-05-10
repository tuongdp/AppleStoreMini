import { useTranslation } from "@/i18n/useTranslation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";

export default function ProductSort({ value, onChange }) {
    const { t } = useTranslation("product");

    return (
        <Select value={value || "featured"} onValueChange={onChange}>
            <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder={t("sort.label")} />
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
