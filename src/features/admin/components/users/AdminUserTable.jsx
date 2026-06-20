import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Search, Eye, MoreHorizontal, Trash2, Users, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
    useGetAllUsersQuery, useToggleUserStatusMutation, useDeleteUserMutation,
} from "@/store/api/usersApi";
import { selectCurrentUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatDate, formatNumber, formatPhone } from "@/lib/utils";
import { ROUTES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

const ROLE_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: "user", label: "Khách hàng" },
    { value: "staff", label: "Nhân viên" },
    { value: "admin", label: "Quản trị viên" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang hoạt động" },
    { value: "blocked", label: "Đã khóa" },
    { value: "unverified", label: "Chưa xác thực" },
];

export default function AdminUserTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [deleteId, setDeleteId] = useState(null);
    const currentUser = useSelector(selectCurrentUser);

    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        role: searchParams.get("role") || "all",
        status: searchParams.get("status") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading, isFetching } = useGetAllUsersQuery(filters);
    const [toggleStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const users = data?.users ?? [];
    const pagination = data?.pagination ?? {};
    const hasActiveFilters = !!searchInput || !!searchParams.get("status");

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams(new URLSearchParams());
    };

    const handleToggleStatus = async (user) => {
        try {
            await toggleStatus(user.id).unwrap();
            toast.success(!user.isBlocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
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
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input aria-label="Tìm khách hàng" name="admin-user-search" autoComplete="off" placeholder="Tìm tên, email, số điện thoại…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="rounded-full pl-9" />
                </div>
                <Select value={searchParams.get("role") || "user"} onValueChange={(val) => updateParam("role", val)}>
                    <SelectTrigger className="w-40 rounded-full"><SelectValue placeholder="Vai trò" /></SelectTrigger>
                    <SelectContent>
                        {ROLE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={searchParams.get("status") || "all"} onValueChange={(val) => updateParam("status", val)}>
                    <SelectTrigger className="w-44 rounded-full"><SelectValue placeholder="Lọc trạng thái" /></SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={clearFilters}>Xóa bộ lọc</Button>
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Mã KH</TableHead>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead className="text-right">Số đơn</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(8)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <Users className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
                                        <p className="text-sm font-medium text-foreground">Không tìm thấy khách hàng</p>
                                        <p className="text-xs text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc.</p>
                                        {hasActiveFilters && <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={clearFilters}>Xóa bộ lọc</Button>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell><span className="text-sm font-mono text-muted-foreground">{`KH${String(user.id).slice(0, 4)}`}</span></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar} alt={user.fullName || user.email || "Người dùng"} />
                                                <AvatarFallback className="text-xs">{user.fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">{user.fullName || "Chưa cập nhật tên"}</p>
                                                <p className="truncate text-xs text-muted-foreground">{user.email || "—"}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><span className="text-sm text-muted-foreground">{user.phone ? formatPhone(user.phone) : "—"}</span></TableCell>
                                    <TableCell className="text-right"><span className="text-sm text-muted-foreground">{formatNumber(user.orderCount ?? 0)}</span></TableCell>
                                    <TableCell>
                                        <Badge className={user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" : user.role === "staff" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" : "bg-muted text-muted-foreground"}>
                                            {user.role === "admin" ? "Quản trị viên" : user.role === "staff" ? "Nhân viên" : "Khách hàng"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell><span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span></TableCell>
                                    <TableCell>
                                        <Badge className={!user.isBlocked ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"}>
                                            {!user.isBlocked ? "Hoạt động" : "Đã khóa"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Thao tác cho ${user.fullName || user.email}`}>
                                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={ROUTES.ADMIN_USER_DETAIL(user.id)} className="flex items-center gap-2">
                                                        <Eye className="h-4 w-4" aria-hidden="true" />Xem chi tiết
                                                    </Link>
                                                </DropdownMenuItem>
                                                {currentUser?.id !== user.id && (
                                                    <>
                                                        <DropdownMenuItem className="gap-2" onClick={() => handleToggleStatus(user)} disabled={isToggling}>
                                                            <Trash2 className="h-4 w-4" aria-hidden="true" />{user.isBlocked ? "Mở khóa" : "Khóa"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setDeleteId(user.id)}>
                                                            <Trash2 className="h-4 w-4" aria-hidden="true" />Xoá
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Hàng mỗi trang {PAGINATION.DEFAULT_LIMIT}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={filters.page <= 1} onClick={() => updateParam("page", filters.page - 1)} aria-label="Trang trước">
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{filters.page} / {pagination.totalPages}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={filters.page >= pagination.totalPages} onClick={() => updateParam("page", filters.page + 1)} aria-label="Trang sau">
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Xoá tài khoản?" description="Hành động này không thể hoàn tác." onConfirm={handleDelete} isLoading={isDeleting} />
        </div>
    );
}
