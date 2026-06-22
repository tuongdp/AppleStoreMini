import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validations";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);

    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    if (!token) {
        return (
            <div className="mx-auto max-w-md space-y-6 text-center">
                <KeyRound className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold text-foreground">Link không hợp lệ</h2>
                <p className="text-sm text-muted-foreground">Thiếu token đặt lại mật khẩu. Vui lòng kiểm tra lại link trong email.</p>
                <Button asChild className="rounded-full"><Link to={ROUTES.FORGOT_PASSWORD}>Gửi lại yêu cầu</Link></Button>
            </div>
        );
    }

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await resetPassword({ token, password: values.password }).unwrap();
            setSuccess(true);
        } catch (err) {
            setServerError(err?.data?.message || "Có lỗi xảy ra");
        }
    };

    if (success) {
        return (
            <div className="mx-auto max-w-md space-y-6 text-center">
                <KeyRound className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold text-foreground">Đặt lại mật khẩu thành công</h2>
                <p className="text-sm text-muted-foreground">Mật khẩu mới của bạn đã được cập nhật. Vui lòng đăng nhập bằng mật khẩu mới.</p>
                <Button asChild className="rounded-full"><Link to={ROUTES.LOGIN}>Đăng nhập</Link></Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-foreground">Đặt lại mật khẩu</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>
                {serverError && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</div>}
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu mới" disabled={isLoading} className="pr-10" {...field} />
                                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu mới" disabled={isLoading} className="pr-10" {...field} />
                                <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Đặt lại mật khẩu
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    <Link to={ROUTES.LOGIN} className="text-apple-blue hover:underline">Quay lại đăng nhập</Link>
                </p>
            </form>
        </Form>
    );
}
