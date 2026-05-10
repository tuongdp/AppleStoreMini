import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n/useTranslation";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations";
import { useChangePasswordMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const PasswordInput = ({ field, placeholder, disabled }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-10"
                {...field}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
};

export default function ChangePasswordForm() {
    const { t } = useTranslation("profile");
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [serverError, setServerError] = useState("");

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            }).unwrap();

            toast.success(t("changePassword.success"));
            form.reset();
        } catch (error) {
            const msg = error?.data?.message;
            if (msg?.includes("incorrect") || msg?.includes("wrong")) {
                setServerError(t("changePassword.wrongPassword"));
            } else {
                setServerError(msg || t("changePassword.failed"));
            }
        }
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                    {t("changePassword.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("changePassword.subtitle")}
                </p>
            </div>

            <Separator className="mb-8" />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md space-y-5"
                >
                    {/* Server error */}
                    {serverError && (
                        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {serverError}
                        </div>
                    )}

                    {/* Current password */}
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("changePassword.currentPassword")}
                                </FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        field={field}
                                        placeholder={t(
                                            "changePassword.currentPasswordPlaceholder",
                                        )}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Separator />

                    {/* New password */}
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("changePassword.newPassword")}
                                </FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        field={field}
                                        placeholder={t(
                                            "changePassword.newPasswordPlaceholder",
                                        )}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Confirm password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("changePassword.confirmPassword")}
                                </FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        field={field}
                                        placeholder={t(
                                            "changePassword.confirmPasswordPlaceholder",
                                        )}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="rounded-full px-8"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? t("changePassword.saving")
                                : t("changePassword.save")}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
