import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAdminReturnByIdQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
} from "@/store/api/ordersApi";
import { RETURN_REASON_MAP, RETURN_REQUEST_STATUS_MAP, RETURN_REQUEST_STATUS_COLOR } from "@/lib/constants";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X, Package, MapPin } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PriceDisplay from "@/components/shared/PriceDisplay";

export default function AdminReturnDetail() {
  const { returnId } = useParams();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading } = useGetAdminReturnByIdQuery(returnId);
  const [approveReturn, { isLoading: isApproving }] = useApproveReturnMutation();
  const [rejectReturn, { isLoading: isRejecting }] = useRejectReturnMutation();

  const returnReq = data?.data;
  const order = returnReq?.order;

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>;
  }

  if (!returnReq) {
    return <p className="text-muted-foreground">Không tìm thấy yêu cầu trả hàng</p>;
  }

  const handleApprove = async () => {
    try {
      await approveReturn(returnReq.id).unwrap();
      toast.success("Đã duyệt và xử lý hoàn tiền");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) return;
    try {
      await rejectReturn({ returnId: returnReq.id, adminNote }).unwrap();
      toast.success("Đã từ chối yêu cầu trả hàng");
      setRejectOpen(false);
      setAdminNote("");
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 md:p-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Yêu cầu trả hàng #{returnReq.id.slice(0, 8)}
            </h2>
            <Badge className={RETURN_REQUEST_STATUS_COLOR[returnReq.status]}>
              {RETURN_REQUEST_STATUS_MAP[returnReq.status]}
            </Badge>
            <Badge variant="outline">
              {RETURN_REASON_MAP[returnReq.reason]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Đơn hàng: <span className="font-mono font-medium text-foreground">#{order?.code}</span>
            {" — "}Ngày yêu cầu: {formatDateTime(returnReq.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {returnReq.status === "PENDING" && (
            <>
              <Button
                size="sm"
                className="rounded-full bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={isApproving}
              >
                <Check className="mr-1.5 h-4 w-4" />
                {isApproving ? "Đang xử lý..." : "Duyệt & Hoàn tiền"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full"
                onClick={() => setRejectOpen(true)}
              >
                <X className="mr-1.5 h-4 w-4" />
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Returned items */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                Sản phẩm yêu cầu trả ({returnReq.items?.length || 0})
              </h3>
            </div>

            <div className="space-y-4">
              {returnReq.items?.map((ri) => {
                const oi = ri.orderItem;
                if (!oi) return null;
                return (
                  <div key={ri.id}>
                    <div className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-1.5">
                        <img
                          src={oi.variant?.images?.[0] || oi.variant?.product?.image || ""}
                          alt={oi.variant?.product?.name || ""}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {oi.variant?.product?.name || "Sản phẩm"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[oi.variant?.color, oi.variant?.storage].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-sm">
                            {formatPrice(ri.refundUnitPrice)} x {ri.quantity}
                          </span>
                          <span className="text-sm font-medium">
                            {formatPrice(ri.refundUnitPrice * ri.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>

            <div className="mt-2 text-right">
              <span className="text-sm text-muted-foreground">Tổng hoàn: </span>
              <span className="text-lg font-bold text-destructive">
                {formatPrice(returnReq.refundAmount)}
              </span>
            </div>
          </div>

          {/* Description + images */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">Mô tả của khách hàng</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {returnReq.description || "Không có mô tả"}
            </p>
            {returnReq.images?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {returnReq.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Ảnh ${i + 1}`}
                    className="h-20 w-20 rounded-lg object-cover border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Admin note (if rejected) */}
          {returnReq.adminNote && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Ghi chú của admin</h3>
              <p className="text-sm text-muted-foreground">{returnReq.adminNote}</p>
            </div>
          )}

          {/* Refund transaction */}
          {returnReq.refundTransactionId && (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Thông tin hoàn tiền</h3>
              <p className="text-sm font-mono text-muted-foreground">
                {returnReq.refundTransactionId === "manual"
                  ? "Hoàn tiền thủ công (chuyển khoản)"
                  : `Mã GD: ${returnReq.refundTransactionId}`}
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Order info */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-medium text-foreground">Thông tin đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã ĐH</span>
                <span className="font-mono">{order?.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <Badge variant="outline" className="text-xs">{order?.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng đơn</span>
                <PriceDisplay price={order?.totalAmount || 0} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thanh toán</span>
                <span>{order?.paymentMethod === "VNPAY" ? "VNPay" : order?.paymentMethod === "MOMO" ? "MoMo" : "COD"}</span>
              </div>
              {order?.isPaid && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã thanh toán</span>
                  <span className="text-green-600 font-medium">Có</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer info */}
          {order?.user && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-medium text-foreground">Khách hàng</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.user.fullName}</p>
                <p className="text-muted-foreground">{order.user.email}</p>
              </div>
            </div>
          )}

          {/* Shipping info */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Địa chỉ giao hàng</h3>
            </div>
            <div className="space-y-0.5 text-sm">
              <p className="font-medium">{order?.shippingFullName}</p>
              <p className="text-muted-foreground">{order?.shippingPhone}</p>
              <p className="text-muted-foreground">
                {order?.shippingAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reject dialog */}
      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={(open) => { if (!open) { setRejectOpen(false); setAdminNote(""); } }}
        title="Từ chối yêu cầu trả hàng"
        description={
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nhập lý do từ chối, email sẽ được gửi đến khách hàng
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
