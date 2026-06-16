import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    Mail,
    Phone,
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
    KeyRound,
    TrendingUp,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import {
    useToggleUserStatusMutation,
    useUpdateUserPermissionsMutation,
    useUpdateUserRoleMutation,
    useResetUserPasswordMutation,
} from "@/store/api/usersApi";
import { useGetAllOrdersQuery } from "@/store/api/ordersApi";
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

const ROLE_CONFIG = {
    admin: { label: "Quản trị viên", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" },
    staff: { label: "Nhân viên", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
    user: { label: "Người dùng", color: "bg-muted text-muted-foreground" },
};

const ALL_PERMISSIONS = [
    { key: "dashboard", label: "Tổng quan", note: "Chỉ xem số liệu vận hành" },
    { key: "products", label: "Sản phẩm", note: "Quản lý sản phẩm và biến thể" },
    { key: "series", label: "Series sản phẩm", note: "Quản lý nhóm series sản phẩm" },
    { key: "categories", label: "Danh mục", note: "Quản lý danh mục sản phẩm" },
    { key: "comments", label: "Bình luận", note: "Duyệt, ẩn và phản hồi đánh giá" },
    { key: "orders", label: "Đơn hàng", note: "Xem và cập nhật đơn hàng" },
    { key: "returns", label: "Trả hàng", note: "Xử lý yêu cầu hoàn trả" },
    { key: "news", label: "Tin tức", note: "Tạo và xuất bản bài viết" },
    { key: "banners", label: "Banner", note: "Quản lý banner quảng cáo" },
    { key: "coupons", label: "Khuyến mãi", note: "Tạo và quản lý mã giảm giá" },
];

const EXTRA_PERMISSIONS = [
    { key: "users", label: "Người dùng", note: "Quản lý người dùng, vai trò và quyền" },
    { key: "points", label: "Điểm thưởng", note: "Điều chỉnh điểm thưởng người dùng" },
    { key: "ai", label: "Cấu hình AI", note: "Cấu hình prompt và model AI" },
    { key: "settings", label: "Cài đặt", note: "Cấu hình cửa hàng và hệ thống" },
    { key: "options", label: "Thuộc tính", note: "Quản lý giá trị thuộc tính sản phẩm" },
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
    series: ["view", "create", "update", "delete"],
    categories: ["view", "create", "update", "delete"],
    comments: ["view", "update", "delete"],
    orders: ["view", "update"],
    returns: ["view", "update"],
    news: ["view", "create", "update", "delete"],
    banners: ["view", "create", "update", "delete"],
    coupons: ["view", "create", "update", "delete"],
    users: ["view", "update", "delete"],
    points: ["view", "update"],
    ai: ["view", "update"],
    settings: ["view", "update"],
    options: ["view", "update"],
};

const getPermissionActions = (permission) =>
    PERMISSION_ACTION_OVERRIDES[permission.key] || PERMISSION_ACTIONS;

const getPermissionKey = (module, action) => `${module}:${action}`;

const StatCard = ({ icon: Icon, label, value, iconClassName }) => (
    <div className="flex items-start gap-3">
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
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
    const [page, setPage] = useState(1);
    const perPage = 3;
    const logs = getUserActivityLogs(user);
    const totalPages = Math.max(1, Math.ceil(logs.length / perPage));
    const pagedLogs = logs.slice((page - 1) * perPage, page * perPage);

    return (
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
                <>
                    <div className="space-y-4">
                        {pagedLogs.map((log) => {
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

                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Trước
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function AdminUserDetail({ user }) {
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
    const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirmPassword: "" });

    const openResetPassword = () => {
        setResetPasswordForm({ password: "", confirmPassword: "" });
        setResetConfirmOpen(true);
    };

    const [orderPage, setOrderPage] = useState(1);
    const [orderSearch, setOrderSearch] = useState("");
    const [orderStatus, setOrderStatus] = useState("");

    const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({
        page: orderPage,
        limit: 5,
        userId: user.id,
        search: orderSearch || undefined,
        status: orderStatus || undefined,
    });

    const orders = ordersData?.orders ?? [];
    const orderPagination = ordersData?.pagination ?? {};

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
        if (!resetPasswordForm.password || resetPasswordForm.password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
            toast.error("Mật khẩu nhập lại không khớp");
            return;
        }
        try {
            await resetPassword({ id: user.id, password: resetPasswordForm.password }).unwrap();
            setResetConfirmOpen(false);
            toast.success("Đặt lại mật khẩu thành công");
        } catch (error) {
            toast.error(error?.data?.message || "Đặt lại mật khẩu thất bại");
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Header Banner ── */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="bg-linear-to-b from-muted/50 to-card p-6 md:p-8">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                        <Avatar className="h-20 w-20 shrink-0 ring-4 ring-background">
                            <AvatarImage src={user.avatar} alt={user.fullName || user.email || "Người dùng"} />
                            <AvatarFallback className="text-2xl font-semibold">
                                {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <h1 className="text-xl font-bold text-foreground">
                                {user.fullName || "Người dùng chưa cập nhật tên"}
                            </h1>
                            <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                                {`KH${String(user.id).padStart(4, "0")}`}
                            </p>
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
                                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                    {user.email || "—"}
                                </span>
                                {user.phone && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                                        {formatPhone(user.phone)}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                    Tham gia {formatDate(user.createdAt)}
                                </span>
                                {user.lastLoginAt && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
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
                                <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
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
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
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
                            <StatCard
                                icon={TrendingUp}
                                label="Giá trị TB / đơn"
                                value={user.orderCount > 0 ? formatPrice(Math.round((user.totalSpent ?? 0) / user.orderCount)) : "—"}
                                iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
                            />
                            {user.points != null && (
                                <StatCard
                                    icon={Hash}
                                    label="Điểm thưởng"
                                    value={formatNumber(user.points)}
                                    iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                                />
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    {user.address && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Địa chỉ
                            </h3>
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <p className="text-sm leading-relaxed text-foreground">
                                    {user.address}
                                </p>
                            </div>
                        </div>
                    )}

                    {isAdmin && user.role === "user" && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Quản lý tài khoản
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    variant={user.isBlocked ? "outline" : "destructive"}
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isTogglingStatus || !canToggleStatus}
                                    onClick={requestStatusToggle}
                                >
                                    <ShieldOff className="mr-2 h-4 w-4" aria-hidden="true" />
                                    {user.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                </Button>
                            </div>
                            {isSelf && (
                                <p className="mt-3 text-xs text-muted-foreground">
                                    Không thể tự khóa tài khoản đang đăng nhập.
                                </p>
                            )}
                        </div>
                    )}

                    {isAdmin && user.role !== "user" && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
                                    <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Đặt làm quản trị viên
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isUpdatingRole || user.role === "staff" || !canChangeRole}
                                    onClick={() => requestRoleChange("staff")}
                                >
                                    <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Đặt làm nhân viên
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isUpdatingRole || user.role === "user" || !canChangeRole}
                                    onClick={() => requestRoleChange("user")}
                                >
                                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
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
                                    <ShieldOff className="mr-2 h-4 w-4" aria-hidden="true" />
                                    {user.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                </Button>
                                <Separator className="my-1" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isResetting}
                                    onClick={openResetPassword}
                                >
                                    <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
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

                {/* ── Right Column — Orders (only for non-staff) ── */}
                <div className="lg:col-span-2">
                    <div className="space-y-6">
                    {user.role === "staff" && <StaffActivityTimeline user={user} />}

                    {user.role !== "staff" && (

                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Lịch sử đơn hàng
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                    {orderPagination.totalItems ?? orders.length} đơn
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative w-full sm:w-44">
                                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                    <Input
                                        placeholder="Tìm mã đơn..."
                                        className="h-8 rounded-lg pl-8 text-xs"
                                        value={orderSearch}
                                        onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                                    />
                                </div>
                                <Select value={orderStatus || "all"} onValueChange={(v) => { setOrderStatus(v === "all" ? "" : v); setOrderPage(1); }}>
                                    <SelectTrigger className="h-8 w-36 rounded-lg text-xs">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                        <SelectItem value="processing">Đang xử lý</SelectItem>
                                        <SelectItem value="shipping">Đang giao</SelectItem>
                                        <SelectItem value="delivered">Đã giao</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {ordersLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    {orderSearch || orderStatus ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {orderSearch || orderStatus ? "Thử thay đổi bộ lọc." : "Khách hàng này chưa phát sinh đơn hàng nào."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-0.5">
                                    <div className="hidden rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-12">
                                        <span className="col-span-4">Mã đơn</span>
                                        <span className="col-span-2">Trạng thái</span>
                                        <span className="col-span-2">Sản phẩm</span>
                                        <span className="col-span-2">Ngày đặt</span>
                                        <span className="col-span-2 text-right">Tổng tiền</span>
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

                                {orderPagination.totalPages > 1 && (
                                    <div className="mt-4 flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                            disabled={orderPage <= 1}
                                            onClick={() => setOrderPage((p) => p - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            {orderPage} / {orderPagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                            disabled={orderPage >= orderPagination.totalPages}
                                            onClick={() => setOrderPage((p) => p + 1)}
                                        >
                                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    )}
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

            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
                        <DialogDescription>
                            Nhập mật khẩu mới cho {user.fullName || user.email}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reset-password">Mật khẩu mới</Label>
                            <Input
                                id="reset-password"
                                type="password"
                                placeholder="Ít nhất 6 ký tự"
                                value={resetPasswordForm.password}
                                onChange={(e) => setResetPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reset-confirm">Nhập lại mật khẩu</Label>
                            <Input
                                id="reset-confirm"
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={resetPasswordForm.confirmPassword}
                                onChange={(e) => setResetPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setResetConfirmOpen(false)}>
                            Hủy
                        </Button>
                        <Button className="rounded-full" onClick={handleResetPassword} disabled={isResetting}>
                            {isResetting ? "Đang lưu..." : "Xác nhận"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
