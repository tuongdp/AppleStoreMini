import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "./OrderStatusBadge";
import ReviewModal from "./ReviewModal";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ROUTES, ORDER_STATUS } from "@/lib/constants";

export default function OrderCard({ order }) {
    const { t } = useTranslation("order");

    const [reviewItem, setReviewItem] = useState(null);

    // Track sản phẩm đã review trong session
    // key: productId, value: review data đã submit (hoặc true nếu không có data)
    const [reviewedMap, setReviewedMap] = useState({});

    const visibleItems = order.items?.slice(0, 3) || [];
    const remainCount = (order.items?.length || 0) - visibleItems.length;
    const isDelivered = order.status === ORDER_STATUS.DELIVERED;
    const deliveredItems = isDelivered ? order.items || [] : [];

    // Chưa review = chưa có isReviewed từ server VÀ chưa review trong session
    const unreviewedItems = deliveredItems.filter((item) => {
        const pid = item.product?._id || item.product?.id;
        return !item.isReviewed && !reviewedMap[pid];
    });

    // Đã review trong session hiện tại
    const reviewedInSession = deliveredItems.filter((item) => {
        const pid = item.product?._id || item.product?.id;
        return !!reviewedMap[pid];
    });

    // Đã review từ server (isReviewed = true), chưa review lại trong session
    const reviewedFromServer = deliveredItems.filter((item) => {
        const pid = item.product?._id || item.product?.id;
        return item.isReviewed && !reviewedMap[pid];
    });

    const handleReviewSuccess = (item, reviewData) => {
        const pid = item.product?._id || item.product?.id;
        setReviewedMap((prev) => ({
            ...prev,
            [pid]: reviewData || true,
        }));
        setReviewItem(null);
    };

    // Mở modal — nếu đã review trong session thì truyền existing review vào
    const handleOpenReview = (item) => {
        const pid = item.product?._id || item.product?.id;
        const existing = reviewedMap[pid];
        setReviewItem({
            ...item,
            existingReview: typeof existing === "object" ? existing : null,
        });
    };

    const showReviewSection =
        isDelivered &&
        (unreviewedItems.length > 0 ||
            reviewedInSession.length > 0 ||
            reviewedFromServer.length > 0);

    return (
        <>
            <div className="rounded-xl border border-border bg-card transition-colors hover:border-border/80">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                            #{order.code}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                        </span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>

                <Separator />

                {/* Items */}
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex items-center gap-2">
                        {visibleItems.map((item, index) => (
                            <div
                                key={index}
                                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1.5"
                            >
                                <img
                                    src={
                                        item.product?.images?.[0] ||
                                        item.product?.image
                                    }
                                    alt={item.product?.name}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        ))}
                        {remainCount > 0 && (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-sm font-medium text-muted-foreground">
                                +{remainCount}
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        {visibleItems.map((item, index) => (
                            <p
                                key={index}
                                className="truncate text-sm text-foreground"
                            >
                                {item.product?.name}
                                {(() => {
                                    const parts = [
                                        item.color || item.selectedColor || "",
                                        item.storage || item.selectedStorage || "",
                                        item.ram || "",
                                    ].filter(Boolean);
                                    return parts.length > 0 ? (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            · {parts.join(" · ")}
                                        </span>
                                    ) : null;
                                })()}
                            </p>
                        ))}
                        {remainCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {t("pagination.and", { ns: "common" })}{" "}
                                {remainCount} {t("item.quantity")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Review section */}
                {showReviewSection && (
                    <>
                        <Separator />
                        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                            {/* Chờ đánh giá */}
                            {unreviewedItems.length > 0 && (
                                <>
                                    <span className="text-xs text-muted-foreground">
                                        {t("review.pending", {
                                            defaultValue: "Chờ đánh giá:",
                                        })}
                                    </span>
                                    {unreviewedItems.map((item, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 rounded-full text-xs"
                                            onClick={() =>
                                                handleOpenReview(item)
                                            }
                                        >
                                            <Star className="mr-1 h-3 w-3" />
                                            {item.product?.name
                                                ?.split(" ")
                                                .slice(0, 3)
                                                .join(" ")}
                                        </Button>
                                    ))}
                                </>
                            )}

                            {/* Đã đánh giá trong session — click để xem lại */}
                            {reviewedInSession.map((item, index) => (
                                <Button
                                    key={`session-${index}`}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 rounded-full text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                                    onClick={() => handleOpenReview(item)}
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {item.product?.name
                                        ?.split(" ")
                                        .slice(0, 3)
                                        .join(" ")}
                                </Button>
                            ))}

                            {/* Đã đánh giá từ server */}
                            {reviewedFromServer.map((item, index) => (
                                <span
                                    key={`server-${index}`}
                                    className="flex items-center gap-1 text-xs text-muted-foreground"
                                >
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    {item.product?.name
                                        ?.split(" ")
                                        .slice(0, 3)
                                        .join(" ")}
                                </span>
                            ))}
                        </div>
                    </>
                )}

                <Separator />

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="text-sm">
                        <span className="text-muted-foreground">
                            {t("detail.grandTotal")}:{" "}
                        </span>
                        <span className="font-semibold text-foreground">
                            {formatPrice(order.totalAmount)}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        asChild
                    >
                        <Link to={ROUTES.ORDER_DETAIL(order._id || order.id)}>
                            {t("detail.orderInfo")}
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Review Modal */}
            {reviewItem && (
                <ReviewModal
                    open={!!reviewItem}
                    onOpenChange={(open) => !open && setReviewItem(null)}
                    product={reviewItem.product}
                    orderId={order._id || order.id}
                    existingReview={reviewItem.existingReview}
                    onSuccess={(reviewData) =>
                        handleReviewSuccess(reviewItem, reviewData)
                    }
                />
            )}
        </>
    );
}
