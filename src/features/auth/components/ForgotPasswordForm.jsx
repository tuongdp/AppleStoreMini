import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";
import { useForgotPasswordMutation } from "@/store/api/authApi";
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

export default function ForgotPasswordForm() {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [serverError, setServerError] = useState("");

    const form = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await forgotPassword(values.email).unwrap();
            setSubmittedEmail(values.email);
            setIsSuccess(true);
        } catch (error) {
            setServerError(
                error?.data?.message || "Email này chưa được đăng ký",
            );
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
                    {"Email đặt lại mật khẩu đã được gửi"}
                </h1>
                <p className="mb-1 text-sm text-muted-foreground">
                    {"Vui lòng kiểm tra hộp thư của bạn"}
                </p>
                <p className="mb-8 text-sm font-medium text-foreground">
                    {submittedEmail}
                </p>
                <Link
                    to={ROUTES.LOGIN}
                    className="text-sm font-medium text-apple-blue hover:opacity-70"
                >
                    {"Quay lại đăng nhập"}
                </Link>
            </div>
        );
    }

    // ── Form state ─────────────────────────────────────
    return (
        <div className="w-full max-w-sm">
            {/* Title */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quên mật khẩu"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Nhập email để nhận link đặt lại mật khẩu"}
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* Server error */}
                    {serverError && (
                        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {serverError}
                        </div>
                    )}

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {"Email"}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder={"Nhập địa chỉ email"}
                                        autoComplete="email"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Đang gửi..."
                            : "Gửi link đặt lại"}
                    </Button>
                </form>
            </Form>

            {/* Back to login */}
            <p className="mt-6 text-center text-sm">
                <Link
                    to={ROUTES.LOGIN}
                    className="font-medium text-apple-blue hover:opacity-70"
                >
                    {"Quay lại đăng nhập"}
                </Link>
            </p>
        </div>
    );
}
