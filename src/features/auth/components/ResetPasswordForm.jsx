import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

const schema = z.object({
    code: z.string().length(6, "Mã xác nhận phải có 6 ký tự"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((d) => d.password === d.confirmPassword, { message: "Mật khẩu không khớp", path: ["confirmPassword"] });

export default function ResetPasswordForm() {
    const navigate = useNavigate();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState("");

    const form = useForm({ resolver: zodResolver(schema), defaultValues: { code: "", password: "", confirmPassword: "" } });

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await resetPassword({ code: values.code, newPassword: values.password }).unwrap();
            setIsSuccess(true);
            toast.success("Đặt lại mật khẩu thành công");
            setTimeout(() => navigate(ROUTES.LOGIN), 3000);
        } catch (err) {
            const msg = err?.data?.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn";
            toast.error(msg);
            setServerError(msg);
        }
    };

    if (isSuccess) {
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

    return (
        <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-foreground">Đặt lại mật khẩu</h1>
                <p className="mt-1 text-sm text-muted-foreground">Nhập mã xác nhận và mật khẩu mới</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {serverError && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</div>}

                    <FormField control={form.control} name="code" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mã xác nhận</FormLabel>
                            <FormControl><Input maxLength={6} placeholder="000000" className="text-center text-lg tracking-[0.5em]" autoComplete="off" disabled={isLoading} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <FormControl><Input type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" disabled={isLoading} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Xác nhận mật khẩu</FormLabel>
                            <FormControl><Input type="password" placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" disabled={isLoading} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
