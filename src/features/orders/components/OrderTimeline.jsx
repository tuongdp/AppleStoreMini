import { useTranslation } from "react-i18next";
import { Check, Clock } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

// Thứ tự các bước trong timeline
const TIMELINE_STEPS = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
];

export default function OrderTimeline({ order }) {
    const { t } = useTranslation("order");

    // Nếu đơn bị huỷ — hiện timeline huỷ riêng
    if (
        order.status === ORDER_STATUS.CANCELLED ||
        order.status === ORDER_STATUS.REFUNDING ||
        order.status === ORDER_STATUS.REFUNDED
    ) {
        return <CancelledTimeline order={order} />;
    }

    const currentIndex = TIMELINE_STEPS.indexOf((order.status || "").toLowerCase());

    return (
        <div className="space-y-0">
            {TIMELINE_STEPS.map((step, index) => {
                const isDone = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isPending = index > currentIndex;
                const isLast = index === TIMELINE_STEPS.length - 1;

                // Lấy timestamp tương ứng từ order history nếu có
                const timestamp = order.statusHistory?.find(
                    (h) => h.status === step,
                )?.createdAt;

                return (
                    <div key={step} className="flex gap-4">
                        {/* Left — icon + line */}
                        <div className="flex flex-col items-center">
                            {/* Icon */}
                            <div
                                className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    isDone &&
                                        "border-green-500 bg-green-500 text-white",
                                    isCurrent &&
                                        "border-apple-blue bg-apple-blue text-white",
                                    isPending &&
                                        "border-border bg-background text-muted-foreground",
                                )}
                            >
                                {isDone ? (
                                    <Check className="h-4 w-4" />
                                ) : isCurrent ? (
                                    <Clock className="h-4 w-4" />
                                ) : (
                                    <span className="h-2 w-2 rounded-full bg-border" />
                                )}
                            </div>

                            {/* Vertical line */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        "mt-1 w-0.5 flex-1 min-h-[32px]",
                                        isDone ? "bg-green-500" : "bg-border",
                                    )}
                                />
                            )}
                        </div>

                        {/* Right — content */}
                        <div
                            className={cn(
                                "pb-6 min-w-0 flex-1",
                                isLast && "pb-0",
                            )}
                        >
                            <p
                                className={cn(
                                    "text-sm",
                                    isDone &&
                                        "font-semibold text-green-600 dark:text-green-400",
                                    isCurrent && "font-semibold text-foreground",
                                    isPending && "font-normal text-muted-foreground",
                                )}
                            >
                                {t(`timeline.${step}`)}
                            </p>
                            {timestamp && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {formatDateTime(timestamp)}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Timeline riêng cho đơn bị huỷ
function CancelledTimeline({ order }) {
    const { t } = useTranslation("order");

    const steps = [
        {
            status: ORDER_STATUS.PENDING,
            timestamp: order.statusHistory?.find(
                (h) => h.status === ORDER_STATUS.PENDING,
            )?.createdAt,
            done: true,
        },
        {
            status: ORDER_STATUS.CANCELLED,
            timestamp: order.statusHistory?.find(
                (h) => h.status === ORDER_STATUS.CANCELLED,
            )?.createdAt,
            done: false,
            current: true,
        },
    ];

    return (
        <div className="space-y-0">
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.status} className="flex gap-4">
                        {/* Icon + line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                                    step.done &&
                                        "border-green-500 bg-green-500 text-white",
                                    step.current &&
                                        "border-red-500 bg-red-500 text-white",
                                )}
                            >
                                <Check className="h-4 w-4" />
                            </div>
                            {!isLast && (
                                <div className="mt-1 w-0.5 flex-1 min-h-[32px] bg-border" />
                            )}
                        </div>

                        {/* Content */}
                        <div
                            className={cn(
                                "pb-6 min-w-0 flex-1",
                                isLast && "pb-0",
                            )}
                        >
                            <p
                                className={cn(
                                    "text-sm font-medium",
                                    step.done &&
                                        "text-green-600 dark:text-green-400",
                                    step.current && "text-red-500",
                                )}
                            >
                                {t(`timeline.${step.status}`)}
                            </p>
                            {step.timestamp && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {formatDateTime(step.timestamp)}
                                </p>
                            )}
                            {step.current && order.cancelReason && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t("action.cancelReason")}:{" "}
                                    {order.cancelReason}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
