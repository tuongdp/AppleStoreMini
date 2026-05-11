import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Mail, Phone, Calendar, ShoppingBag, ShieldCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import { useUpdateUserPermissionsMutation } from "@/store/api/usersApi";
import { selectIsAdmin } from "@/store/authSlice";
import {
    formatPrice,
    formatDate,
    formatDateTime,
    formatNumber,
} from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export default function AdminUserDetail({ user, orders = [] }) {
    const isAdmin = useSelector(selectIsAdmin);
    const [perms, setPerms] = useState(user.permissions || []);
    const [updatePerms, { isLoading: isUpdatingPerms }] = useUpdateUserPermissionsMutation();

    const roleLabel =
        user.role === "admin"
            ? "Quản trị viên"
            : user.role === "staff"
              ? "Nhân viên"
              : "Người dùng";

    const ALL_PERMISSIONS = [
        { key: "dashboard", label: "Tổng quan" },
        { key: "products", label: "Sản phẩm" },
        { key: "orders", label: "Đơn hàng" },
        { key: "users", label: "Người dùng" },
        { key: "news", label: "Tin tức" },
        { key: "comments", label: "Bình luận" },
        { key: "categories", label: "Danh mục" },
    ];

    const togglePerm = (key) => {
        setPerms((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            if (arr.includes(key)) return arr.filter((k) => k !== key);
            return [...arr, key];
        });
    };

    const handleSavePerms = async () => {
        try {
            await updatePerms({ id: user.id, permissions: perms }).unwrap();
            toast.success("Đã cập nhật quyền");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ── Left — Profile ── */}
            <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                    <Avatar className="mx-auto mb-4 h-20 w-20">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="text-xl font-medium">
                            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-lg font-semibold text-foreground">
                        {user.fullName}
                    </h2>

                    <div className="mt-2 flex items-center justify-center gap-2">
                        <Badge
                            className={
                                user.role === "admin"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                                    : user.role === "staff"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                      : "bg-muted text-muted-foreground"
                            }
                        >
                            {roleLabel}
                        </Badge>
                        <Badge
                            className={
                                !user.isBlocked
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            }
                        >
                            {!user.isBlocked
                                ? "Đang hoạt động"
                                : "Đã khoá"}
                        </Badge>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate text-foreground">
                                {user.email}
                            </span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">
                                    {user.phone}
                                </span>
                            </div>
                        )}
                        {user.birthday && (
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">
                                    {formatDate(user.birthday)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                {"Ngày tham gia"}:{" "}
                                <span className="text-foreground">
                                    {formatDate(user.createdAt)}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                        {"stats"}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {"Số đơn hàng"}
                            </span>
                            <span className="font-medium text-foreground">
                                {formatNumber(user.orderCount ?? 0)}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {"Tổng chi tiêu"}
                            </span>
                            <span className="font-medium text-foreground">
                                {formatPrice(user.totalSpent ?? 0)}
                            </span>
                        </div>
                        {user.gender && (
                            <>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {"Giới tính"}
                                    </span>
                                    <span className="text-foreground">
                                        {(INFO_MAP[user.gender] || user.gender)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {isAdmin && user.role === "staff" && (
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            <h3 className="text-sm font-medium text-foreground">
                                Phân quyền nhân viên
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {ALL_PERMISSIONS.map((p) => {
                                const checked = Array.isArray(perms) && perms.includes(p.key);
                                return (
                                    <label
                                        key={p.key}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => togglePerm(p.key)}
                                            className="h-4 w-4 rounded accent-blue-600"
                                        />
                                        <span className="text-foreground">{p.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <Button
                            size="sm"
                            className="mt-3 w-full rounded-full"
                            disabled={isUpdatingPerms}
                            onClick={handleSavePerms}
                        >
                            {isUpdatingPerms ? (
                                <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu quyền"
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Right — Orders + Addresses ── */}
            <div className="space-y-4 lg:col-span-2">
                {/* Recent orders */}
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground">
                            {"Đơn hàng mới nhất"}
                        </h3>
                    </div>

                    {orders.length === 0 ? (
                        <div className="flex h-32 items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                                {"Không có dữ liệu"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {orders.map((order) => (
                                // ✅ MySQL integer id — không có _id
                                <Link
                                    key={order.id}
                                    to={ROUTES.ADMIN_ORDER_DETAIL(order.id)}
                                    className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            #{order.code}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(order.createdAt)}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {order.items?.length ?? 0}{" "}
                                        {"Số lượng"}
                                    </span>
                                    <OrderStatusBadge status={order.status} />
                                    <span className="shrink-0 text-sm font-medium text-foreground">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {orders.length > 0 && (
                        <div className="mt-3 border-t border-border pt-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full rounded-full text-xs text-muted-foreground"
                                asChild
                            >
                                <Link to={ROUTES.ADMIN_ORDERS}>
                                    {"Xem tất cả"}
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Addresses */}
                {user.addresses?.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-4 text-sm font-medium text-foreground">
                            {"Sổ địa chỉ"}
                        </h3>
                        <div className="space-y-3">
                            {user.addresses.map((addr) => (
                                // ✅ MySQL integer id — không có _id
                                <div
                                    key={addr.id}
                                    className="rounded-xl border border-border p-3"
                                >
                                    <p className="text-sm font-medium text-foreground">
                                        {addr.fullName}
                                        {addr.isDefault && (
                                            <Badge
                                                variant="outline"
                                                className="ml-2 text-xs"
                                            >
                                                {"Mặc định"}
                                            </Badge>
                                        )}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {addr.phone}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {addr.address}, {addr.ward},{" "}
                                        {addr.district}, {addr.province}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
