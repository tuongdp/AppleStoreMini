import { User, Shield } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  RETURNING: "Đang gửi trả",
  RECEIVED: "Đã nhận hàng",
  REFUNDED: "Đã hoàn tiền",
};

const ACTOR_CONFIG = {
  CUSTOMER: { icon: User, label: "Khách hàng" },
  ADMIN: { icon: Shield, label: "Quản trị viên" },
};

function getDescription(entry) {
  const { status, triggeredBy, note } = entry;

  if (status === "PENDING" && triggeredBy === "CUSTOMER") {
    return "Khách hàng gửi yêu cầu trả hàng";
  }
  if (status === "APPROVED" && triggeredBy === "ADMIN") {
    return "Admin duyệt yêu cầu trả hàng";
  }
  if (status === "REJECTED" && triggeredBy === "ADMIN") {
    return note ? `Admin từ chối yêu cầu — Lý do: ${note}` : "Admin từ chối yêu cầu";
  }
  if (status === "RETURNING" && triggeredBy === "CUSTOMER") {
    return note ? `Khách hàng gửi hàng — Mã vận đơn: ${note}` : "Khách hàng gửi hàng";
  }
  if (status === "RECEIVED" && triggeredBy === "ADMIN") {
    return note ? `Admin xác nhận đã nhận hàng — Tình trạng: ${note}` : "Admin xác nhận đã nhận hàng";
  }
  if (status === "REFUNDED" && triggeredBy === "ADMIN") {
    return note ? `Admin hoàn tiền — GD: ${note}` : "Admin hoàn tiền";
  }

  const label = STATUS_LABELS[status] || status;
  return `Trạng thái: ${label}`;
}

export default function ReturnHistoryTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Chưa có lịch sử xử lý
      </p>
    );
  }

  const sorted = [...statusHistory].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="space-y-0">
        {sorted.map((entry, i) => {
          const isLast = i === sorted.length - 1;
          const actor = ACTOR_CONFIG[entry.triggeredBy] || ACTOR_CONFIG.ADMIN;
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
