import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_COLOR } from "@/lib/constants";

export default function OrderStatusBadge({ status, className }) {
    const { t } = useTranslation("order");
    const key = (status || "").toLowerCase();

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                ORDER_STATUS_COLOR[key] || "bg-gray-100 text-gray-800",
                className,
            )}
        >
            {t(`status.${key}`)}
        </span>
    );
}
