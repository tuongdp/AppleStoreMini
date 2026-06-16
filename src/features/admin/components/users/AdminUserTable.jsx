import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    Search,
    Eye,
    ShieldOff,
    MoreHorizontal,
    Trash2,
    Users,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    useGetAllUsersQuery,
    useToggleUserStatusMutation,
    useDeleteUserMutation,
} from "@/store/api/usersApi";
import { selectCurrentUser, selectHasPermission } from "@/store/authSlice";
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
import { formatDate, formatNumber, formatPhone, formatPrice } from "@/lib/utils";
import { ROUTES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";

// ✅ BE auth.service.js getUserResponse() → role.toLowerCase() → "admin" | "user"
// Dùng lowercase để so sánh nhất quán
const ROLE = {
    USER: "user",
};

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang hoạt động" },
    { value: "blocked", label: "Đã khóa" },
    { value: "unverified", label: "Chưa xác thực" },
];

export default function AdminUserTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") || "",
    );
    const [deleteId, setDeleteId] = useState(null);
    const canUpdateUsers = useSelector(selectHasPermission("users", "update"));
    const canDeleteUsers = useSelector(selectHasPermission("users", "delete"));
    const currentUser = useSelector(selectCurrentUser);

    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        role: ROLE.USER,
        status: searchParams.get("status") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading, isFetching } = useGetAllUsersQuery(filters);
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleUserStatusMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const users = data?.users ?? [];
    const pagination = data?.pagination ?? {};
    const hasActiveFilters =
        !!searchInput ||
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

        return {
            isSelf,
            canToggleStatus: canUpdateUsers && !isSelf,
            canDelete: canDeleteUsers && !isSelf,
        };
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
        isBlocked: u.isBlocked ? "Đã khoá" : "Đang hoạt động",
        totalSpent: u.totalSpent || 0,
        orderCount: u.orderCount ?? 0,
        points: u.points ?? 0,
        createdAt: u.createdAt,
    }));

    const handleExportUsersExcel = () => {
        if (users.length === 0) { toast("Không có dữ liệu để xuất"); return; }
        exportExcel({ sheets: [{ name: "KhachHang", columns: userColumns, rows: getUsersExportRows() }], filename: `KhachHang_${new Date().toISOString().slice(0, 10)}` });
    };

    const handleExportUsersPDF = () => {
        if (users.length === 0) { toast("Không có dữ liệu để xuất"); return; }
        exportPDF({ title: "Danh sách khách hàng", columns: userColumns, rows: getUsersExportRows(), filename: `KhachHang_${new Date().toISOString().slice(0, 10)}` });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        aria-label="Tìm kiếm khách hàng"
                        name="admin-user-search"
                        autoComplete="off"
                        placeholder="Tìm kiếm tên, email, số điện thoại…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="rounded-full pl-9"
                    />
                </div>
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
                <Table className="min-w-[1000px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px]">{"Mã KH"}</TableHead>
                            <TableHead>{"Họ và tên"}</TableHead>
                            <TableHead>{"Số điện thoại"}</TableHead>
                            <TableHead>{"Số đơn hàng"}</TableHead>
                            <TableHead>{"Tổng chi tiêu"}</TableHead>
                            <TableHead>{"Ngày đăng ký"}</TableHead>
                            <TableHead>{"Trạng thái"}</TableHead>
                            <TableHead className="text-right">
                                {"Thao tác"}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <Users className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Không tìm thấy khách hàng
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
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {`KH${String(user.id).padStart(4, "0")}`}
                                        </span>
                                    </TableCell>

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
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {user.phone ? formatPhone(user.phone) : "—"}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatNumber(user.orderCount ?? 0)}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {user.totalSpent ? formatPrice(user.totalSpent) : "0đ"}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            className={
                                                !user.isBlocked
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                                            }
                                        >
                                            {!user.isBlocked
                                                ? "Hoạt động"
                                                : "Đã khóa"}
                                        </Badge>
                                    </TableCell>

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
                                                        to={ROUTES.ADMIN_USER_DETAIL(user.id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                                        {"Xem chi tiết"}
                                                    </Link>
                                                </DropdownMenuItem>
                                                {!management.isSelf && (
                                                    <>
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
