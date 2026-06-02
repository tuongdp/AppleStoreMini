import { User, Shield, Bot } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị hàng",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã huỷ",
  refunding: "Đang hoàn tiền",
  refunded: "Đã hoàn tiền",
};

const ACTOR_CONFIG = {
  CUSTOMER: { icon: User, label: "Khách hàng" },
  ADMIN: { icon: Shield, label: "Quản trị viên" },
  SYSTEM: { icon: Bot, label: "Hệ thống" },
};

function getDescription(entry) {
  const { status, triggeredBy, note } = entry;

  if (status === "PENDING" && triggeredBy === "CUSTOMER") {
    return "Đơn hàng được tạo";
  }
  if (status === "CONFIRMED" && triggeredBy === "SYSTEM") {
    return note ? `Thanh toán thành công — ${note}` : "Thanh toán thành công";
  }
  if (status === "CONFIRMED" && triggeredBy === "ADMIN") {
    return "Trạng thái chuyển sang Đã xác nhận";
  }
  if (status === "PROCESSING") {
    return "Trạng thái chuyển sang Đang chuẩn bị hàng";
  }
  if (status === "SHIPPING") {
    return "Trạng thái chuyển sang Đang giao hàng";
  }
  if (status === "DELIVERED" && triggeredBy === "CUSTOMER") {
    return "Khách hàng xác nhận đã nhận hàng";
  }
  if (status === "DELIVERED" && triggeredBy === "ADMIN") {
    return "Trạng thái chuyển sang Đã giao hàng";
  }
  if (status === "CANCELLED" && triggeredBy === "CUSTOMER") {
    return note ? `Khách hàng huỷ đơn — ${note}` : "Khách hàng huỷ đơn";
  }
  if (status === "CANCELLED" && triggeredBy === "ADMIN") {
    return note ? `Admin huỷ đơn — ${note}` : "Admin huỷ đơn";
  }
  if (status === "CANCELLED" && triggeredBy === "SYSTEM") {
    return note ? `Thanh toán thất bại — ${note}` : "Thanh toán thất bại";
  }
  if (status === "REFUNDING") {
    return "Trạng thái chuyển sang Đang hoàn tiền";
  }
  if (status === "REFUNDED") {
    return note ? `Đã hoàn tiền — ${note}` : "Đã hoàn tiền";
  }

  const label = STATUS_LABELS[status?.toLowerCase()] || status;
  return note ? `Trạng thái chuyển sang ${label} — ${note}` : `Trạng thái chuyển sang ${label}`;
}

export default function OrderHistoryTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Chưa có lịch sử đơn hàng
      </p>
    );
  }

  const sorted = [...statusHistory].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="max-h-[500px] overflow-y-auto">
      <div className="space-y-0">
        {sorted.map((entry, i) => {
          const isLast = i === sorted.length - 1;
          const actor = ACTOR_CONFIG[entry.triggeredBy] || ACTOR_CONFIG.SYSTEM;
          const ActorIcon = actor.icon;

          return (
            <div key={entry.id || i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <ActorIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {!isLast && (
                  <div className="mt-0.5 w-0.5 flex-1 min-h-[24px] bg-border" />
                )}
              </div>
              <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
                <p className="text-sm font-medium text-foreground">
                  {getDescription(entry)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {actor.label} &middot; {formatDateTime(entry.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
