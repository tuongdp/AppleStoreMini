import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    Shield,
    ShieldCheck,
    ShieldOff,
    Loader2,
    MapPin,
    User,
    DollarSign,
    Hash,
    Clock,
    Copy,
    KeyRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import {
    useToggleUserStatusMutation,
    useUpdateUserPermissionsMutation,
    useUpdateUserRoleMutation,
    useResetUserPasswordMutation,
} from "@/store/api/usersApi";
import { PERMISSION_ACTIONS, normalizePermissions, selectCurrentUser, selectIsAdmin } from "@/store/authSlice";
import {
    formatPrice,
    formatDate,
    formatDateTime,
    formatNumber,
    formatPhone,
    timeAgo,
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
    { key: "dashboard", label: "Tổng quan", note: "Chỉ xem số liệu vận hành" },
    { key: "products", label: "Sản phẩm", note: "Quản lý sản phẩm và biến thể" },
    { key: "orders", label: "Đơn hàng", note: "Xem và cập nhật đơn hàng" },
    { key: "returns", label: "Trả hàng", note: "Xử lý yêu cầu hoàn trả" },
    { key: "news", label: "Tin tức", note: "Tạo và xuất bản bài viết" },
    { key: "comments", label: "Bình luận", note: "Duyệt, ẩn và phản hồi đánh giá" },
    { key: "categories", label: "Danh mục", note: "Quản lý danh mục sản phẩm" },
];

const EXTRA_PERMISSIONS = [
    { key: "users", label: "Người dùng", note: "Chỉ quản trị viên nên thay đổi vai trò/quyền" },
    { key: "banners", label: "Banner", note: "Một số thao tác banner vẫn giữ cho admin" },
    { key: "coupons", label: "Khuyến mãi", note: "Mã giảm giá ảnh hưởng doanh thu, nên giữ admin" },
    { key: "points", label: "Điểm thưởng", note: "Điều chỉnh điểm là thao tác nhạy cảm" },
];

const STAFF_PERMISSIONS = [...ALL_PERMISSIONS, ...EXTRA_PERMISSIONS];

const PERMISSION_ACTION_LABELS = {
    view: "Xem",
    create: "Tạo",
    update: "Sửa",
    delete: "Xóa",
};

const PERMISSION_ACTION_OVERRIDES = {
    dashboard: ["view"],
    orders: ["view", "update"],
    returns: ["view", "update"],
    comments: ["view", "update", "delete"],
    users: ["view", "update", "delete"],
    points: ["view", "update"],
};

const getPermissionActions = (permission) =>
    PERMISSION_ACTION_OVERRIDES[permission.key] || PERMISSION_ACTIONS;

const getPermissionKey = (module, action) => `${module}:${action}`;

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

const ACTIVITY_TYPE_CONFIG = {
    created: { label: "Tạo tài khoản", tone: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
    updated: { label: "Cập nhật hồ sơ", tone: "bg-muted text-muted-foreground" },
    login: { label: "Đăng nhập", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
    permissions: { label: "Phân quyền", tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400" },
    role: { label: "Vai trò", tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
    status: { label: "Trạng thái", tone: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
};

const getUserActivityLogs = (user) => {
    const rawLogs = user.activityLogs || user.activities || user.auditLogs || [];
    const externalLogs = Array.isArray(rawLogs)
        ? rawLogs.map((log, index) => ({
            id: log.id || log._id || `log-${index}`,
            type: log.type || log.action || "updated",
            title: log.title || log.actionLabel || log.action || "Hoạt động",
            description: log.description || log.message || log.details || "",
            createdAt: log.createdAt || log.timestamp || log.time,
            actor: log.actorName || log.actor?.fullName || log.actor?.email || log.actor,
        }))
        : [];

    const inferredLogs = [
        user.createdAt && {
            id: "created",
            type: "created",
            title: "Tài khoản được tạo",
            description: "Nhân viên được thêm vào hệ thống.",
            createdAt: user.createdAt,
        },
        user.role === "staff" && {
            id: "role",
            type: "role",
            title: "Đang giữ vai trò nhân viên",
            description: "Tài khoản có quyền truy cập khu vực quản trị theo module được cấp.",
            createdAt: user.updatedAt || user.createdAt,
        },
        user.role === "staff" && Array.isArray(user.permissions) && {
            id: "permissions",
            type: "permissions",
            title: `${user.permissions.length} quyền đang được cấp`,
            description: user.permissions.length
                ? user.permissions.join(", ")
                : "Chưa có module thao tác nào ngoài trang tổng quan.",
            createdAt: user.updatedAt || user.createdAt,
        },
        user.isBlocked && {
            id: "status",
            type: "status",
            title: "Tài khoản đang bị khóa",
            description: "Nhân viên không thể đăng nhập cho đến khi được mở khóa.",
            createdAt: user.updatedAt || user.createdAt,
        },
        (user.lastLoginAt || user.lastLogin || user.loginAt) && {
            id: "login",
            type: "login",
            title: "Lần đăng nhập gần nhất",
            description: "Hoạt động đăng nhập gần nhất được ghi nhận.",
            createdAt: user.lastLoginAt || user.lastLogin || user.loginAt,
        },
        user.updatedAt && user.updatedAt !== user.createdAt && {
            id: "updated",
            type: "updated",
            title: "Hồ sơ được cập nhật",
            description: "Thông tin tài khoản hoặc quyền đã có thay đổi.",
            createdAt: user.updatedAt,
        },
    ].filter(Boolean);

    return [...externalLogs, ...inferredLogs]
        .filter((item) => item.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
};

function StaffActivityTimeline({ user }) {
    const logs = getUserActivityLogs(user);

    return (
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lịch sử hoạt động
                    </h3>
                </div>
                <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
            </div>

            {logs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">Chưa có hoạt động</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Khi nhân viên đăng nhập hoặc được cập nhật quyền, lịch sử sẽ hiển thị tại đây.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map((log) => {
                        const config = ACTIVITY_TYPE_CONFIG[log.type] || ACTIVITY_TYPE_CONFIG.updated;
                        return (
                            <div key={log.id} className="flex gap-3">
                                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <span className="h-2 w-2 rounded-full bg-foreground" />
                                </div>
                                <div className="min-w-0 flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={config.tone}>{config.label}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDateTime(log.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-foreground">{log.title}</p>
                                    {log.description && (
                                        <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                                            {log.description}
                                        </p>
                                    )}
                                    {log.actor && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Thực hiện bởi {log.actor}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function AdminUserDetail({ user, orders = [] }) {
    const isAdmin = useSelector(selectIsAdmin);
    const currentUser = useSelector(selectCurrentUser);
    const [perms, setPerms] = useState(() => normalizePermissions(user.permissions || []));
    const [pendingAction, setPendingAction] = useState(null);
    const [updatePerms, { isLoading: isUpdatingPerms }] =
        useUpdateUserPermissionsMutation();
    const [updateRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
    const [toggleStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation();
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
    const [resetResult, setResetResult] = useState(null);

    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
    const isSelf = String(user.id) === String(currentUser?.id);
    const canChangeRole = isAdmin && !isSelf && user.role !== "admin";
    const canToggleStatus = isAdmin && !isSelf && user.role !== "admin";
    const savedPerms = normalizePermissions(user.permissions || []);
    const selectedPermissionCount = Array.isArray(perms) ? perms.length : 0;
    const availablePermissionCount = STAFF_PERMISSIONS.reduce(
        (total, permission) => total + getPermissionActions(permission).length,
        0,
    );
    const permissionsDirty =
        [...savedPerms].sort().join("|") !== [...perms].sort().join("|");

    useEffect(() => {
        setPerms(normalizePermissions(user.permissions || []));
    }, [user.id, user.permissions]);

    const togglePerm = (key) => {
        setPerms((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            if (arr.includes(key)) return arr.filter((k) => k !== key);
            return [...arr, key];
        });
    };

    const handleSavePerms = async () => {
        if (!permissionsDirty) return;
        try {
            await updatePerms({ id: user.id, permissions: perms }).unwrap();
            toast.success("Đã cập nhật quyền");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleResetPerms = () => {
        setPerms(savedPerms);
    };

    const requestRoleChange = (role) => {
        const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
        setPendingAction({
            type: "role",
            role,
            title: "Cập nhật vai trò người dùng",
            description: `Chuyển ${user.fullName || user.email} sang vai trò ${config.label}. Quyền truy cập admin sẽ thay đổi ngay sau khi lưu.`,
            confirmLabel: "Cập nhật vai trò",
            variant: "default",
        });
    };

    const requestStatusToggle = () => {
        setPendingAction({
            type: "status",
            title: user.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản",
            description: user.isBlocked
                ? `${user.fullName || user.email} sẽ có thể đăng nhập và sử dụng tài khoản trở lại.`
                : `${user.fullName || user.email} sẽ không thể đăng nhập hoặc sử dụng tài khoản cho đến khi được mở khóa.`,
            confirmLabel: user.isBlocked ? "Mở khóa" : "Khóa tài khoản",
            variant: user.isBlocked ? "default" : "destructive",
        });
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;

        if (pendingAction.type === "role") {
            await handleSetRole(pendingAction.role);
        }
        if (pendingAction.type === "status") {
            await handleToggleStatus();
        }
        setPendingAction(null);
    };

    const handleSetRole = async (role) => {
        if (!canChangeRole) {
            toast.error("Không thể thay đổi vai trò của tài khoản này");
            return;
        }
        if (role === user.role) return;
        try {
            await updateRole({ id: user.id, role }).unwrap();
            toast.success("Đã cập nhật vai trò");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleToggleStatus = async () => {
        if (!canToggleStatus) {
            toast.error("Không thể khóa hoặc mở khóa tài khoản này");
            return;
        }
        try {
            await toggleStatus(user.id).unwrap();
            toast.success(user.isBlocked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleResetPassword = async () => {
        try {
            const result = await resetPassword(user.id).unwrap();
            setResetResult(result.newPassword);
            setResetConfirmOpen(false);
        } catch {
            toast.error("Đặt lại mật khẩu thất bại");
            setResetConfirmOpen(false);
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
                                        {formatPhone(user.phone)}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Tham gia {formatDate(user.createdAt)}
                                </span>
                                {user.lastLoginAt && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Đăng nhập {timeAgo(user.lastLoginAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isAdmin && user.role === "staff" && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Phân quyền
                                </h3>
                                <Badge variant={permissionsDirty ? "default" : "secondary"} className="text-xs">
                                    {selectedPermissionCount}/{availablePermissionCount}
                                </Badge>
                            </div>
                            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                                Cấp quyền theo chức năng và thao tác cụ thể. Tổng quan chỉ là quyền xem số liệu; các thao tác nhạy cảm vẫn giữ cho quản trị viên khi cần.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full"
                                disabled={!permissionsDirty || isUpdatingPerms}
                                onClick={handleResetPerms}
                            >
                                Hoàn tác
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-full"
                                disabled={!permissionsDirty || isUpdatingPerms}
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
                    </div>
                    {permissionsDirty && (
                        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                            Có thay đổi chưa lưu.
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
                            <thead>
                                <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <th className="w-full rounded-l-lg bg-muted/50 px-3 py-2 text-left">Chức năng</th>
                                    {PERMISSION_ACTIONS.map((action, index) => (
                                        <th
                                            key={action}
                                            className={`w-24 bg-muted/50 px-3 py-2 text-center ${index === PERMISSION_ACTIONS.length - 1 ? "rounded-r-lg" : ""}`}
                                        >
                                            {PERMISSION_ACTION_LABELS[action]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {STAFF_PERMISSIONS.map((permission) => {
                                    const availableActions = getPermissionActions(permission);

                                    return (
                                        <tr key={permission.key}>
                                            <td className="border-b border-border px-3 py-3 align-middle">
                                                <p className="font-medium text-foreground">{permission.label}</p>
                                                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{permission.note}</p>
                                            </td>
                                            {PERMISSION_ACTIONS.map((action) => {
                                                const available = availableActions.includes(action);
                                                const permissionKey = getPermissionKey(permission.key, action);
                                                const checked = Array.isArray(perms) && perms.includes(permissionKey);

                                                return (
                                                    <td key={action} className="border-b border-border px-3 py-3 text-center align-middle">
                                                        {available ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                disabled={isUpdatingPerms}
                                                                onChange={() => togglePerm(permissionKey)}
                                                                aria-label={`${permission.label} - ${PERMISSION_ACTION_LABELS[action]}`}
                                                                className="h-4 w-4 rounded accent-blue-600"
                                                            />
                                                        ) : (
                                                            <span className="text-muted-foreground/40">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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

                    {isAdmin && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Quản trị tài khoản
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isUpdatingRole || user.role === "admin" || !canChangeRole}
                                    onClick={() => requestRoleChange("admin")}
                                >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Đặt làm quản trị viên
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isUpdatingRole || user.role === "staff" || !canChangeRole}
                                    onClick={() => requestRoleChange("staff")}
                                >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Đặt làm nhân viên
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isUpdatingRole || user.role === "user" || !canChangeRole}
                                    onClick={() => requestRoleChange("user")}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Đặt làm người dùng
                                </Button>
                                <Separator className="my-1" />
                                <Button
                                    variant={user.isBlocked ? "outline" : "destructive"}
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isTogglingStatus || !canToggleStatus}
                                    onClick={requestStatusToggle}
                                >
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    {user.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                </Button>
                                <Separator className="my-1" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isResetting}
                                    onClick={() => setResetConfirmOpen(true)}
                                >
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Đặt lại mật khẩu
                                </Button>
                            </div>
                            {isSelf && (
                                <p className="mt-3 text-xs text-muted-foreground">
                                    Không thể tự khóa, xóa hoặc hạ quyền tài khoản đang đăng nhập.
                                </p>
                            )}
                        </div>
                    )}

                </div>

                {/* ── Right Column — Orders ── */}
                <div className="lg:col-span-2">
                    <div className="space-y-6">
                    {user.role === "staff" && <StaffActivityTimeline user={user} />}

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

            <ConfirmDialog
                open={!!pendingAction}
                onOpenChange={(open) => !open && setPendingAction(null)}
                title={pendingAction?.title}
                description={pendingAction?.description}
                confirmLabel={pendingAction?.confirmLabel}
                variant={pendingAction?.variant}
                onConfirm={handleConfirmAction}
                isLoading={isUpdatingRole || isTogglingStatus}
            />

            <ConfirmDialog
                open={resetConfirmOpen}
                onOpenChange={(open) => { if (!open) setResetConfirmOpen(false); }}
                title="Đặt lại mật khẩu"
                description={`Bạn có chắc chắn muốn đặt lại mật khẩu cho ${user.fullName || user.email}? Mật khẩu mới sẽ được gửi qua email cho người dùng.`}
                confirmLabel="Xác nhận đặt lại"
                variant="default"
                onConfirm={handleResetPassword}
                isLoading={isResetting}
            />

            {resetResult && (
                <ConfirmDialog
                    open={!!resetResult}
                    onOpenChange={() => setResetResult(null)}
                    title="Đã đặt lại mật khẩu"
                    description={
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Mật khẩu mới đã được gửi qua email. Vui lòng lưu lại:
                            </p>
                            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                                <code className="flex-1 text-sm font-bold text-foreground select-all">{resetResult}</code>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0 rounded-full"
                                    onClick={() => {
                                        navigator.clipboard.writeText(resetResult);
                                        toast.success("Đã sao chép mật khẩu");
                                    }}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    }
                    confirmLabel="Đóng"
                    variant="default"
                    onConfirm={() => setResetResult(null)}
                />
            )}
        </div>
    );
}
