import { useState } from "react";
import { Search, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useGetEmailLogsQuery } from "@/store/api/emailMarketingApi";
import { formatDate } from "@/lib/utils";

const STATUS_MAP = {
    SENT: { label: "Đã gửi", className: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" },
    OPENED: { label: "Đã mở", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400" },
    CLICKED: { label: "Đã click", className: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400" },
    BOUNCED: { label: "Bounce", className: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400" },
    FAILED: { label: "Thất bại", className: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400" },
};

export default function EmailLogList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const limit = 10;

    const params = { page, limit };
    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;

    const { data, isLoading } = useGetEmailLogsQuery(params);

    const logs = data?.logs ?? [];
    const pagination = data?.pagination;
    const totalPages = pagination ? Math.ceil(pagination.total / limit) : 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="border-border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Chiến dịch</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Thời gian gửi</TableHead>
                                <TableHead>Thời gian mở</TableHead>
                                <TableHead>Lỗi</TableHead>
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
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Chưa có log gửi email nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => {
                                    const status = STATUS_MAP[log.status] || { label: log.status, className: "bg-gray-100" };
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.email}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                                                {log.campaign?.subject || `#${log.campaignId}`}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={status.className}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(log.sentAt)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {log.openedAt ? formatDate(log.openedAt) : "—"}
                                            </TableCell>
                                            <TableCell className="text-red-500 text-sm max-w-[150px] truncate">
                                                {log.errorMessage || "—"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
        </div>
    );
}
