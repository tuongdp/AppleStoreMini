import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Search, Eye } from "lucide-react";
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
import { ROUTES, ORDER_STATUS, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_OPTIONS = [
  { value: "all", labelKey: "status.all" },
  { value: ORDER_STATUS.PENDING, labelKey: "status.pending" },
  { value: ORDER_STATUS.CONFIRMED, labelKey: "status.confirmed" },
  { value: ORDER_STATUS.PROCESSING, labelKey: "status.processing" },
  { value: ORDER_STATUS.SHIPPING, labelKey: "status.shipping" },
  { value: ORDER_STATUS.DELIVERED, labelKey: "status.delivered" },
  { value: ORDER_STATUS.CANCELLED, labelKey: "status.cancelled" },
];

const NEXT_STATUS = {
  [ORDER_STATUS.PENDING]: ORDER_STATUS.CONFIRMED,
  [ORDER_STATUS.CONFIRMED]: ORDER_STATUS.PROCESSING,
  [ORDER_STATUS.PROCESSING]: ORDER_STATUS.SHIPPING,
  [ORDER_STATUS.SHIPPING]: ORDER_STATUS.DELIVERED,
};

export default function AdminOrderTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [updatingId, setUpdatingId] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const filters = {
    page: Number(searchParams.get("page")) || 1,
    limit: PAGINATION.DEFAULT_LIMIT,
    status: searchParams.get("status") || undefined,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading } = useGetAllOrdersQuery(filters);
  const [updateStatus] = useUpdateOrderStatusMutation();

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
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
                {t(opt.labelKey, { ns: "order" })}
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
              <TableHead>{"Mã đơn hàng"}</TableHead>
              <TableHead>{"Khách hàng"}</TableHead>
              <TableHead>{"Ngày đặt"}</TableHead>
              <TableHead>{"Tổng tiền"}</TableHead>
              <TableHead>{"Thanh toán"}</TableHead>
              <TableHead>{"Trạng thái"}</TableHead>
              <TableHead className="text-right">{"Thao tác"}</TableHead>
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
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
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
                      {order.user?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.user?.email}
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
                      {t(`payment.${order.paymentMethod}`, { ns: "order" })}
                    </span>
                    <p
                      className={
                        order.isPaid
                          ? "text-xs text-green-600 dark:text-green-400"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {order.isPaid
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {NEXT_STATUS[(order.status || "").toLowerCase()] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs"
                          disabled={updatingId === (order._id || order.id)}
                          onClick={() =>
                            handleUpdateStatus(
                              order._id || order.id,
                              NEXT_STATUS[(order.status || "").toLowerCase()],
                            )
                          }
                        >
                          {updatingId === (order._id || order.id)
                            ? "Đang tải..."
                            : t(`status.${NEXT_STATUS[(order.status || "").toLowerCase()]}`, {
                                ns: "order",
                              })}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link
                          to={ROUTES.ADMIN_ORDER_DETAIL(order._id || order.id)}
                        >
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {"Hàng mỗi trang"} {PAGINATION.DEFAULT_LIMIT}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={filters.page <= 1}
              onClick={() => updateParam("page", filters.page - 1)}
            >
              {"Trước"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filters.page} {"trong"} {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => updateParam("page", filters.page + 1)}
            >
              {"Sau"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
