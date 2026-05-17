import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, Eye, EyeOff, Info, MailCheck } from "lucide-react";
import { registerSchema } from "@/lib/validations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLazyCheckEmailQuery } from "@/store/api/authApi";
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
import { Separator } from "@/components/ui/separator";
import SocialLoginButtons from "./SocialLoginButtons";
import { ROUTES } from "@/lib/constants";

export default function RegisterForm() {
    const { register, registerSuccess, sendVerification, isRegisterLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const [resending, setResending] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [emailCheck, setEmailCheck] = useState(null);
    const [checkEmail, { isFetching: isCheckingEmail }] = useLazyCheckEmailQuery();

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            agreeTerms: false,
        },
    });

    const getEmailAvailability = async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) return null;

        setEmailCheck("checking");
        const response = await checkEmail(normalizedEmail).unwrap();
        if (response?.data?.exists) {
            setEmailCheck("exists");
            form.setError("email", {
                type: "manual",
                message: "Email này đã được sử dụng",
            });
            return false;
        }

        setEmailCheck("available");
        form.clearErrors("email");
        return true;
    };

    const onSubmit = async (values) => {
        setServerError("");
        if (emailCheck !== "available") {
            try {
                const isEmailAvailable = await getEmailAvailability(values.email);
                if (!isEmailAvailable) return;
            } catch {
                setEmailCheck(null);
                setServerError("Không thể kiểm tra email. Vui lòng thử lại.");
                return;
            }
        }

        const result = await register(values);
        if (result.success) {
            setRegisteredEmail(values.email);
        } else {
            setServerError(result.message);
        }
    };

    const password = form.watch("password") || "";
    const passwordRules = [
        { label: "Tối thiểu 8 ký tự", active: password.length >= 8 },
        { label: "Có ít nhất 1 chữ hoa", active: /[A-Z]/.test(password) },
        { label: "Có ít nhất 1 ký tự đặc biệt", active: /[^A-Za-z0-9]/.test(password) },
    ];

    const handleEmailBlur = async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        const isValid = await form.trigger("email");
        if (!normalizedEmail || !isValid) return;

        try {
            await getEmailAvailability(normalizedEmail);
        } catch {
            setEmailCheck(null);
        }
    };

    const handleResend = async () => {
        setResending(true);
        await sendVerification(registeredEmail);
        setResending(false);
    };

    if (registerSuccess) {
        return (
            <div className="w-full max-w-sm text-center">
                <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">
                    <MailCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="mb-2 text-xl font-semibold text-foreground">
                    {"Xác thực email"}
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    {"Email xác thực đã được gửi đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư và nhấp vào link xác thực."}
                </p>
                <p className="-mt-3 mb-5 text-xs text-muted-foreground">
                    Link xác thực hết hạn sau 24 giờ.
                </p>
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={handleResend}
                    disabled={resending}
                >
                    {resending ? "Đang gửi..." : "Gửi lại email xác thực"}
                </Button>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    {"Đã có tài khoản?"}{" "}
                    <Link to={ROUTES.LOGIN} className="font-medium text-apple-blue hover:opacity-70">
                        {"Đăng nhập"}
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            {/* Title */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Tạo tài khoản"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Tham gia cùng hàng triệu khách hàng Apple"}
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

                    {/* Full name */}
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Họ và tên"}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={"Nhập họ và tên"}
                                        autoComplete="name"
                                        disabled={isRegisterLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
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
                                        disabled={isRegisterLoading || isCheckingEmail}
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setEmailCheck(null);
                                        }}
                                        onBlur={(e) => {
                                            field.onBlur();
                                            handleEmailBlur(e.target.value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {emailCheck === "available" && !form.formState.errors.email && (
                        <p className="-mt-3 text-xs text-emerald-600">Email có thể sử dụng</p>
                    )}

                    <div className="-mt-2 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>
                            Vui lòng sử dụng email thật để nhận link kích hoạt tài khoản, thông báo đơn hàng và ưu đãi từ cửa hàng. Tài khoản chưa xác thực email trong 24 giờ sẽ được tự động xóa.
                        </p>
                    </div>

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Số điện thoại"}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        placeholder={"Nhập số điện thoại"}
                                        autoComplete="tel"
                                        disabled={isRegisterLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Mật khẩu"}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder={"Tối thiểu 8 ký tự"}
                                            autoComplete="new-password"
                                            disabled={isRegisterLoading}
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
                                <div className="mt-2 space-y-1.5">
                                    {passwordRules.map((rule) => {
                                        const Icon = rule.active ? CheckCircle2 : Circle;
                                        return (
                                            <div
                                                key={rule.label}
                                                className={`flex items-center gap-2 text-xs ${rule.active ? "text-emerald-600" : "text-muted-foreground"}`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                <span>{rule.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
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
                                    {"Xác nhận mật khẩu"}
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder={"Nhập lại mật khẩu"}
                                            autoComplete="new-password"
                                            disabled={isRegisterLoading}
                                            className="pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (v) => !v,
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? (
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

                    {/* Agree terms */}
                    <FormField
                        control={form.control}
                        name="agreeTerms"
                        render={({ field }) => (
                            <FormItem className="flex items-start gap-2.5 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isRegisterLoading}
                                    />
                                </FormControl>
                                <FormLabel className="inline text-sm font-normal leading-relaxed text-muted-foreground cursor-pointer">
                                    <span>
                                        {"Tôi đồng ý với"}{" "}
                                        <Link
                                            to="/terms"
                                            className="text-apple-blue hover:opacity-70 underline underline-offset-2 font-medium"
                                            target="_blank"
                                        >
                                            {"Điều khoản sử dụng"}
                                        </Link>{" "}
                                        {"và"}{" "}
                                        <Link
                                            to="/privacy"
                                            className="text-apple-blue hover:opacity-70 underline underline-offset-2 font-medium"
                                            target="_blank"
                                        >
                                            {"Chính sách bảo mật"}
                                        </Link>
                                    </span>
                                </FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full rounded-full"
                        disabled={isRegisterLoading || isCheckingEmail}
                    >
                        {isRegisterLoading
                            ? "Đang tạo tài khoản..."
                            : "Tạo tài khoản"}
                    </Button>
                </form>
            </Form>

            <Separator className="my-6" />

            <SocialLoginButtons />

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground">
                {"Đã có tài khoản?"}{" "}
                <Link
                    to={ROUTES.LOGIN}
                    className="font-medium text-apple-blue hover:opacity-70"
                >
                    {"Đăng nhập"}
                </Link>
            </p>
        </div>
    );
}
