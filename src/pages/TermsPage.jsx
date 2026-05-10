import { useTranslation } from "@/i18n/useTranslation";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { FileText } from "lucide-react";

export default function TermsPage() {
    const { t } = useTranslation("common");

    const TERMS_ITEMS = [
        {
            title: t("terms.s1.title"),
            content: [
                t("terms.s1.0"),
                t("terms.s1.1"),
                t("terms.s1.2"),
            ],
        },
        {
            title: t("terms.s2.title"),
            content: [
                t("terms.s2.0"),
                t("terms.s2.1"),
                t("terms.s2.2"),
                t("terms.s2.3"),
            ],
        },
        {
            title: t("terms.s3.title"),
            content: [
                t("terms.s3.0"),
                t("terms.s3.1"),
                t("terms.s3.2"),
                t("terms.s3.3"),
            ],
        },
        {
            title: t("terms.s4.title"),
            content: [
                t("terms.s4.0"),
                t("terms.s4.1"),
                t("terms.s4.2"),
            ],
        },
        {
            title: t("terms.s5.title"),
            content: [
                t("terms.s5.0"),
                t("terms.s5.1"),
                t("terms.s5.2"),
            ],
        },
        {
            title: t("terms.s6.title"),
            content: [
                t("terms.s6.0"),
                t("terms.s6.1"),
            ],
        },
    ];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb
                items={[{ label: t("terms.breadcrumb") }]}
                className="mb-6"
            />

            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/30">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    {t("terms.title")}
                </h1>
            </div>

            <div className="space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("terms.intro")}
                </p>

                {TERMS_ITEMS.map((item) => (
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
                    {t("terms.updated")}
                </p>
            </div>
        </div>
    );
}
