import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations";
import { useChangePasswordMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const PasswordInput = ({ field, placeholder, disabled }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input type={show ? "text" : "password"} placeholder={placeholder} disabled={disabled} className="pr-10" {...field} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Ẩn" : "Hiện"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
};

export default function ChangePasswordForm() {
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [serverError, setServerError] = useState("");

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword }).unwrap();
            toast.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
            form.reset();
        } catch (error) {
            setServerError(error?.data?.message || "Đổi mật khẩu thất bại");
        }
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Đổi mật khẩu</h2>
                <p className="mt-1 text-sm text-muted-foreground">Nhập mật khẩu hiện tại và mật khẩu mới</p>
            </div>
            <Separator className="mb-8" />
            {serverError && <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive max-w-md">{serverError}</div>}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-5">
                    <FormField control={form.control} name="oldPassword" render={({ field }) => (
                        <FormItem><FormLabel>Mật khẩu hiện tại</FormLabel><FormControl><PasswordInput field={field} placeholder="Nhập mật khẩu hiện tại" disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Separator />
                    <FormField control={form.control} name="newPassword" render={({ field }) => (
                        <FormItem><FormLabel>Mật khẩu mới</FormLabel><FormControl><PasswordInput field={field} placeholder="Tối thiểu 8 ký tự" disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>Xác nhận mật khẩu mới</FormLabel><FormControl><PasswordInput field={field} placeholder="Nhập lại mật khẩu mới" disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="pt-2">
                        <Button type="submit" className="rounded-full px-8" disabled={isLoading}>{isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
