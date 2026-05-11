import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    ShieldCheck,
    Loader2,
    MapPin,
    User,
    DollarSign,
    Hash,
    Clock,
} from "lucide-react";
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

const GENDER_MAP = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác",
};

const ROLE_CONFIG = {
    admin: { label: "Quản trị viên", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" },
    staff: { label: "Nhân viên", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
    user: { label: "Người dùng", color: "bg-muted text-muted-foreground" },
};

const ALL_PERMISSIONS = [
    { key: "dashboard", label: "Tổng quan" },
    { key: "products", label: "Sản phẩm" },
    { key: "orders", label: "Đơn hàng" },
    { key: "users", label: "Người dùng" },
    { key: "news", label: "Tin tức" },
    { key: "comments", label: "Bình luận" },
    { key: "categories", label: "Danh mục" },
];

const StatCard = ({ icon: Icon, label, value, iconClassName }) => (
    <div className="flex items-start gap-3">
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
            <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
    </div>
);

export default function AdminUserDetail({ user, orders = [] }) {
    const isAdmin = useSelector(selectIsAdmin);
    const [perms, setPerms] = useState(user.permissions || []);
    const [updatePerms, { isLoading: isUpdatingPerms }] =
        useUpdateUserPermissionsMutation();

    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;

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
        <div className="space-y-6">
            {/* ── Header Banner ── */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="bg-linear-to-b from-muted/50 to-card p-6 md:p-8">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                        <Avatar className="h-20 w-20 shrink-0 ring-4 ring-background">
                            <AvatarImage src={user.avatar} alt={user.fullName} />
                            <AvatarFallback className="text-2xl font-semibold">
                                {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <h1 className="text-xl font-bold text-foreground">
                                {user.fullName}
                            </h1>
                            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <Badge className={roleConfig.color}>
                                    {roleConfig.label}
                                </Badge>
                                <Badge
                                    className={
                                        !user.isBlocked
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                    }
                                >
                                    {!user.isBlocked ? "Đang hoạt động" : "Đã khóa"}
                                </Badge>
                                {user.isVerified && (
                                    <Badge
                                        variant="outline"
                                        className="border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
                                    >
                                        Đã xác thực
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    {user.email}
                                </span>
                                {user.phone && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5" />
                                        {user.phone}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Tham gia {formatDate(user.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ── Left Column ── */}
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Thống kê
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={ShoppingBag}
                                label="Đơn hàng"
                                value={formatNumber(user.orderCount ?? 0)}
                                iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                            />
                            <StatCard
                                icon={DollarSign}
                                label="Tổng chi tiêu"
                                value={formatPrice(user.totalSpent ?? 0)}
                                iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                            />
                            {user.points != null && (
                                <StatCard
                                    icon={Hash}
                                    label="Điểm thưởng"
                                    value={formatNumber(user.points)}
                                    iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                                />
                            )}
                            {user.gender && (
                                <StatCard
                                    icon={User}
                                    label="Giới tính"
                                    value={GENDER_MAP[user.gender] || user.gender}
                                    iconClassName="bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400"
                                />
                            )}
                        </div>
                        {user.birthday && (
                            <>
                                <Separator className="my-4" />
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Sinh nhật:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(user.birthday)}
                                        </span>
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Address */}
                    {user.address && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Địa chỉ
                            </h3>
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <p className="text-sm leading-relaxed text-foreground">
                                    {user.address}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Permissions */}
                    {isAdmin && user.role === "staff" && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Phân quyền
                                </h3>
                            </div>
                            <div className="space-y-0.5">
                                {ALL_PERMISSIONS.map((p) => {
                                    const checked =
                                        Array.isArray(perms) && perms.includes(p.key);
                                    return (
                                        <label
                                            key={p.key}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => togglePerm(p.key)}
                                                className="h-4 w-4 shrink-0 rounded accent-blue-600"
                                            />
                                            <span className="text-foreground">
                                                {p.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            <Button
                                size="sm"
                                className="mt-4 w-full rounded-full"
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

                {/* ── Right Column — Orders ── */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Đơn hàng gần đây
                                </h3>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {orders.length} đơn
                            </Badge>
                        </div>

                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Chưa có đơn hàng nào
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {/* Header */}
                                <div className="hidden rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-12">
                                    <span className="col-span-4">Mã đơn</span>
                                    <span className="col-span-2">Trạng thái</span>
                                    <span className="col-span-2">Sản phẩm</span>
                                    <span className="col-span-2">Ngày đặt</span>
                                    <span className="col-span-2 text-right">
                                        Tổng tiền
                                    </span>
                                </div>
                                {orders.map((order) => (
                                    <Link
                                        key={order.id}
                                        to={ROUTES.ADMIN_ORDER_DETAIL(order.id)}
                                        className="block rounded-lg transition-colors hover:bg-muted/50"
                                    >
                                        <div className="grid grid-cols-1 gap-1 px-3 py-3 md:grid-cols-12 md:gap-0 md:py-2.5">
                                            <span className="col-span-4 text-sm font-medium text-foreground">
                                                #{order.code}
                                            </span>
                                            <span className="col-span-2">
                                                <OrderStatusBadge status={order.status} />
                                            </span>
                                            <span className="col-span-2 text-xs text-muted-foreground">
                                                <span className="md:hidden">Sản phẩm: </span>
                                                {order.items?.length ?? 0} sản phẩm
                                            </span>
                                            <span className="col-span-2 text-xs text-muted-foreground">
                                                <span className="md:hidden">Ngày đặt: </span>
                                                {formatDateTime(order.createdAt)}
                                            </span>
                                            <span className="col-span-2 text-sm font-medium text-foreground md:text-right">
                                                <span className="md:hidden">Tổng: </span>
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
