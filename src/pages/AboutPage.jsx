import { useTranslation } from "react-i18next";
import Breadcrumb from "@/components/shared/Breadcrumb";

export default function AboutPage() {
    const { t } = useTranslation("common");
    const values = [0, 1, 2, 3, 4];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb items={[{ label: t("about.breadcrumb") }]} className="mb-6" />

            <h1 className="mb-8 text-3xl font-semibold text-foreground">
                {t("about.title")}
            </h1>

            <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {t("about.whoWeAre")}
                    </h2>
                    <p>{t("about.whoWeAreDesc")}</p>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {t("about.mission")}
                    </h2>
                    <p>{t("about.missionDesc")}</p>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {t("about.coreValues")}
                    </h2>
                    <ul className="list-inside list-disc space-y-2">
                        {values.map((i) => (
                            <li key={i}>{t(`about.values.${i}`)}</li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {t("about.contact")}
                    </h2>
                    <ul className="space-y-1">
                        <li>{t("about.address")}</li>
                        <li>{t("about.email")}</li>
                        <li>{t("about.hotline")}</li>
                        <li>{t("about.workingHours")}</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
