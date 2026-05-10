import { cn } from "@/lib/utils";
import { ORDER_STATUS_COLOR } from "@/lib/constants";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã huỷ",
  refunding: "Đang hoàn tiền",
  refunded: "Đã hoàn tiền",
};

export default function OrderStatusBadge({ status, className }) {
    const key = (status || "").toLowerCase();

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                ORDER_STATUS_COLOR[key] || "bg-gray-100 text-gray-800",
                className,
            )}
        >
            {STATUS_LABELS[key] || key}
        </span>
    );
}
