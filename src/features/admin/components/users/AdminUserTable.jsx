import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    { value: "all", labelKey: "user.all" },
    { value: ROLE.USER, labelKey: "user.roleUser" },
    { value: ROLE.ADMIN, labelKey: "user.roleAdmin" },
];

export default function AdminUserTable() {
    const { t } = useTranslation("admin");
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
            toast.success(t("user.updateRoleSuccess"));
        } catch {
            toast.error(t("status.error", { ns: "common" }));
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await toggleStatus(userId).unwrap();
            toast.success(t("user.blockSuccess"));
        } catch {
            toast.error(t("status.error", { ns: "common" }));
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUser(deleteId).unwrap();
            toast.success(t("user.deleteSuccess"));
        } catch {
            toast.error(t("status.error", { ns: "common" }));
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
                        placeholder={t("user.search")}
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
                        <SelectValue placeholder={t("user.filterRole")} />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {t(opt.labelKey)}
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
                            <TableHead>{t("user.name")}</TableHead>
                            <TableHead>{t("user.phone")}</TableHead>
                            <TableHead>{t("user.role")}</TableHead>
                            <TableHead>{t("user.status")}</TableHead>
                            <TableHead>{t("user.joinDate")}</TableHead>
                            <TableHead>{t("user.totalOrders")}</TableHead>
                            <TableHead className="text-right">
                                {t("table.actions")}
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
                                    {t("table.noData")}
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
                                                ? t("user.roleAdmin")
                                                : t("user.roleUser")}
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
                                                ? t("user.active")
                                                : t("user.blocked")}
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
                                                        {t("user.viewDetail")}
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
                                                        ? t("user.roleUser")
                                                        : t("user.roleAdmin")}
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
                                                        ? t("user.unblock", {
                                                              defaultValue:
                                                                  "Bỏ chặn",
                                                          })
                                                        : t("user.block", {
                                                              defaultValue:
                                                                  "Chặn",
                                                          })}
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(user.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {t("btn.delete", {
                                                        ns: "common",
                                                    })}
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
                        {t("table.rowsPerPage")} {PAGINATION.DEFAULT_LIMIT}
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
                            {t("pagination.prev", { ns: "common" })}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {filters.page} {t("table.of")}{" "}
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
                            {t("pagination.next", { ns: "common" })}
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t("user.deleteConfirm")}
                description={t("confirm.deleteDesc", { ns: "common" })}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
