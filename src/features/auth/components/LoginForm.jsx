import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSendVerificationMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import SocialLoginButtons from "./SocialLoginButtons";
import { ROUTES } from "@/lib/constants";

export default function LoginForm() {
    const { login, isLoginLoading } = useAuth();
    const [sendVerification] = useSendVerificationMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const [resending, setResending] = useState(false);

    const from = location.state?.from || ROUTES.HOME;

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (values) => {
        setServerError("");
        localStorage.setItem("rememberMe", values.rememberMe ? "true" : "false");
        const result = await login(values);

        if (result.success) {
            toast.success("Đăng nhập thành công");
            navigate(from, { replace: true });
        } else {
            setServerError(result.message);
        }
    };

    const handleResendVerification = async () => {
        const email = form.getValues("email");
        if (!email) return toast.error("Vui lòng nhập email trước");
        setResending(true);
        try {
            await sendVerification({ email }).unwrap();
            toast.success("Email xác thực đã được gửi lại");
        } catch (err) {
            toast.error(err?.data?.message || "Gửi email thất bại");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Đăng nhập"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Chào mừng bạn quay trở lại"}
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

                    {serverError?.includes("xác thực email") && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <p className="font-medium">{"Email của bạn chưa được xác thực."}</p>
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={resending}
                                        className="mt-1 text-apple-blue hover:opacity-70 disabled:opacity-50"
                                    >
                                        {resending ? "Đang gửi..." : "Gửi lại email xác thực"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Email"}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder={"Nhập địa chỉ email"}
                                        autoComplete="email"
                                        disabled={isLoginLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>{"Mật khẩu"}</FormLabel>
                                    <Link
                                        to={ROUTES.FORGOT_PASSWORD}
                                        className="text-xs text-apple-blue hover:opacity-70"
                                        tabIndex={-1}
                                    >
                                        {"Quên mật khẩu?"}
                                    </Link>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder={"Nhập mật khẩu"}
                                            autoComplete="current-password"
                                            disabled={isLoginLoading}
                                            className="pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Ẩn mật khẩu"
                                                    : "Hiện mật khẩu"
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
                        name="rememberMe"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoginLoading}
                                    />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                    {"Ghi nhớ đăng nhập"}
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full rounded-full"
                        disabled={isLoginLoading}
                    >
                        {isLoginLoading
                            ? "Đang đăng nhập..."
                            : "Đăng nhập"}
                    </Button>
                </form>
            </Form>

            <SocialLoginButtons />

            <p className="mt-6 text-center text-sm text-muted-foreground">
                {"Chưa có tài khoản?"}{" "}
                <Link
                    to={ROUTES.REGISTER}
                    className="font-medium text-apple-blue hover:opacity-70"
                >
                    {"Đăng ký ngay"}
                </Link>
            </p>
        </div>
    );
}
