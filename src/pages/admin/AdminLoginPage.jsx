import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";

const adminLoginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export default function AdminLoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [login, { isLoading }] = useLoginMutation();

    const form = useForm({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values) => {
        try {
            const response = await login(values).unwrap();
            const { user, accessToken, refreshToken } = response;

            if (user.role !== "admin" && user.role !== "staff") {
                toast.error("Bạn không có quyền truy cập trang quản trị.");
                return;
            }

            localStorage.setItem("rememberMe", "true");
            dispatch(setCredentials({ user, accessToken, refreshToken, rememberMe: true }));
            toast.success("Đăng nhập thành công");
            navigate(ROUTES.ADMIN_DASHBOARD);
        } catch (error) {
            toast.error(
                error?.data?.message || "Email hoặc mật khẩu không đúng.",
            );
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* ── Left panel — branding ── */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1d1d1f] p-12 lg:flex lg:w-2/5">
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Logo */}
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 814 1000"
                        className="h-9 w-9 fill-white"
                    >
                        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.1-73.6-96.2-187.8-96.2-296.7 0-166.7 108.7-254.8 215.7-254.8 56.6 0 103.7 37.5 139 37.5 33.8 0 86.5-39.5 151.8-39.5 24.4 0 108.2 2.6 168.6 80.6zm-159.5-197.7c30.3-35.7 51.5-85.4 51.5-135.1 0-6.5-.6-13-1.9-18.2-48.7 1.9-106.4 32.5-140.8 73.6-26.8 30.3-52 80-52 130.4 0 7.1 1.3 14.3 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 43.4 0 98.4-29 127.7-68.5z" />
                    </svg>
                </div>

                {/* Center content */}
                <div className="relative">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white">
                        {"Admin Panel"}
                    </h1>
                    <p className="max-w-xs text-sm leading-relaxed text-white/50">
                        {"Quản lý toàn bộ hoạt động của Apple Store Vietnam — sản phẩm, đơn hàng, khách hàng và doanh thu."}
                    </p>
                </div>

                {/* Bottom note */}
                <div className="relative">
                    <p className="text-xs text-white/30">
                        {"Chỉ dành cho quản trị viên được ủy quyền."}
                    </p>
                </div>
            </div>

            {/* ── Right panel — form ── */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
                {/* Mobile logo */}
                <div className="mb-8 lg:hidden">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 814 1000"
                        className="h-10 w-10 fill-foreground"
                    >
                        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.1-73.6-96.2-187.8-96.2-296.7 0-166.7 108.7-254.8 215.7-254.8 56.6 0 103.7 37.5 139 37.5 33.8 0 86.5-39.5 151.8-39.5 24.4 0 108.2 2.6 168.6 80.6zm-159.5-197.7c30.3-35.7 51.5-85.4 51.5-135.1 0-6.5-.6-13-1.9-18.2-48.7 1.9-106.4 32.5-140.8 73.6-26.8 30.3-52 80-52 130.4 0 7.1 1.3 14.3 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 43.4 0 98.4-29 127.7-68.5z" />
                    </svg>
                </div>

                <div className="w-full max-w-sm">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground">
                            {"Đăng nhập quản trị"}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {"Nhập thông tin tài khoản admin để tiếp tục"}
                        </p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{"Email"}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="admin@example.com"
                                                disabled={isLoading}
                                                autoComplete="email"
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
                                        <FormLabel>{"Mật khẩu"}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    placeholder="••••••••"
                                                    disabled={isLoading}
                                                    autoComplete="current-password"
                                                    className="pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (v) => !v,
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                                className="mt-2 w-full rounded-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang xác thực..." : "Đăng nhập"}
                            </Button>
                        </form>
                    </Form>

                    {/* Back to store */}
                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        <a
                            href="/"
                            className="hover:text-foreground hover:underline"
                        >
                            {"← Quay về trang Store"}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
