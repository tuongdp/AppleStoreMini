import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

const emailSchema = z.object({ email: z.string().email("Email không hợp lệ") });

const resetSchema = z.object({
    code: z.string().length(6, "Mã xác nhận phải có 6 ký tự"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((d) => d.password === d.confirmPassword, { message: "Mật khẩu không khớp", path: ["confirmPassword"] });

export default function ForgotPasswordForm() {
    const navigate = useNavigate();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
    const [step, setStep] = useState(0); // 0=email, 1=otp, 2=success
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [serverError, setServerError] = useState("");

    const emailForm = useForm({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });
    const resetForm = useForm({ resolver: zodResolver(resetSchema), defaultValues: { code: "", password: "", confirmPassword: "" } });

    const handleSendCode = async (values) => {
        setServerError("");
        try {
            await forgotPassword(values.email).unwrap();
            setSubmittedEmail(values.email);
            setStep(1);
            toast.success("Đã gửi mã xác nhận đến email");
        } catch (error) {
            setServerError(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleReset = async (values) => {
        setServerError("");
        try {
            await resetPassword({ code: values.code, newPassword: values.password }).unwrap();
            setStep(2);
            toast.success("Đặt lại mật khẩu thành công");
            setTimeout(() => navigate(ROUTES.LOGIN), 3000);
        } catch (error) {
            const msg = error?.data?.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn";
            toast.error(msg);
            setServerError(msg);
        }
    };

    if (step === 2) {
        return (
            <div className="w-full max-w-sm text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <h1 className="mb-2 text-2xl font-semibold text-foreground">Đặt lại mật khẩu thành công</h1>
                <p className="mb-6 text-sm text-muted-foreground">Bạn có thể đăng nhập với mật khẩu mới</p>
                <Button className="w-full rounded-full" onClick={() => navigate(ROUTES.LOGIN)}>Đăng nhập</Button>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="w-full max-w-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Đặt lại mật khẩu</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Nhập mã xác nhận gửi đến {submittedEmail}</p>
                </div>
                <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                        {serverError && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</div>}

                        <FormField control={resetForm.control} name="code" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã xác nhận<span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input maxLength={6} placeholder="000000" className="text-center text-lg tracking-[0.5em]" autoComplete="off" disabled={isResetting} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={resetForm.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu mới<span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" disabled={isResetting} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={resetForm.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Xác nhận mật khẩu mới<span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input type="password" placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" disabled={isResetting} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Button type="submit" className="w-full rounded-full" disabled={isResetting}>
                            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Đặt lại mật khẩu
                        </Button>
                    </form>
                </Form>
                <p className="mt-6 text-center text-sm">
                    <Link to={ROUTES.LOGIN} className="font-medium text-apple-blue hover:opacity-70">Quay lại đăng nhập</Link>
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-foreground">Quên mật khẩu</h1>
                <p className="mt-1 text-sm text-muted-foreground">Nhập email để nhận mã xác nhận</p>
            </div>
            <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-4">
                    {serverError && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</div>}
                    <FormField control={emailForm.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email<span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input type="email" placeholder="Nhập địa chỉ email" autoComplete="email" disabled={isLoading} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Gửi mã xác nhận
                    </Button>
                </form>
            </Form>
            <p className="mt-6 text-center text-sm">
                <Link to={ROUTES.LOGIN} className="font-medium text-apple-blue hover:opacity-70">Quay lại đăng nhập</Link>
            </p>
        </div>
    );
}
