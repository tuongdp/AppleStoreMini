import { useTranslation } from "@/i18n/useTranslation";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AddressSavedList({
    addresses = [],
    selectedId,
    onSelect,
}) {
    const { t } = useTranslation("checkout");

    if (!addresses.length) return null;

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                {t("address.savedAddresses")}
            </p>
            {addresses.map((addr) => {
                // ✅ MySQL integer id — không có _id
                const isSelected = selectedId === addr.id;

                return (
                    <button
                        key={addr.id}
                        type="button"
                        onClick={() => onSelect(addr)}
                        className={cn(
                            "w-full rounded-xl border p-4 text-left transition-all",
                            isSelected
                                ? "border-foreground bg-muted/30"
                                : "border-border hover:border-foreground/30",
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {addr.fullName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {addr.phone}
                                    </span>
                                    {addr.isDefault && (
                                        <Badge
                                            variant="outline"
                                            className="border-foreground/20 px-1.5 py-0 text-xs"
                                        >
                                            <Star className="mr-1 h-2.5 w-2.5 fill-foreground" />
                                            {t("address.default", {
                                                ns: "profile",
                                            })}
                                        </Badge>
                                    )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {addr.address}, {addr.ward}, {addr.district}
                                    , {addr.province}
                                </p>
                            </div>

                            <div
                                className={cn(
                                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                                    isSelected
                                        ? "border-foreground bg-foreground"
                                        : "border-border",
                                )}
                            >
                                {isSelected && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-background" />
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
