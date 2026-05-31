import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, Eye, EyeOff, Info, Loader2, MailCheck } from "lucide-react";
import { registerSchema } from "@/lib/validations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLazyCheckEmailQuery, useVerifyEmailMutation, useSendVerificationMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import SocialLoginButtons from "./SocialLoginButtons";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { z } from "zod";

const otpSchema = z.object({ code: z.string().length(6, "Vui long nhap du 6 ky tu") });

export default function RegisterForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { register, registerSuccess, sendVerification, isRegisterLoading } = useAuth();
    const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
    const [resendOtp, { isLoading: isResending }] = useSendVerificationMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [emailCheck, setEmailCheck] = useState(null);
    const [checkEmail, { isFetching: isCheckingEmail }] = useLazyCheckEmailQuery();

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "", agreeTerms: false },
    });

    const otpForm = useForm({ resolver: zodResolver(otpSchema), defaultValues: { code: "" } });

    const getEmailAvailability = async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) return null;
        setEmailCheck("checking");
        const response = await checkEmail(normalizedEmail).unwrap();
        if (response?.data?.exists) {
            setEmailCheck("exists");
            form.setError("email", { type: "manual", message: "Email nay da duoc su dung" });
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
                setServerError("Khong the kiem tra email. Vui long thu lai.");
                return;
            }
        }
        const result = await register(values);
        if (result.success) {
            setRegisteredEmail(values.email);
            setOtpOpen(true);
        } else {
            setServerError(result.message);
        }
    };

    const handleVerifyOtp = async (values) => {
        setOtpError("");
        try {
            const result = await verifyEmail({ code: values.code }).unwrap();
            const data = result?.data || result;
            dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }));
            toast.success("Xac thuc thanh cong");
            setOtpOpen(false);
            navigate(ROUTES.HOME);
        } catch (err) {
            setOtpError(err?.data?.message || "Ma xac thuc khong hop le hoac da het han");
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOtp({ email: registeredEmail }).unwrap();
            toast.success("Da gui lai ma xac thuc");
        } catch {
            toast.error("Khong the gui lai ma");
        }
    };

    const password = form.watch("password") || "";
    const passwordRules = [
        { label: "Toi thieu 8 ky tu", active: password.length >= 8 },
        { label: "Co it nhat 1 chu hoa", active: /[A-Z]/.test(password) },
        { label: "Co it nhat 1 ky tu dac biet", active: /[^A-Za-z0-9]/.test(password) },
    ];

    const handleEmailBlur = async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        const isValid = await form.trigger("email");
        if (!normalizedEmail || !isValid) return;
        try { await getEmailAvailability(normalizedEmail); } catch { setEmailCheck(null); }
    };

    return (
        <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-foreground">Tao tai khoan</h1>
                <p className="mt-1 text-sm text-muted-foreground">Tham gia cung hang trieu khach hang Apple</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
                    {serverError && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</div>}

                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ho va ten</FormLabel>
                            <FormControl><Input placeholder="Nhap ho va ten" autoComplete="name" disabled={isRegisterLoading} data-testid="register-full-name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" placeholder="Nhap dia chi email" autoComplete="email" disabled={isRegisterLoading || isCheckingEmail} data-testid="register-email" {...field} onChange={(e) => { field.onChange(e); setEmailCheck(null); }} onBlur={(e) => { field.onBlur(); handleEmailBlur(e.target.value); }} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {emailCheck === "available" && !form.formState.errors.email && (
                        <p className="-mt-3 text-xs text-emerald-600">Email co the su dung</p>
                    )}

                    <div className="-mt-2 flex gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>Vui long su dung email that de nhan ma kich hoat tai khoan, thong bao don hang va uu dai tu cua hang. Tai khoan chua xac thuc email trong 24 gio se duoc tu dong xoa.</p>
                    </div>

                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>So dien thoai</FormLabel>
                            <FormControl><Input type="tel" placeholder="Nhap so dien thoai" autoComplete="tel" disabled={isRegisterLoading} data-testid="register-phone" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mat khau</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input type={showPassword ? "text" : "password"} placeholder="Toi thieu 8 ky tu" autoComplete="new-password" disabled={isRegisterLoading} className="pr-10" data-testid="register-password" {...field} />
                                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <div className="mt-2 space-y-1.5">
                                {passwordRules.map((rule) => {
                                    const Icon = rule.active ? CheckCircle2 : Circle;
                                    return <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.active ? "text-emerald-600" : "text-muted-foreground"}`}><Icon className="h-3.5 w-3.5" /><span>{rule.label}</span></div>;
                                })}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Xac nhan mat khau</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="Nhap lai mat khau" autoComplete="new-password" disabled={isRegisterLoading} className="pr-10" data-testid="register-confirm-password" {...field} />
                                    <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="agreeTerms" render={({ field }) => (
                        <FormItem className="flex items-start gap-2.5 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isRegisterLoading} /></FormControl>
                            <FormLabel className="inline text-sm font-normal leading-relaxed text-muted-foreground cursor-pointer">
                                <span>Toi dong y voi <Link to="/terms" className="text-apple-blue hover:opacity-70 underline underline-offset-2 font-medium" target="_blank">Dieu khoan su dung</Link> va <Link to="/privacy" className="text-apple-blue hover:opacity-70 underline underline-offset-2 font-medium" target="_blank">Chinh sach bao mat</Link></span>
                            </FormLabel>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button type="submit" className="w-full rounded-full" disabled={isRegisterLoading || isCheckingEmail} data-testid="register-submit">
                        {isRegisterLoading ? "Dang tao tai khoan..." : "Tao tai khoan"}
                    </Button>
                </form>
            </Form>

            <Separator className="my-6" />
            <SocialLoginButtons />

            <p className="text-center text-sm text-muted-foreground">
                Da co tai khoan? <Link to={ROUTES.LOGIN} className="font-medium text-apple-blue hover:opacity-70">Dang nhap</Link>
            </p>

            {/* OTP Modal */}
            <Dialog open={otpOpen} onOpenChange={(open) => { if (!open) setOtpOpen(false); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                            <MailCheck className="h-7 w-7 text-foreground" />
                        </div>
                        <DialogTitle className="text-center">Xac thuc email</DialogTitle>
                        <DialogDescription className="text-center">
                            Ma xac thuc 6 so da duoc gui den<br /><strong>{registeredEmail}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                            {otpError && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{otpError}</div>}

                            <FormField control={otpForm.control} name="code" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input maxLength={6} placeholder="000000" autoComplete="off" className="text-center text-2xl tracking-[0.5em]" disabled={isVerifying} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <Button type="submit" className="w-full rounded-full" disabled={isVerifying}>
                                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Xac thuc
                            </Button>

                            <Button type="button" variant="ghost" className="w-full text-sm" disabled={isResending} onClick={handleResendOtp}>
                                {isResending ? "Dang gui..." : "Gui lai ma xac thuc"}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
