import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllReturnsQuery, useApproveReturnMutation, useRejectReturnMutation } from "@/store/api/ordersApi";
import { RETURN_REQUEST_STATUS_MAP, RETURN_REQUEST_STATUS_COLOR, RETURN_REASON_MAP } from "@/lib/constants";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X, Eye, Search } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";

const STATUS_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Đã hoàn tiền", value: "REFUNDED" },
];

export default function AdminReturnList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectId, setRejectId] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading } = useGetAllReturnsQuery({ page, limit: 10, status: statusFilter !== "all" ? statusFilter : undefined, search: search || undefined });
  const [approveReturn, { isLoading: isApproving }] = useApproveReturnMutation();
  const [rejectReturn, { isLoading: isRejecting }] = useRejectReturnMutation();

  const returns = data?.data || [];
  const pagination = data?.pagination;

  const handleApprove = async (id) => {
    try {
      await approveReturn(id).unwrap();
      toast.success("Đã duyệt và xử lý hoàn tiền");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !adminNote.trim()) return;
    try {
      await rejectReturn({ returnId: rejectId, adminNote }).unwrap();
      toast.success("Đã từ chối yêu cầu trả hàng");
      setRejectId(null);
      setAdminNote("");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yêu cầu trả hàng</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý yêu cầu trả hàng và hoàn tiền
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn hàng..."
            className="pl-9 rounded-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 rounded-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã ĐH</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Số tiền trả</TableHead>
              <TableHead>Ngày yêu cầu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không có yêu cầu trả hàng nào
                </TableCell>
              </TableRow>
            ) : (
              returns.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-mono text-sm">
                    #{ret.order?.code || "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{ret.user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{ret.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {RETURN_REASON_MAP[ret.reason] || ret.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(ret.refundAmount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(ret.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge className={RETURN_REQUEST_STATUS_COLOR[ret.status] || ""}>
                      {RETURN_REQUEST_STATUS_MAP[ret.status] || ret.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {ret.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(ret.id)}
                            disabled={isApproving}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setRejectId(ret.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <Link to={`/admin/returns/${ret.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Reject dialog */}
      <ConfirmDialog
        open={!!rejectId}
        onOpenChange={(open) => { if (!open) { setRejectId(null); setAdminNote(""); } }}
        title="Từ chối yêu cầu trả hàng"
        description={
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nhập lý do từ chối để gửi cho khách hàng
            </p>
            <Textarea
              placeholder="Lý do từ chối..."
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </div>
        }
        confirmLabel="Xác nhận từ chối"
        onConfirm={handleReject}
        isLoading={isRejecting}
      />
    </div>
  );
}
