import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { useVerifyEmailMutation, useSendVerificationMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

const codeSchema = z.object({
    code: z.string().length(6, "Mã xác thực phải có 6 ký tự"),
});

export default function VerifyEmailPage() {
    const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
    const [sendVerification, { isLoading: isSending }] = useSendVerificationMutation();
    const [status, setStatus] = useState(null);
    const [email, setEmail] = useState("");

    const form = useForm({
        resolver: zodResolver(codeSchema),
        defaultValues: { code: "", email: "" },
    });

    const onSubmit = async (values) => {
        try {
            await verifyEmail({ code: values.code }).unwrap();
            setStatus("success");
            toast.success("Xác thực email thành công");
        } catch (err) {
            const msg = err?.data?.message;
            if (msg?.includes("đã được xác thực")) {
                setStatus("already");
            } else {
                toast.error(msg || "Mã xác thực không hợp lệ");
            }
        }
    };

    const handleResend = async () => {
        if (!email.trim()) return;
        try {
            await sendVerification({ email: email.trim() }).unwrap();
            toast.success("Đã gửi lại mã xác thực");
        } catch (err) {
            toast.error(err?.data?.message || "Không thể gửi lại mã");
        }
    };

    if (status === "success" || status === "already") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="mb-2 text-2xl font-semibold text-foreground">
                    {status === "success" ? "Xác thực email thành công!" : "Email đã được xác thực"}
                </h1>
                <p className="mb-8 text-sm text-muted-foreground">Bạn có thể đăng nhập và mua sắm ngay</p>
                <Button className="rounded-full px-8" asChild>
                    <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
            <div className="w-full max-w-sm text-center">
                <h1 className="mb-2 text-2xl font-semibold text-foreground">Xác thực email</h1>
                <p className="mb-6 text-sm text-muted-foreground">Nhập mã 6 số đã gửi đến email của bạn</p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email đã đăng ký</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Nhập email để gửi lại mã" autoComplete="email" disabled={isLoading} {...field} onChange={(e) => { field.onChange(e); setEmail(e.target.value); }} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mã xác thực</FormLabel>
                                    <FormControl>
                                        <Input maxLength={6} placeholder="000000" autoComplete="off" className="text-center text-lg tracking-[0.5em]" disabled={isLoading} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Xác thực
                        </Button>

                        <Button type="button" variant="ghost" className="w-full text-sm" disabled={isSending} onClick={handleResend}>
                            {isSending ? "Đang gửi..." : "Gửi lại mã xác thực"}
                        </Button>
                    </form>
                </Form>

                <p className="mt-4 text-center text-sm">
                    <Link to={ROUTES.LOGIN} className="font-medium text-apple-blue hover:opacity-70">Quay lại đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}
