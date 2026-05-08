import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCard({
    titleKey,
    value,
    change,
    iconColor,
    iconBg,
}) {
    const { t } = useTranslation("admin");

    return (
        <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t(titleKey)}
                </CardTitle>
                <div
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        iconBg,
                    )}
                >
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">
                    {value}
                </div>
                {change !== undefined && change !== 0 && (
                    <div
                        className={cn(
                            "mt-1 flex items-center gap-1 text-xs",
                            change > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-500",
                        )}
                    >
                        {change > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(change)}% {t("dashboard.vsLastMonth")}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
