import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
    const { t } = useTranslation("common");

    const CONTACT_INFO = [
        {
            icon: MapPin,
            label: t("contact.info.address"),
            value: t("contact.info.addressValue"),
        },
        {
            icon: Phone,
            label: t("contact.info.hotline"),
            value: t("contact.info.hotlineValue"),
        },
        {
            icon: Mail,
            label: t("contact.info.email"),
            value: t("contact.info.emailValue"),
        },
        {
            icon: Clock,
            label: t("contact.info.workingHours"),
            value: t("contact.info.workingHoursValue"),
        },
    ];

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        toast.success(t("contact.form.success"));

        setForm({
            name: "",
            email: "",
            phone: "",
            message: "",
        });
    };

    return (
        <div className="section-padding py-12">
            <div className="mx-auto max-w-5xl">
                <Breadcrumb items={[{ label: t("contact.breadcrumb") }]} className="mb-6" />

                <h1 className="mb-8 text-3xl font-semibold text-foreground">
                    {t("contact.title")}
                </h1>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Contact info */}
                    <div className="space-y-6">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {t("contact.subtitle")}
                        </p>

                        <div className="space-y-4">
                            {CONTACT_INFO.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                        <item.icon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 rounded-2xl border border-border bg-card p-6"
                    >
                        <h2 className="text-base font-medium text-foreground">
                            {t("contact.sendMessage")}
                        </h2>

                        <div className="space-y-1.5">
                            <Label htmlFor="name">{t("contact.form.name")}</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("contact.form.namePlaceholder")}
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">{t("contact.form.email")}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t("contact.form.emailPlaceholder")}
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder={t("contact.form.phonePlaceholder")}
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="message">{t("contact.form.message")}</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder={t("contact.form.messagePlaceholder")}
                                rows={4}
                                value={form.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full rounded-full">
                            {t("contact.form.submit")}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
