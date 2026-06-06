import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    Search,
    Eye,
    ShieldCheck,
    ShieldOff,
    Shield,
    MoreHorizontal,
    Trash2,
    Users,
    UserCheck,
    UserX,
    UserCog,
    MailWarning,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    useGetAllUsersQuery,
    useGetUserStatsQuery,
    useUpdateUserRoleMutation,
    useToggleUserStatusMutation,
    useDeleteUserMutation,
} from "@/store/api/usersApi";
import { selectCurrentUser, selectHasPermission, selectIsAdmin } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatDate, formatNumber, formatPhone, formatPrice, timeAgo } from "@/lib/utils";
import { ROUTES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";

// ✅ BE auth.service.js getUserResponse() → role.toLowerCase() → "admin" | "user"
// Dùng lowercase để so sánh nhất quán
const ROLE = {
    ADMIN: "admin",
    STAFF: "staff",
    USER: "user",
};

const ROLE_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: ROLE.USER, label: "Người dùng" },
    { value: ROLE.STAFF, label: "Nhân viên" },
    { value: ROLE.ADMIN, label: "Quản trị viên" },
];

const ROLE_LABEL = {
    [ROLE.ADMIN]: "Quản trị viên",
    [ROLE.STAFF]: "Nhân viên",
    [ROLE.USER]: "Người dùng",
};

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang hoạt động" },
    { value: "blocked", label: "Đã khóa" },
    { value: "unverified", label: "Chưa xác thực" },
];

const SummaryCard = ({ icon: Icon, label, value, className }) => (
    <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${className}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold text-foreground">
                    {formatNumber(value || 0)}
                </p>
            </div>
        </div>
    </div>
);

export default function AdminUserTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") || "",
    );
    const [deleteId, setDeleteId] = useState(null);
    const isAdmin = useSelector(selectIsAdmin);
    const canUpdateUsers = useSelector(selectHasPermission("users", "update"));
    const canDeleteUsers = useSelector(selectHasPermission("users", "delete"));
    const currentUser = useSelector(selectCurrentUser);

    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        role: searchParams.get("role") || undefined,
        status: searchParams.get("status") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading, isFetching } = useGetAllUsersQuery(filters);
    const { data: stats } = useGetUserStatsQuery();
    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleUserStatusMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    // ✅ usersApi transformResponse → { users, pagination }
    const users = data?.users ?? [];
    const pagination = data?.pagination ?? {};
    const hasActiveFilters =
        !!searchInput ||
        !!searchParams.get("role") ||
        !!searchParams.get("status");

    useEffect(() => {
        const currentSearch = searchParams.get("search") || "";
        if (debouncedSearch === currentSearch) return;

        const params = new URLSearchParams(searchParams);
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    }, [debouncedSearch, searchParams, setSearchParams]);

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams(new URLSearchParams());
    };

    const getManagementState = (user) => {
        const isSelf = String(user.id) === String(currentUser?.id);
        const isTargetAdmin = user.role === ROLE.ADMIN;

        return {
            isSelf,
            canChangeRole: isAdmin && !isSelf && !isTargetAdmin,
            canToggleStatus: canUpdateUsers && !isSelf && !isTargetAdmin,
            canDelete: canDeleteUsers && !isSelf && !isTargetAdmin,
        };
    };

    const handleSetRole = async (user, newRole) => {
        const { canChangeRole } = getManagementState(user);
        if (!canChangeRole) {
            toast.error("Không thể thay đổi vai trò của tài khoản này");
            return;
        }
        if (user.role === newRole) return;
        try {
            await updateRole({ id: user.id, role: newRole }).unwrap();
            toast.success("Cập nhật vai trò thành công");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleToggleStatus = async (user) => {
        const { canToggleStatus } = getManagementState(user);
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

    const handleDelete = async () => {
        const targetUser = users.find((user) => user.id === deleteId);
        if (!targetUser || !getManagementState(targetUser).canDelete) {
            toast.error("Không thể xóa tài khoản này");
            setDeleteId(null);
            return;
        }
        try {
            await deleteUser(deleteId).unwrap();
            toast.success("Xoá tài khoản thành công");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const { exportExcel, exportPDF, isExporting } = useExport();

    const userColumns = [
        { key: "fullName", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "phone", label: "SĐT" },
        { key: "role", label: "Vai trò" },
        { key: "isBlocked", label: "Trạng thái" },
        { key: "totalSpent", label: "Tổng chi tiêu", format: "currency" },
        { key: "orderCount", label: "Số đơn" },
        { key: "points", label: "Điểm" },
        { key: "createdAt", label: "Ngày tạo", format: "date" },
    ];

    const getUsersExportRows = () => users.map((u) => ({
        fullName: u.fullName || "—",
        email: u.email || "—",
        phone: u.phone || "—",
        role: ROLE_LABEL[u.role] || u.role,
        isBlocked: u.isBlocked ? "Đã khoá" : "Đang hoạt động",
        totalSpent: u.totalSpent || 0,
        orderCount: u.orderCount ?? 0,
        points: u.points ?? 0,
        createdAt: u.createdAt,
    }));

    const handleExportUsersExcel = () => {
        if (users.length === 0) { toast("Không có dữ liệu để xuất"); return; }
        exportExcel({ sheets: [{ name: "NguoiDung", columns: userColumns, rows: getUsersExportRows() }], filename: `NguoiDung_${new Date().toISOString().slice(0, 10)}` });
    };

    const handleExportUsersPDF = () => {
        if (users.length === 0) { toast("Không có dữ liệu để xuất"); return; }
        exportPDF({ title: "Danh sách người dùng", columns: userColumns, rows: getUsersExportRows(), filename: `NguoiDung_${new Date().toISOString().slice(0, 10)}` });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryCard
                    icon={Users}
                    label="Tổng người dùng"
                    value={stats?.total}
                    className="bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                />
                <SummaryCard
                    icon={UserCheck}
                    label="Đang hoạt động"
                    value={stats?.active}
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                />
                <SummaryCard
                    icon={UserCog}
                    label="Nhân viên/Admin"
                    value={(stats?.staff || 0) + (stats?.admins || 0)}
                    className="bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                />
                <SummaryCard
                    icon={UserX}
                    label="Đã khóa"
                    value={stats?.blocked}
                    className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                />
                <SummaryCard
                    icon={MailWarning}
                    label="Chưa xác thực"
                    value={stats?.unverified}
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        aria-label="Tìm kiếm người dùng"
                        name="admin-user-search"
                        autoComplete="off"
                        placeholder="Tìm kiếm tên, email, số điện thoại…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="rounded-full pl-9"
                    />
                </div>
                <Select
                    value={searchParams.get("role") || "all"}
                    onValueChange={(val) => updateParam("role", val)}
                >
                    <SelectTrigger className="w-40 rounded-full">
                        <SelectValue placeholder={"Lọc theo vai trò"} />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={searchParams.get("status") || "all"}
                    onValueChange={(val) => updateParam("status", val)}
                >
                    <SelectTrigger className="w-44 rounded-full">
                        <SelectValue placeholder={"Lọc trạng thái"} />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={clearFilters}
                    >
                        Xóa bộ lọc
                    </Button>
                )}
                <div className="min-w-0 flex-1" />
                <ExportButton
                    onExportExcel={handleExportUsersExcel}
                    onExportPDF={handleExportUsersPDF}
                    loading={isExporting}
                    disabled={isLoading || isFetching}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table className="min-w-[1100px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>{"Họ và tên"}</TableHead>
                            <TableHead>{"Số điện thoại"}</TableHead>
                            <TableHead>{"Vai trò"}</TableHead>
                            <TableHead>{"Trạng thái"}</TableHead>
                            <TableHead>{"Ngày tham gia"}</TableHead>
                            <TableHead>{"Số đơn hàng"}</TableHead>
                            <TableHead>{"Tổng chi tiêu"}</TableHead>
                            <TableHead>{"Lần hoạt động"}</TableHead>
                            <TableHead className="text-right">
                                {"Thao tác"}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(9)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <Users className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Không tìm thấy người dùng
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Thử thay đổi từ khóa hoặc bộ lọc đang áp dụng.
                                            </p>
                                        </div>
                                        {hasActiveFilters && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                                onClick={clearFilters}
                                            >
                                                Xóa bộ lọc
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => {
                                const management = getManagementState(user);
                                return (
                                // ✅ MySQL integer id thuần — không có _id
                                <TableRow key={user.id}>
                                    {/* Name + Email */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={user.avatar}
                                                    alt={user.fullName || user.email || "Người dùng"}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {user.fullName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {user.fullName || "Người dùng chưa cập nhật tên"}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {user.email || "—"}
                                                </p>
                                                {!user.isVerified && (
                                                    <Badge className="mt-1 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400">
                                                        Chưa xác thực
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Phone */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {user.phone ? formatPhone(user.phone) : "—"}
                                        </span>
                                    </TableCell>

                                    {/* Role — ✅ so sánh lowercase */}
                                    <TableCell>
                                        <Badge
                                            className={
                                                user.role === ROLE.ADMIN
                                                    ? "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400"
                                                    : user.role === ROLE.STAFF
                                                      ? "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400"
                                                      : "bg-muted text-muted-foreground hover:bg-muted"
                                            }
                                        >
                                            {ROLE_LABEL[user.role] || "Người dùng"}
                                        </Badge>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Badge
                                            className={
                                                !user.isBlocked
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                                            }
                                        >
                                            {!user.isBlocked
                                                ? "Đang hoạt động"
                                                : "Đã khoá"}
                                        </Badge>
                                    </TableCell>

                                    {/* Join date */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </span>
                                    </TableCell>

                                    {/* Total orders */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatNumber(user.orderCount ?? 0)}
                                        </span>
                                    </TableCell>

                                    {/* Total spent */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {user.totalSpent ? formatPrice(user.totalSpent) : "0đ"}
                                        </span>
                                    </TableCell>

                                    {/* Last active */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {timeAgo(user.lastLoginAt) || "—"}
                                        </span>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    aria-label={`Mở thao tác cho ${user.fullName || user.email}`}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        to={ROUTES.ADMIN_USER_DETAIL(
                                                            user.id,
                                                        )}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                                        {"Xem chi tiết"}
                                                    </Link>
                                                </DropdownMenuItem>

                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="gap-2"
                                                            disabled={isUpdating || user.role === ROLE.ADMIN || !management.canChangeRole}
                                                            onClick={() => handleSetRole(user, ROLE.ADMIN)}
                                                        >
                                                            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                                            {"Đặt làm Quản trị viên"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="gap-2"
                                                            disabled={isUpdating || user.role === ROLE.STAFF || !management.canChangeRole}
                                                            onClick={() => handleSetRole(user, ROLE.STAFF)}
                                                        >
                                                            <Shield className="h-4 w-4" aria-hidden="true" />
                                                            {"Đặt làm Nhân viên"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="gap-2"
                                                            disabled={isUpdating || user.role === ROLE.USER || !management.canChangeRole}
                                                            onClick={() => handleSetRole(user, ROLE.USER)}
                                                        >
                                                            <ShieldOff className="h-4 w-4" aria-hidden="true" />
                                                            {"Đặt làm Người dùng"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="gap-2"
                                                            disabled={isToggling || !management.canToggleStatus}
                                                            onClick={() => handleToggleStatus(user)}
                                                        >
                                                            <ShieldOff className="h-4 w-4" aria-hidden="true" />
                                                            {user.isBlocked ? "Bỏ chặn" : "Chặn"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="gap-2 text-destructive focus:text-destructive"
                                                            disabled={!management.canDelete}
                                                            onClick={() => setDeleteId(user.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                            {"Xoá"}
                                                        </DropdownMenuItem>
                                                        {management.isSelf && (
                                                            <DropdownMenuItem disabled className="text-xs">
                                                                Không thể tự khóa, xóa hoặc hạ quyền
                                                            </DropdownMenuItem>
                                                        )}
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {"Hàng mỗi trang"} {PAGINATION.DEFAULT_LIMIT}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            aria-label="Trang trước"
                            disabled={filters.page <= 1}
                            onClick={() =>
                                updateParam("page", filters.page - 1)
                            }
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {filters.page} {"trong"}{" "}
                            {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            aria-label="Trang sau"
                            disabled={filters.page >= pagination.totalPages}
                            onClick={() =>
                                updateParam("page", filters.page + 1)
                            }
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={"Bạn có chắc muốn xoá tài khoản này không?"}
                description={"Hành động này không thể hoàn tác."}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
