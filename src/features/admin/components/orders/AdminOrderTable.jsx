import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Loader2, Search } from "lucide-react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/store/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import { toast } from "sonner";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ROUTES, ORDER_STATUS, PAGINATION, RETURN_REQUEST_STATUS } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const PAYMENT_MAP = {
  "cod": "Thanh toán khi nhận hàng",
  "vnpay": "VNPay",
  "paid": "Đã thanh toán",
  "refunded": "Đã hoàn tiền",
  "unknown": "Không xác định",
  "unpaid": "Chưa thanh toán"
};
const STATUS_MAP = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã huỷ",
    refunding: "Đang hoàn tiền",
    refunded: "Đã hoàn tiền",
};
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: ORDER_STATUS.PENDING, label: "Chờ xác nhận" },
  { value: ORDER_STATUS.CONFIRMED, label: "Đã xác nhận" },
  { value: ORDER_STATUS.PROCESSING, label: "Đang xử lý" },
  { value: ORDER_STATUS.SHIPPING, label: "Đang giao hàng" },
  { value: ORDER_STATUS.DELIVERED, label: "Đã giao hàng" },
  { value: ORDER_STATUS.CANCELLED, label: "Đã huỷ" },
];

const NEXT_STATUS = {
  [ORDER_STATUS.PENDING]: ORDER_STATUS.CONFIRMED,
  [ORDER_STATUS.CONFIRMED]: ORDER_STATUS.PROCESSING,
  [ORDER_STATUS.PROCESSING]: ORDER_STATUS.SHIPPING,
  [ORDER_STATUS.SHIPPING]: ORDER_STATUS.DELIVERED,
};

const normalizeStatus = (status) => (status || "").toLowerCase();
const normalizePaymentMethod = (method) => (method || "").toLowerCase();

export default function AdminOrderTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const filters = {
    page: Number(searchParams.get("page")) || 1,
    limit: PAGINATION.DEFAULT_LIMIT,
    status: searchParams.get("status") || undefined,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching } = useGetAllOrdersQuery(filters);
  const [updateStatus] = useUpdateOrderStatusMutation();
  const { exportExcel, exportPDF, isExporting } = useExport();

  const orders = data?.orders || [];
  const pagination = data?.pagination || {};

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

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingId(orderId);

    try {
      await updateStatus({ id: orderId, status }).unwrap();
      toast.success("Cập nhật trạng thái thành công");
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const requestUpdateStatus = (order, status) => {
    setPendingStatusUpdate({
      id: order._id || order.id,
      code: order.code,
      status,
      label: STATUS_MAP[status] || status,
    });
  };

  const handleConfirmUpdateStatus = async () => {
    if (!pendingStatusUpdate) return;
    await handleUpdateStatus(pendingStatusUpdate.id, pendingStatusUpdate.status);
    setPendingStatusUpdate(null);
  };

  const EXPORT_PAYMENT_LABELS = {
    cod: "COD", COD: "COD", vnpay: "VNPay", VNPAY: "VNPay",
  };

  const orderColumns = [
    { key: "code", label: "Mã ĐH" },
    { key: "customerName", label: "Khách hàng" },
    { key: "phone", label: "SĐT" },
    { key: "createdAt", label: "Ngày tạo", format: "date" },
    { key: "status", label: "Trạng thái" },
    { key: "paymentMethod", label: "Thanh toán" },
    { key: "isPaid", label: "TT" },
    { key: "totalAmount", label: "Tổng tiền", format: "currency" },
    { key: "discountAmount", label: "Giảm giá", format: "currency" },
    { key: "shippingFee", label: "Phí ship", format: "currency" },
  ];

  const getOrderExportRows = () => orders.map((o) => ({
    code: `#${o.code}`,
    customerName: o.user?.fullName || "—",
    phone: o.user?.phone || "—",
    createdAt: o.createdAt,
    status: STATUS_MAP[normalizeStatus(o.status)] || o.status,
    paymentMethod: EXPORT_PAYMENT_LABELS[o.paymentMethod] || EXPORT_PAYMENT_LABELS[normalizePaymentMethod(o.paymentMethod)] || o.paymentMethod || "—",
    isPaid: o.isPaid ? "Đã TT" : "Chưa TT",
    totalAmount: o.totalAmount || 0,
    discountAmount: o.discountAmount || 0,
    shippingFee: o.shippingFee || 0,
  }));

  const handleExportOrdersExcel = () => {
    if (orders.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
    exportExcel({ sheets: [{ name: "DonHang", columns: orderColumns, rows: getOrderExportRows() }], filename: `DonHang_${new Date().toISOString().slice(0, 10)}` });
  };

  const handleExportOrdersPDF = () => {
    if (orders.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
    exportPDF({ title: "Danh sách đơn hàng", columns: orderColumns, rows: getOrderExportRows(), filename: `DonHang_${new Date().toISOString().slice(0, 10)}` });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Tìm kiếm đơn hàng"
            placeholder={"Tìm kiếm đơn hàng..."}
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
            <SelectValue placeholder={"Lọc theo trạng thái"} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <ExportButton
          onExportExcel={handleExportOrdersExcel}
          onExportPDF={handleExportOrdersPDF}
          loading={isExporting}
          disabled={isLoading || isFetching}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{"Mã đơn hàng"}</TableHead>
              <TableHead>{"Khách hàng"}</TableHead>
              <TableHead>{"Ngày đặt"}</TableHead>
              <TableHead>{"Tổng tiền"}</TableHead>
              <TableHead>{"Thanh toán"}</TableHead>
              <TableHead>{"Trạng thái"}</TableHead>
              <TableHead>{"Trả hàng"}</TableHead>
              <TableHead className="text-right">{"Thao tác"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  {"Không có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id || order.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium text-foreground">
                      #{order.code}
                    </span>
                  </TableCell>
                  <TableCell>
                                <p className="text-sm font-medium text-foreground">
                                    {order.user?.fullName || "Khách vãng lai"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {order.user?.email || ""}
                                </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-foreground">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {PAYMENT_MAP[normalizePaymentMethod(order.paymentMethod)] || order.paymentMethod}
                    </span>
                    {normalizePaymentMethod(order.paymentMethod) === "vnpay" ? (
                        <p className={order.isPaid ? "text-xs text-green-600 dark:text-green-400" : normalizeStatus(order.status) === ORDER_STATUS.CANCELLED || !order.user ? "text-xs text-red-500" : "text-xs text-muted-foreground"}>
                          {order.isPaid
                            ? "Đã thanh toán"
                            : normalizeStatus(order.status) === ORDER_STATUS.CANCELLED || !order.user
                              ? "Thanh toán thất bại"
                              : "Chờ thanh toán"}
                        </p>
                    ) : (
                        <p className={order.isPaid ? "text-xs text-green-600 dark:text-green-400" : "text-xs text-muted-foreground"}>
                            {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {order.returnRequests?.[0]?.status === RETURN_REQUEST_STATUS.PENDING ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Chờ duyệt
                      </span>
                    ) : order.returnRequests?.[0]?.status === RETURN_REQUEST_STATUS.APPROVED ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Đã duyệt
                      </span>
                    ) : order.returnRequests?.[0]?.status === RETURN_REQUEST_STATUS.REFUNDED ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Đã hoàn tiền
                      </span>
                    ) : order.returnRequests?.[0]?.status === RETURN_REQUEST_STATUS.REJECTED ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Từ chối
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {NEXT_STATUS[normalizeStatus(order.status)] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs"
                          disabled={updatingId === (order._id || order.id)}
                          onClick={() =>
                            requestUpdateStatus(
                              order,
                              NEXT_STATUS[normalizeStatus(order.status)],
                            )
                          }
                        >
                          {updatingId === (order._id || order.id)
                            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            : (STATUS_MAP[NEXT_STATUS[normalizeStatus(order.status)]] || NEXT_STATUS[normalizeStatus(order.status)])}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Xem chi tiết đơn hàng ${order.code}`}
                        asChild
                      >
                        <Link
                          to={ROUTES.ADMIN_ORDER_DETAIL(order._id || order.id)}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
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
              disabled={filters.page <= 1}
              onClick={() => updateParam("page", filters.page - 1)}
              aria-label="Trang trước"
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
              disabled={filters.page >= pagination.totalPages}
              onClick={() => updateParam("page", filters.page + 1)}
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!pendingStatusUpdate}
        onOpenChange={(open) => !open && setPendingStatusUpdate(null)}
        title="Cập nhật trạng thái đơn hàng"
        description={
          pendingStatusUpdate
            ? `Chuyển đơn #${pendingStatusUpdate.code} sang trạng thái ${pendingStatusUpdate.label}. Hành động này có thể ảnh hưởng thông báo và xử lý vận hành.`
            : ""
        }
        confirmLabel="Cập nhật trạng thái"
        onConfirm={handleConfirmUpdateStatus}
        isLoading={!!pendingStatusUpdate && updatingId === pendingStatusUpdate.id}
      />
    </div>
  );
}
