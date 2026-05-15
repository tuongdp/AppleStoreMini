import { useState } from "react";
import { Search, Trash2, Users, UserCheck, UserX, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
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
import { toast } from "sonner";
import {
    useGetSubscribersQuery,
    useGetSubscriberStatsQuery,
    useDeleteSubscriberMutation,
} from "@/store/api/emailMarketingApi";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: "Đang theo dõi", value: "active" },
    { label: "Đã hủy", value: "unsubscribed" },
];

export default function SubscriberList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteId, setDeleteId] = useState(null);
    const limit = 10;

    const params = { page, limit };
    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;

    const { data: stats, isLoading: statsLoading } = useGetSubscriberStatsQuery();
    const { data, isLoading } = useGetSubscribersQuery(params);
    const [deleteSubscriber, { isLoading: deleting }] = useDeleteSubscriberMutation();

    const subscribers = data?.subscribers ?? [];
    const pagination = data?.pagination;
    const totalPages = pagination ? Math.ceil(pagination.total / limit) : 0;

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteSubscriber(deleteId).unwrap();
            toast.success("Đã xóa subscriber");
            setDeleteId(null);
        } catch {
            toast.error("Không thể xóa subscriber");
        }
    };

    return (
        <div className="space-y-4">
            {/* Stats cards */}
            <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Tổng subscribers</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-7 w-16" /> : (
                            <span className="text-xl font-bold text-foreground">{stats?.total ?? 0}</span>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Đang theo dõi</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30">
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-7 w-16" /> : (
                            <span className="text-xl font-bold text-foreground">{stats?.active ?? 0}</span>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Đã hủy</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                            <UserX className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-7 w-16" /> : (
                            <span className="text-xl font-bold text-foreground">{stats?.unsubscribed ?? 0}</span>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo email hoặc tên..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="border-border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Tên</TableHead>
                                <TableHead>Nguồn</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày đăng ký</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : subscribers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Không có subscriber nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subscribers.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.email}</TableCell>
                                        <TableCell>{sub.name || "—"}</TableCell>
                                        <TableCell className="text-muted-foreground">{sub.source || "website"}</TableCell>
                                        <TableCell>
                                            <Badge className={sub.isActive ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"}>
                                                {sub.isActive ? "Active" : "Unsubscribed"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(sub.subscribedAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                onClick={() => setDeleteId(sub.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Trang {page} / {totalPages} — {pagination?.total ?? 0} kết quả
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                            Trước
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                            Sau
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteId}
                title="Xóa subscriber?"
                description="Subscriber sẽ bị xóa vĩnh viễn khỏi hệ thống."
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
