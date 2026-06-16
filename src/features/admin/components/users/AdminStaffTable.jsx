import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Search,
    Eye,
    UserCog,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react";
import {
    useGetAllUsersQuery,
    useCreateStaffMutation,
} from "@/store/api/usersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDate, formatPhone, timeAgo } from "@/lib/utils";
import { ROUTES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang hoạt động" },
    { value: "blocked", label: "Đã khóa" },
];

export default function AdminStaffTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        role: "staff",
        status: searchParams.get("status") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading, isFetching } = useGetAllUsersQuery(filters);
    const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();

    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ email: "", password: "", confirmPassword: "" });

    const users = data?.users ?? [];
    const pagination = data?.pagination ?? {};
    const hasActiveFilters = !!searchInput || !!searchParams.get("status");

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

    const handleCreateStaff = async () => {
        if (!createForm.email || !createForm.password) {
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
            return;
        }
        if (createForm.password !== createForm.confirmPassword) {
            toast.error("Mật khẩu nhập lại không khớp");
            return;
        }
        try {
            await createStaff({
                email: createForm.email,
                password: createForm.password,
                role: "staff",
            }).unwrap();
            toast.success("Đã tạo nhân viên mới");
            setCreateOpen(false);
            setCreateForm({ email: "", password: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const permCount = (user) => {
        if (Array.isArray(user.permissions)) return user.permissions.length;
        return 0;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        aria-label="Tìm kiếm nhân viên"
                        name="admin-staff-search"
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
                <Button size="sm" className="rounded-full" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                    Thêm nhân viên
                </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table className="min-w-[900px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>{"Họ và tên"}</TableHead>
                            <TableHead>{"Số điện thoại"}</TableHead>
                            <TableHead>{"Trạng thái"}</TableHead>
                            <TableHead>{"Quyền"}</TableHead>
                            <TableHead>{"Ngày tham gia"}</TableHead>
                            <TableHead>{"Lần hoạt động"}</TableHead>
                            <TableHead className="text-right">{"Thao tác"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
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
                                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <UserCog className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Không tìm thấy nhân viên
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
                                const perms = permCount(user);
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar} alt={user.fullName || user.email || "Nhân viên"} />
                                                    <AvatarFallback className="text-xs">
                                                        {user.fullName?.charAt(0)?.toUpperCase() || "S"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {user.fullName || "Nhân viên chưa cập nhật tên"}
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
                                            <Badge
                                                className={
                                                    !user.isBlocked
                                                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                        : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                                                }
                                            >
                                                {!user.isBlocked ? "Đang hoạt động" : "Đã khoá"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={perms > 0 ? "default" : "secondary"}>
                                                {perms} quyền
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {timeAgo(user.lastLoginAt) || "—"}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                                                <Link to={ROUTES.ADMIN_STAFF_DETAIL(user.id)}>
                                                    <Eye className="mr-1 h-4 w-4" aria-hidden="true" />
                                                    Chi tiết
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

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
                            onClick={() => updateParam("page", filters.page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {filters.page} {"trong"} {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            aria-label="Trang sau"
                            disabled={filters.page >= pagination.totalPages}
                            onClick={() => updateParam("page", filters.page + 1)}
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Thêm nhân viên mới</DialogTitle>
                        <DialogDescription>
                            Tạo tài khoản nhân viên với tên đăng nhập và mật khẩu.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="staff-email">Email</Label>
                            <Input
                                id="staff-email"
                                type="email"
                                placeholder="nvana@example.com"
                                value={createForm.email}
                                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="staff-password">Mật khẩu</Label>
                            <Input
                                id="staff-password"
                                type="password"
                                placeholder="Ít nhất 6 ký tự"
                                value={createForm.password}
                                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="staff-confirm">Nhập lại mật khẩu</Label>
                            <Input
                                id="staff-confirm"
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={createForm.confirmPassword}
                                onChange={(e) => setCreateForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setCreateOpen(false)}>
                            Hủy
                        </Button>
                        <Button className="rounded-full" onClick={handleCreateStaff} disabled={isCreating}>
                            {isCreating ? "Đang tạo..." : "Tạo nhân viên"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
