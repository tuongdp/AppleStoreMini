import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";

const schema = z.object({ email: z.string().email("Email không hợp lệ") });

export default function ForgotPasswordForm() {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [sent, setSent] = useState(false);
    const [serverError, setServerError] = useState("");

    const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await forgotPassword(values).unwrap();
            setSent(true);
        } catch (err) {
            setServerError(err?.data?.message || "Có lỗi xảy ra");
        }
    };

        if (sent) {
        return (
            <div className="mx-auto max-w-md space-y-6 text-center">
                <Mail className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold text-foreground">Kiểm tra email của bạn</h2>
                <p className="text-sm text-muted-foreground">Link đặt lại mật khẩu đã được gửi đến email. Vui lòng kiểm tra hộp thư (bao gồm spam) và nhấn vào link để tạo mật khẩu mới.</p>
                <p className="text-xs text-muted-foreground">Link có hiệu lực trong 15 phút.</p>
                <Button asChild className="rounded-full"><Link to={ROUTES.LOGIN}>Quay lại đăng nhập</Link></Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-foreground">Quên mật khẩu</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Nhập email để nhận link đặt lại mật khẩu</p>
                </div>
                {serverError && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</div>}
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@example.com" disabled={isLoading} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Gửi link đặt lại
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    <Link to={ROUTES.LOGIN} className="text-apple-blue hover:underline">Quay lại đăng nhập</Link>
                </p>
            </form>
        </Form>
    );
}
