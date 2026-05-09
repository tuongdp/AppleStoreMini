import { useTranslation } from "react-i18next";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { ShieldCheck } from "lucide-react";

export default function WarrantyPage() {
    const { t } = useTranslation("common");

    const WARRANTY_ITEMS = [
        {
            title: t("warranty.duration.title"),
            content: [
                t("warranty.duration.0"),
                t("warranty.duration.1"),
                t("warranty.duration.2"),
            ],
        },
        {
            title: t("warranty.conditions.title"),
            content: [
                t("warranty.conditions.0"),
                t("warranty.conditions.1"),
                t("warranty.conditions.2"),
                t("warranty.conditions.3"),
            ],
        },
        {
            title: t("warranty.exclusions.title"),
            content: [
                t("warranty.exclusions.0"),
                t("warranty.exclusions.1"),
                t("warranty.exclusions.2"),
                t("warranty.exclusions.3"),
                t("warranty.exclusions.4"),
            ],
        },
        {
            title: t("warranty.process.title"),
            content: [
                t("warranty.process.0"),
                t("warranty.process.1"),
                t("warranty.process.2"),
                t("warranty.process.3"),
            ],
        },
    ];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb
                items={[{ label: t("warranty.breadcrumb") }]}
                className="mb-6"
            />

            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    {t("warranty.title")}
                </h1>
            </div>

            <div className="space-y-6">
                {WARRANTY_ITEMS.map((item) => (
                    <section
                        key={item.title}
                        className="rounded-2xl border border-border bg-card p-5"
                    >
                        <h2 className="mb-3 text-base font-medium text-foreground">
                            {item.title}
                        </h2>
                        <ul className="space-y-2">
                            {item.content.map((line, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                <p className="text-xs text-muted-foreground">
                    {t("warranty.updated")}
                </p>
            </div>
        </div>
    );
}
