import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations";
import { useChangePasswordMutation, useSendChangePasswordCodeMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const PasswordInput = ({ field, placeholder, disabled }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-10"
                {...field}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
};

export default function ChangePasswordForm() {
    const [step, setStep] = useState("request"); // "request" | "verify"
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [sendCode, { isLoading: isSendingCode }] = useSendChangePasswordCodeMutation();
    const [serverError, setServerError] = useState("");
    const [serverSuccess, setServerSuccess] = useState("");

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            verificationCode: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handleSendCode = async () => {
        setServerError("");
        setServerSuccess("");
        try {
            await sendCode().unwrap();
            setServerSuccess("Đã gửi mã xác nhận qua email, vui lòng kiểm tra hộp thư");
            setStep("verify");
        } catch (error) {
            const msg = error?.data?.message;
            setServerError(msg || "Gửi mã xác nhận thất bại. Vui lòng thử lại");
        }
    };

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await changePassword({
                verificationCode: values.verificationCode,
                newPassword: values.newPassword,
            }).unwrap();

            toast.success("Đổi mật khẩu thành công");
            form.reset();
            setStep("request");
            setServerSuccess("");
        } catch (error) {
            const msg = error?.data?.message;
            if (msg?.includes("expired") || msg?.includes("hết hạn")) {
                setServerError("Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới");
                setStep("request");
                form.reset();
            } else if (msg?.includes("incorrect") || msg?.includes("không đúng")) {
                setServerError("Mã xác nhận không đúng");
            } else {
                setServerError(msg || "Đổi mật khẩu thất bại");
            }
        }
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                    {"Đổi mật khẩu"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Mã xác nhận sẽ được gửi qua email của bạn"}
                </p>
            </div>

            <Separator className="mb-8" />

            {serverError && (
                <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive max-w-md">
                    {serverError}
                </div>
            )}

            {serverSuccess && (
                <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 max-w-md dark:bg-green-900/20 dark:text-green-400">
                    {serverSuccess}
                </div>
            )}

            {step === "request" && (
                <div className="max-w-md">
                    <Button
                        type="button"
                        className="rounded-full px-8"
                        onClick={handleSendCode}
                        disabled={isSendingCode}
                    >
                        {isSendingCode
                            ? "Đang gửi..."
                            : "Gửi mã xác nhận qua email"}
                    </Button>
                </div>
            )}

            {step === "verify" && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="max-w-md space-y-5"
                    >
                        <FormField
                            control={form.control}
                            name="verificationCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {"Mã xác nhận"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            placeholder={"Nhập mã 6 chữ số"}
                                            disabled={isLoading}
                                            className="text-center text-2xl tracking-[0.5em]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {"Mật khẩu mới"}
                                    </FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            field={field}
                                            placeholder={"Tối thiểu 8 ký tự"}
                                            disabled={isLoading}
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
                                        {"Xác nhận mật khẩu mới"}
                                    </FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            field={field}
                                            placeholder={"Nhập lại mật khẩu mới"}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="submit"
                                className="rounded-full px-8"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Đang xử lý..."
                                    : "Đổi mật khẩu"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full px-8"
                                disabled={isLoading || isSendingCode}
                                onClick={handleSendCode}
                            >
                                {isSendingCode
                                    ? "Đang gửi..."
                                    : "Gửi lại mã"}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
}
