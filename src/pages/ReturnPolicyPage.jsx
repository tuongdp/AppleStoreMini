import { useTranslation } from "@/i18n/useTranslation";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { RotateCcw } from "lucide-react";

export default function ReturnPolicyPage() {
    const { t } = useTranslation("common");

    const RETURN_ITEMS = [
        {
            title: t("returnPolicy.conditions.title"),
            content: [
                t("returnPolicy.conditions.0"),
                t("returnPolicy.conditions.1"),
                t("returnPolicy.conditions.2"),
                t("returnPolicy.conditions.3"),
            ],
        },
        {
            title: t("returnPolicy.eligible.title"),
            content: [
                t("returnPolicy.eligible.0"),
                t("returnPolicy.eligible.1"),
                t("returnPolicy.eligible.2"),
            ],
        },
        {
            title: t("returnPolicy.ineligible.title"),
            content: [
                t("returnPolicy.ineligible.0"),
                t("returnPolicy.ineligible.1"),
                t("returnPolicy.ineligible.2"),
                t("returnPolicy.ineligible.3"),
            ],
        },
        {
            title: t("returnPolicy.process.title"),
            content: [
                t("returnPolicy.process.0"),
                t("returnPolicy.process.1"),
                t("returnPolicy.process.2"),
                t("returnPolicy.process.3"),
            ],
        },
        {
            title: t("returnPolicy.refund.title"),
            content: [
                t("returnPolicy.refund.0"),
                t("returnPolicy.refund.1"),
                t("returnPolicy.refund.2"),
            ],
        },
    ];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb
                items={[{ label: t("returnPolicy.breadcrumb") }]}
                className="mb-6"
            />

            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">
                    <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    {t("returnPolicy.title")}
                </h1>
            </div>

            <div className="space-y-6">
                {RETURN_ITEMS.map((item) => (
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
                    {t("returnPolicy.updated")}
                </p>
            </div>
        </div>
    );
}
