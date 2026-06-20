import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import {
    useGetAllOrdersQuery,
    useUpdateOrderStatusMutation,
    useCancelOrderByAdminMutation,
} from "@/store/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import { ROUTES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "DELIVERED", label: "Đã giao" },
    { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_COLOR = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPING: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const NEXT_STATUS = {
    PENDING: { value: "CONFIRMED", label: "Xác nhận" },
    CONFIRMED: { value: "SHIPPING", label: "Giao hàng" },
    SHIPPING: { value: "DELIVERED", label: "Đã giao" },
};

export default function AdminOrderTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [cancelId, setCancelId] = useState(null);
    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        status: searchParams.get("status") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading, isFetching } = useGetAllOrdersQuery(filters);
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderByAdminMutation();

    const orders = data?.orders ?? [];
    const pagination = data?.pagination ?? {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const handleNextStatus = async (order) => {
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        try {
            await updateStatus({ id: order.id || order._id, status: next.value }).unwrap();
            toast.success(`Đã chuyển sang ${next.label}`);
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleCancel = async () => {
        try {
            await cancelOrder({ id: cancelId, reason: "Admin huỷ" }).unwrap();
            toast.success("Đã huỷ đơn hàng");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        } finally {
            setCancelId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        aria-label="Tìm đơn hàng"
                        placeholder="Tìm mã đơn hoặc tên khách..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="rounded-full pl-9"
                    />
                </div>
                <Select value={searchParams.get("status") || "all"} onValueChange={(val) => updateParam("status", val)}>
                    <SelectTrigger className="w-40 rounded-full"><SelectValue placeholder="Lọc trạng thái" /></SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Mã đơn</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead className="text-right">Tổng tiền</TableHead>
                            <TableHead>Thanh toán</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                                </TableRow>
                            ))
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Không có đơn hàng</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const oid = order.id || order._id;
                                return (
                                    <TableRow key={oid}>
                                        <TableCell>
                                            <span className="font-medium text-foreground">#{order.code}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{order.user?.fullName || order.user?.email || "—"}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-medium">{formatPrice(order.totalAmount)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("text-xs", order.isPaid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400")}>
                                                {order.isPaid ? "Đã thanh toán" : order.paymentMethod === "COD" ? "COD" : "Chưa TT"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("text-xs", STATUS_COLOR[order.status] || "")}>
                                                {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {NEXT_STATUS[order.status] && (
                                                    <Button variant="outline" size="sm" className="h-8 rounded-full text-xs" disabled={isUpdating} onClick={() => handleNextStatus(order)}>
                                                        {NEXT_STATUS[order.status].label}
                                                    </Button>
                                                )}
                                                {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setCancelId(oid)} disabled={isCancelling} aria-label="Huỷ đơn">
                                                        <Ban className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <Link to={ROUTES.ADMIN_ORDER_DETAIL(oid)} aria-label="Xem chi tiết">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
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
                    <p className="text-sm text-muted-foreground">Hàng mỗi trang {PAGINATION.DEFAULT_LIMIT}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={filters.page <= 1} onClick={() => updateParam("page", filters.page - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{filters.page} / {pagination.totalPages}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={filters.page >= pagination.totalPages} onClick={() => updateParam("page", filters.page + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)} title="Huỷ đơn hàng?" description="Hành động này không thể hoàn tác." onConfirm={handleCancel} isLoading={isCancelling} />
        </div>
    );
}
