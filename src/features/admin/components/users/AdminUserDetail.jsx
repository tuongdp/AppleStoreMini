import { Link } from "react-router-dom";
import { Mail, Phone, Calendar, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import {
    formatPrice,
    formatDate,
    formatDateTime,
    formatNumber,
} from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function AdminUserDetail({ user, orders = [] }) {
    const roleLabel =
        user.role === "admin"
            ? "Quản trị viên"
            : user.role === "staff"
              ? "Nhân viên"
              : "Người dùng";

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
