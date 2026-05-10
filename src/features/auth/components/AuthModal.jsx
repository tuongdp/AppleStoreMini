import { t } from "@/i18n/useTranslation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toggleAuthModal, selectAuthModalOpen } from "@/store/uiSlice";
import { loginSchema, registerSchema } from "@/lib/validations";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AuthModal() {
    const dispatch = useDispatch();
    const open = useSelector(selectAuthModalOpen);
    const [tab, setTab] = useState("login");

    const handleClose = () => {
        dispatch(toggleAuthModal(false));
        setTimeout(() => setTab("login"), 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {tab === "login"
                            ? "Đăng nhập"
                            : "Tạo tài khoản"}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">
                            {"Đăng nhập"}
                        </TabsTrigger>
                        <TabsTrigger value="register">
                            {"Tạo tài khoản"}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-4 space-y-4">
                        <LoginFormInModal onSuccess={handleClose} />
                        <SocialLoginButtons />
                    </TabsContent>

                    <TabsContent value="register" className="mt-4">
                        <RegisterFormInModal
                            onSuccess={handleClose}
                            onSwitchToLogin={() => setTab("login")}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// ── Login form trong modal ─────────────────────────────
function LoginFormInModal({ onSuccess }) {
    const { login, isLoginLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState("");

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values) => {
        setServerError("");
        const result = await login(values);
        if (result.success) {
            onSuccess();
        } else {
            setServerError(result.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                    <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {serverError}
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
                            <FormLabel>{"Mật khẩu"}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder={t(
                                            "login.passwordPlaceholder",
                                        )}
                                        disabled={isLoginLoading}
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
                <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={isLoginLoading}
                >
                    {isLoginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
            </form>
        </Form>
    );
}

// ── Register form trong modal ──────────────────────────
function RegisterFormInModal({ onSuccess }) {
    const { register, isRegisterLoading } = useAuth();
    const [serverError, setServerError] = useState("");

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

    const onSubmit = async (values) => {
        setServerError("");
        const result = await register(values);
        if (result.success) {
            onSuccess();
        } else {
            setServerError(result.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                {serverError && (
                    <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {serverError}
                    </div>
                )}
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{"Họ và tên"}</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={t(
                                        "register.fullNamePlaceholder",
                                    )}
                                    disabled={isRegisterLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                                    disabled={isRegisterLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                                    disabled={isRegisterLoading}
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
                            <FormLabel>{"Mật khẩu"}</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder={t(
                                        "register.passwordPlaceholder",
                                    )}
                                    disabled={isRegisterLoading}
                                    {...field}
                                />
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
                                {"Xác nhận mật khẩu"}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder={t(
                                        "register.confirmPasswordPlaceholder",
                                    )}
                                    disabled={isRegisterLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                            <FormLabel className="text-xs font-normal leading-snug text-muted-foreground">
                                {"Tôi đồng ý với"}{" "}
                                <span className="text-apple-blue">
                                    {"Điều khoản sử dụng"}
                                </span>{" "}
                                {"và"}{" "}
                                <span className="text-apple-blue">
                                    {"Chính sách bảo mật"}
                                </span>
                            </FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={isRegisterLoading}
                >
                    {isRegisterLoading
                        ? "Đang tạo tài khoản..."
                        : "Tạo tài khoản"}
                </Button>
            </form>
        </Form>
    );
}
