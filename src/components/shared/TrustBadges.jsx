import { useTranslation } from "react-i18next";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

const BADGES = [
    { icon: Truck, titleKey: "trust.freeShipping", descKey: "trust.freeShippingDesc" },
    { icon: ShieldCheck, titleKey: "trust.warranty", descKey: "trust.warrantyDesc" },
    { icon: RotateCcw, titleKey: "trust.returns", descKey: "trust.returnsDesc" },
];

export default function TrustBadges() {
    const { t } = useTranslation("common");

    return (
        <div className="border-t border-border">
            <div className="section-padding py-6 md:py-8">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {BADGES.map((badge) => (
                            <div
                                key={badge.titleKey}
                                className="flex items-center justify-center gap-3"
                            >
                                <badge.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {t(badge.titleKey)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t(badge.descKey)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
