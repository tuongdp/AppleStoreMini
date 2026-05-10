import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { resetPasswordSchema } from "@/lib/validations";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";

export default function ResetPasswordForm() {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState("");

    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    if (!token) {
        return (
            <div className="w-full max-w-sm text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <span className="text-3xl">⚠️</span>
                    </div>
                </div>
                <h1 className="mb-2 text-2xl font-semibold text-foreground">
                    {t("resetPassword.tokenExpired")}
                </h1>
                <p className="mb-8 text-sm text-muted-foreground">
                    {t("resetPassword.tokenExpiredDesc")}
                </p>
                <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                >
                    {t("forgotPassword.submit")}
                </Button>
            </div>
        );
    }

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await resetPassword({
                token,
                newPassword: values.password,
            }).unwrap();
            setIsSuccess(true);
            toast.success(t("resetPassword.success"));
            setTimeout(() => navigate(ROUTES.LOGIN), 3000);
        } catch (error) {
            const msg = error?.data?.message || "";
            toast.error(msg || t("resetPassword.tokenExpired"));
            setServerError(msg || t("resetPassword.tokenExpired"));
        }
    };

    // ── Success state ──────────────────────────────────
    if (isSuccess) {
        return (
            <div className="w-full max-w-sm text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <h1 className="mb-2 text-2xl font-semibold text-foreground">
                    {t("resetPassword.success")}
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    {t("resetPassword.successDesc")}
                </p>
                <Button
                    className="w-full rounded-full"
                    onClick={() => navigate(ROUTES.LOGIN)}
                >
                    {t("login.submit")}
                </Button>
            </div>
        );
    }

    // ── Form state ─────────────────────────────────────
    return (
        <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                    {t("resetPassword.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("resetPassword.subtitle")}
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {serverError && (
                        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {serverError}
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("resetPassword.password")}
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder={t(
                                                "resetPassword.passwordPlaceholder",
                                            )}
                                            autoComplete="new-password"
                                            disabled={isLoading}
                                            className="pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("resetPassword.confirmPassword")}
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showConfirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder={t(
                                                "resetPassword.confirmPasswordPlaceholder",
                                            )}
                                            autoComplete="new-password"
                                            disabled={isLoading}
                                            className="pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirm((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? t("resetPassword.submitting")
                            : t("resetPassword.submit")}
                    </Button>
                </form>
            </Form>

            <p className="mt-6 text-center text-sm">
                <Link
                    to={ROUTES.LOGIN}
                    className="font-medium text-apple-blue hover:opacity-70"
                >
                    {t("forgotPassword.backToLogin")}
                </Link>
            </p>
        </div>
    );
}
