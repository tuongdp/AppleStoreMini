import { useTranslation } from "react-i18next";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Lock } from "lucide-react";

export default function PrivacyPage() {
    const { t } = useTranslation("common");

    const PRIVACY_ITEMS = [
        {
            title: t("privacy.collect.title"),
            content: [
                t("privacy.collect.0"),
                t("privacy.collect.1"),
                t("privacy.collect.2"),
                t("privacy.collect.3"),
            ],
        },
        {
            title: t("privacy.usage.title"),
            content: [
                t("privacy.usage.0"),
                t("privacy.usage.1"),
                t("privacy.usage.2"),
                t("privacy.usage.3"),
                t("privacy.usage.4"),
            ],
        },
        {
            title: t("privacy.security.title"),
            content: [
                t("privacy.security.0"),
                t("privacy.security.1"),
                t("privacy.security.2"),
                t("privacy.security.3"),
            ],
        },
        {
            title: t("privacy.sharing.title"),
            content: [
                t("privacy.sharing.0"),
                t("privacy.sharing.1"),
                t("privacy.sharing.2"),
            ],
        },
        {
            title: t("privacy.rights.title"),
            content: [
                t("privacy.rights.0"),
                t("privacy.rights.1"),
                t("privacy.rights.2"),
                t("privacy.rights.3"),
            ],
        },
    ];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb
                items={[{ label: t("privacy.breadcrumb") }]}
                className="mb-6"
            />

            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/30">
                    <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    {t("privacy.title")}
                </h1>
            </div>

            <div className="space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("privacy.intro")}
                </p>

                {PRIVACY_ITEMS.map((item) => (
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
                    {t("privacy.updated")}
                </p>
            </div>
        </div>
    );
}
