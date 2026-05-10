import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
    Search,
    Eye,
    ShieldCheck,
    ShieldOff,
    MoreHorizontal,
    Trash2,
} from "lucide-react";
import {
    useGetAllUsersQuery,
    useUpdateUserRoleMutation,
    useToggleUserStatusMutation,
    useDeleteUserMutation,
} from "@/store/api/usersApi";
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
import { formatDate, formatNumber } from "@/lib/utils";
import { ROUTES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

// ✅ BE auth.service.js getUserResponse() → role.toLowerCase() → "admin" | "user"
// Dùng lowercase để so sánh nhất quán
const ROLE = {
    ADMIN: "admin",
    USER: "user",
};

const ROLE_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: ROLE.USER, label: "Người dùng" },
    { value: ROLE.ADMIN, label: "Quản trị viên" },
];

export default function AdminUserTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") || "",
    );
    const [deleteId, setDeleteId] = useState(null);

    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        role: searchParams.get("role") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading } = useGetAllUsersQuery(filters);
    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleUserStatusMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    // ✅ usersApi transformResponse → { users, pagination }
    const users = data?.users ?? [];
    const pagination = data?.pagination ?? {};

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

    const handleToggleRole = async (user) => {
        // ✅ BE role là lowercase, usersApi.updateUserRole sẽ .toUpperCase() trước khi gửi
        const newRole = user.role === ROLE.ADMIN ? ROLE.USER : ROLE.ADMIN;
        try {
            await updateRole({ id: user.id, role: newRole }).unwrap();
            toast.success("Cập nhật vai trò thành công");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await toggleStatus(userId).unwrap();
            toast.success("Đã khoá tài khoản");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUser(deleteId).unwrap();
            toast.success("Xoá tài khoản thành công");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-xs min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={"Tìm kiếm người dùng..."}
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
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>{"Họ và tên"}</TableHead>
                            <TableHead>{"Số điện thoại"}</TableHead>
                            <TableHead>{"Vai trò"}</TableHead>
                            <TableHead>{"Trạng thái"}</TableHead>
                            <TableHead>{"Ngày tham gia"}</TableHead>
                            <TableHead>{"Số đơn hàng"}</TableHead>
                            <TableHead className="text-right">
                                {"Thao tác"}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(7)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    {"Không có dữ liệu"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                // ✅ MySQL integer id thuần — không có _id
                                <TableRow key={user.id}>
                                    {/* Name + Email */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={user.avatar}
                                                    alt={user.fullName}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {user.fullName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {user.fullName}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Phone */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {user.phone || "—"}
                                        </span>
                                    </TableCell>

                                    {/* Role — ✅ so sánh lowercase */}
                                    <TableCell>
                                        <Badge
                                            className={
                                                user.role === ROLE.ADMIN
                                                    ? "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400"
                                                    : "bg-muted text-muted-foreground hover:bg-muted"
                                            }
                                        >
                                            {user.role === ROLE.ADMIN
                                                ? "Quản trị viên"
                                                : "Người dùng"}
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

                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
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
                                                        <Eye className="h-4 w-4" />
                                                        {"Xem chi tiết"}
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="gap-2"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        handleToggleRole(user)
                                                    }
                                                >
                                                    <ShieldCheck className="h-4 w-4" />
                                                    {user.role === ROLE.ADMIN
                                                        ? "Người dùng"
                                                        : "Quản trị viên"}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="gap-2"
                                                    disabled={isToggling}
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            user.id,
                                                        )
                                                    }
                                                >
                                                    <ShieldOff className="h-4 w-4" />
                                                    {user.isBlocked
                                                        ? "Bỏ chặn"
                                                        : "Chặn"}
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(user.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {"Xoá"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
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
                            size="sm"
                            className="rounded-full"
                            disabled={filters.page <= 1}
                            onClick={() =>
                                updateParam("page", filters.page - 1)
                            }
                        >
                            {"Trước"}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {filters.page} {"trong"}{" "}
                            {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={filters.page >= pagination.totalPages}
                            onClick={() =>
                                updateParam("page", filters.page + 1)
                            }
                        >
                            {"Sau"}
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
