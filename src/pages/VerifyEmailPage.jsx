import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { useVerifyEmailQuery, useSendVerificationMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { useState } from "react";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [email, setEmail] = useState("");
    const [sendVerification, { isLoading: isSending }] = useSendVerificationMutation();

    const { data, isLoading, isError, error } = useVerifyEmailQuery(token, { skip: !token });

    useEffect(() => {
        if (data) toast.success("Xác thực email thành công");
    }, [data]);

    const handleResend = async () => {
        if (!email.trim()) return;
        try {
            await sendVerification({ email: email.trim() }).unwrap();
            toast.success("Đã gửi link xác thực, vui lòng kiểm tra email");
        } catch (err) {
            toast.error(err?.data?.message || "Không thể gửi lại");
        }
    };

    if (!token) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">Gửi lại link xác thực</h2>
                <p className="mt-2 text-sm text-muted-foreground">Nhập email để nhận link xác thực mới</p>
                <div className="mt-6 flex gap-2">
                    <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-full" />
                    <Button onClick={handleResend} disabled={isSending || !email.trim()} className="rounded-full">{isSending ? "Đang gửi..." : "Gửi"}</Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (isError || error) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">Xác thực thất bại</h2>
                <p className="mt-2 text-sm text-muted-foreground">{error?.data?.message || "Link không hợp lệ hoặc đã hết hạn"}</p>
                <Button asChild className="mt-6 rounded-full"><Link to={ROUTES.HOME}>Về trang chủ</Link></Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">Email đã được xác thực!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Bạn đã có thể đăng nhập và mua sắm</p>
            <Button asChild className="mt-6 rounded-full"><Link to={ROUTES.LOGIN}>Đăng nhập</Link></Button>
        </div>
    );
}
