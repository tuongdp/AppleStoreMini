import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/i18n/useTranslation";
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
    const { t } = useTranslation("auth");
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
                            ? t("login.title")
                            : t("register.title")}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">
                            {t("login.title")}
                        </TabsTrigger>
                        <TabsTrigger value="register">
                            {t("register.title")}
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
    const { t } = useTranslation("auth");
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
                            <FormLabel>{t("login.email")}</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder={t("login.emailPlaceholder")}
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
                            <FormLabel>{t("login.password")}</FormLabel>
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
                    {isLoginLoading ? t("login.submitting") : t("login.submit")}
                </Button>
            </form>
        </Form>
    );
}

// ── Register form trong modal ──────────────────────────
function RegisterFormInModal({ onSuccess }) {
    const { t } = useTranslation("auth");
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
                            <FormLabel>{t("register.fullName")}</FormLabel>
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
                            <FormLabel>{t("register.email")}</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder={t("register.emailPlaceholder")}
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
                            <FormLabel>{t("register.phone")}</FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder={t("register.phonePlaceholder")}
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
                            <FormLabel>{t("register.password")}</FormLabel>
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
                                {t("register.confirmPassword")}
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
                                {t("register.agreeTerms")}{" "}
                                <span className="text-apple-blue">
                                    {t("register.terms")}
                                </span>{" "}
                                {t("register.and")}{" "}
                                <span className="text-apple-blue">
                                    {t("register.privacy")}
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
                        ? t("register.submitting")
                        : t("register.submit")}
                </Button>
            </form>
        </Form>
    );
}
