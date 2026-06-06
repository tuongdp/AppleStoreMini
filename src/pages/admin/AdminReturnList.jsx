import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
import { Check, ChevronLeft, ChevronRight, Eye, Search, MoreHorizontal, X } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const [rejectId, setRejectId] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading, isFetching } = useGetAllReturnsQuery({ page, limit: 10, status: statusFilter !== "all" ? statusFilter : undefined, search: search || undefined });
  const [approveReturn, { isLoading: isApproving }] = useApproveReturnMutation();
  const [rejectReturn, { isLoading: isRejecting }] = useRejectReturnMutation();

  const returns = data?.data || [];
  const pagination = data?.pagination;

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set(key, String(value));
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    setSearchParams(params);
  };

  const handleApprove = async (id) => {
    try {
      await approveReturn(id).unwrap();
      toast.success("Đã duyệt yêu cầu trả hàng");
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

  const { exportExcel, exportPDF, isExporting } = useExport();

  const returnColumns = [
    { key: "orderCode", label: "Mã ĐH" },
    { key: "customerName", label: "Khách hàng" },
    { key: "reason", label: "Lý do" },
    { key: "refundAmount", label: "Số tiền hoàn", format: "currency" },
    { key: "status", label: "Trạng thái" },
    { key: "adminNote", label: "Ghi chú" },
    { key: "createdAt", label: "Ngày yêu cầu", format: "date" },
  ];

  const getReturnExportRows = () => returns.map((ret) => ({
    orderCode: `#${ret.order?.code || "—"}`,
    customerName: ret.user?.fullName || "—",
    reason: RETURN_REASON_MAP[ret.reason] || ret.reason,
    refundAmount: ret.refundAmount || 0,
    status: RETURN_REQUEST_STATUS_MAP[ret.status] || ret.status,
    adminNote: ret.adminNote || "—",
    createdAt: ret.createdAt,
  }));

  const handleExportReturnsExcel = () => {
    if (returns.length === 0) { toast("Không có dữ liệu để xuất"); return; }
    exportExcel({ sheets: [{ name: "TraHang", columns: returnColumns, rows: getReturnExportRows() }], filename: `TraHang_${new Date().toISOString().slice(0, 10)}` });
  };

  const handleExportReturnsPDF = () => {
    if (returns.length === 0) { toast("Không có dữ liệu để xuất"); return; }
    exportPDF({ title: "Danh sách yêu cầu trả hàng", columns: returnColumns, rows: getReturnExportRows(), filename: `TraHang_${new Date().toISOString().slice(0, 10)}` });
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Tìm kiếm yêu cầu trả hàng"
            placeholder="Tìm mã đơn hàng..."
            className="pl-9 rounded-full"
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger className="w-40 rounded-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <ExportButton
          onExportExcel={handleExportReturnsExcel}
          onExportPDF={handleExportReturnsPDF}
          loading={isExporting}
          disabled={isLoading || isFetching}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
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
            {isLoading || isFetching ? (
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
                      <p className="text-sm font-medium">{ret.user?.fullName || "Khách vãng lai"}</p>
                      <p className="text-xs text-muted-foreground">{ret.user?.email || "—"}</p>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở thao tác yêu cầu trả hàng</span>
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ret.status === "PENDING" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleApprove(ret.id)}
                              disabled={isApproving}
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                              Duyệt yêu cầu
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRejectId(ret.id)}
                              className="text-destructive"
                            >
                              <X className="mr-2 h-4 w-4" aria-hidden="true" />
                              Từ chối
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/returns/${ret.id}`}>
                            <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                            Xem chi tiết
                          </Link>
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
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={page <= 1}
            onClick={() => updateParam("page", page - 1)}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={page >= pagination.totalPages}
            onClick={() => updateParam("page", page + 1)}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
