import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Search, User, ShoppingBag, Package, FilePen, RotateCcw, Tag, MessageSquare, Shield } from "lucide-react";
import { useGetAllUsersQuery } from "@/store/api/usersApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, cn } from "@/lib/utils";

const ACTIVITY_TYPE_CONFIG = {
    created: { label: "Tạo tài khoản", icon: User, tone: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
    updated: { label: "Cập nhật", icon: FilePen, tone: "bg-muted text-muted-foreground" },
    login: { label: "Đăng nhập", icon: Shield, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
    permissions: { label: "Phân quyền", icon: Shield, tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400" },
    role: { label: "Vai trò", icon: Shield, tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
    status: { label: "Trạng thái", icon: Shield, tone: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
    order: { label: "Đơn hàng", icon: ShoppingBag, tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400" },
    product: { label: "Sản phẩm", icon: Package, tone: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400" },
    review: { label: "Đánh giá", icon: MessageSquare, tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400" },
    coupon: { label: "Khuyến mãi", icon: Tag, tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" },
    return: { label: "Trả hàng", icon: RotateCcw, tone: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400" },
};

function compileStaffActivities(staffUsers) {
    if (!staffUsers?.length) return [];

    const activities = [];

    staffUsers.forEach((user) => {
        const rawLogs = user.activityLogs || user.activities || user.auditLogs || [];
        const externalLogs = Array.isArray(rawLogs)
            ? rawLogs.map((log, index) => ({
                id: log.id || log._id || `${user.id}-log-${index}`,
                type: log.type || log.action || "updated",
                title: log.title || log.actionLabel || log.action || "Hoạt động",
                description: log.description || log.message || log.details || "",
                createdAt: log.createdAt || log.timestamp || log.time,
                staffId: user.id,
                staffName: user.fullName || user.email || "Nhân viên",
                staffAvatar: user.avatar,
            }))
            : [];

        const inferredLogs = [
            user.lastLoginAt && {
                id: `${user.id}-login`,
                type: "login",
                title: "Đăng nhập",
                description: `${user.fullName || user.email} vừa đăng nhập vào hệ thống.`,
                createdAt: user.lastLoginAt,
                staffId: user.id,
                staffName: user.fullName || user.email || "Nhân viên",
                staffAvatar: user.avatar,
            },
        ].filter(Boolean);

        activities.push(...externalLogs, ...inferredLogs);
    });

    return activities
        .filter((a) => a.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default function StaffActivityFeed() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 5;

    const { data, isLoading } = useGetAllUsersQuery({ role: "staff", limit: 50 });

    const activities = useMemo(() => {
        const staffUsers = data?.users || [];
        return compileStaffActivities(staffUsers);
    }, [data]);

    const filtered = useMemo(() => {
        if (!search.trim()) return activities;
        const q = search.toLowerCase();
        return activities.filter(
            (a) =>
                a.staffName.toLowerCase().includes(q) ||
                a.title?.toLowerCase().includes(q) ||
                a.description?.toLowerCase().includes(q) ||
                a.type?.toLowerCase().includes(q),
        );
    }, [activities, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Lịch sử hoạt động nhân viên
                </CardTitle>
                <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        type="text"
                        placeholder="Tìm theo tên hoặc hoạt động..."
                        className="h-8 rounded-lg pl-8 text-xs"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3.5 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-10 text-center">
                        <Clock className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                        <p className="mt-2 text-sm font-medium text-foreground">
                            {search ? "Không tìm thấy hoạt động" : "Chưa có hoạt động nào"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {search
                                ? "Thử từ khóa khác."
                                : "Hoạt động của nhân viên sẽ hiển thị tại đây khi có thao tác."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {paged.map((log) => {
                                const config = ACTIVITY_TYPE_CONFIG[log.type] || ACTIVITY_TYPE_CONFIG.updated;
                                const Icon = config.icon;
                                return (
                                    <div key={log.id} className="flex items-start gap-3">
                                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.tone)}>
                                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0 flex-1 border-b border-border pb-3 last:border-0 last:pb-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    to={`/admin/staff/${log.staffId}`}
                                                    className="text-sm font-medium text-foreground hover:text-blue-600"
                                                >
                                                    {log.staffName}
                                                </Link>
                                                <Badge className={cn("text-[10px]", config.tone)}>{config.label}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(log.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                                {log.description || log.title}
                                            </p>
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
            </CardContent>
        </Card>
    );
}
