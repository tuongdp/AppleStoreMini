import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "./OrderStatusBadge";
import CommentModal from "./CommentModal";
import { formatPrice, formatDateTime, parseJsonField } from "@/lib/utils";
import { ROUTES, ORDER_STATUS, RETURN_REQUEST_STATUS } from "@/lib/constants";

const isValidId = (value) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "undefined" &&
    value !== "null";

const getItemProduct = (item) => item.product || item.variant?.product || null;

const getItemProductId = (item) => {
    const product = getItemProduct(item);
    return [
        product?._id,
        product?.id,
        item.productId,
        item.variant?.productId,
    ].find(isValidId);
};

const getItemName = (item) => getItemProduct(item)?.name || item.name || "Sản phẩm";

const getShortItemName = (item) =>
    getItemName(item).split(" ").slice(0, 3).join(" ");

const getFirstImage = (...sources) => {
    for (const source of sources) {
        const images = parseJsonField(source);
        if (Array.isArray(images) && images[0]) return images[0];
        if (typeof source === "string" && source.trim()) return source;
    }
    return "";
};

const getItemImage = (item) =>
    getFirstImage(
        item.variant?.images,
        item.images,
        item.image,
        getItemProduct(item)?.images,
        getItemProduct(item)?.image,
    );

function ReturnStatusBadge({ returnRequest }) {
    if (!returnRequest) return null;
    if (returnRequest.status === RETURN_REQUEST_STATUS.PENDING) {
        return (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Chờ trả hàng
            </span>
        );
    }
    return null;
}

export default function OrderCard({ order }) {
    const [commentItem, setCommentItem] = useState(null);

    // Track sản phẩm đã bình luận trong session
    // key: productId, value: comment data đã submit (hoặc true nếu không có data)
    const [commentedMap, setCommentedMap] = useState({});

    const visibleItems = order.items?.slice(0, 3) || [];
    const remainCount = (order.items?.length || 0) - visibleItems.length;
    const isDelivered = (order.status || "").toLowerCase() === ORDER_STATUS.DELIVERED;
    const deliveredItems = isDelivered ? order.items || [] : [];

    // Chưa bình luận = chưa có isReviewed từ server VÀ chưa bình luận trong session
    const unreviewedItems = deliveredItems.filter((item) => {
        const pid = getItemProductId(item);
        return pid && !item.isReviewed && !commentedMap[pid];
    });

    // Đã bình luận trong session hiện tại
    const reviewedInSession = deliveredItems.filter((item) => {
        const pid = getItemProductId(item);
        return !!commentedMap[pid];
    });

    // Đã bình luận từ server (isReviewed = true), chưa bình luận lại trong session
    const reviewedFromServer = deliveredItems.filter((item) => {
        const pid = getItemProductId(item);
        return item.isReviewed && !commentedMap[pid];
    });

    const handleCommentSuccess = (item, commentData) => {
        const pid = getItemProductId(item);
        if (!pid) return;

        setCommentedMap((prev) => ({
            ...prev,
            [pid]: commentData || true,
        }));
        setCommentItem(null);
    };

    // Mở modal — nếu đã bình luận trong session thì truyền existing comment vào
    const handleOpenComment = (item) => {
        const pid = getItemProductId(item);
        if (!pid) return;

        const existing = commentedMap[pid];
        setCommentItem({
            ...item,
            _product: getItemProduct(item),
            _productId: pid,
            _image: getItemImage(item),
            existingComment: typeof existing === "object" ? existing : null,
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
                    <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <ReturnStatusBadge returnRequest={order.returnRequests?.[0]} />
                    </div>
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
                                    src={getItemImage(item)}
                                    alt={getItemName(item)}
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
                                {getItemName(item)}
                                {(() => {
                                    const parts = [
                                        item.color || item.selectedColor || "",
                                        item.storage || item.selectedStorage || "",
                                        item.ram || "",
                                        item.edition || "",
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
                                {"và"}{" "}
                                {remainCount} {"quantity"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Comment section */}
                {showReviewSection && (
                    <>
                        <Separator />
                        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                            {/* Chờ bình luận */}
                            {unreviewedItems.length > 0 && (
                                <>
                                    <span className="text-xs text-muted-foreground">
                                        {"Chờ bình luận:"}
                                    </span>
                                    {unreviewedItems.map((item, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 rounded-full text-xs"
                                            onClick={() =>
                                                handleOpenComment(item)
                                            }
                                        >
                                            <Star className="mr-1 h-3 w-3" />
                                            {getShortItemName(item)}
                                        </Button>
                                    ))}
                                </>
                            )}

                            {/* Đã bình luận trong session — click để xem lại */}
                            {reviewedInSession.map((item, index) => (
                                <Button
                                    key={`session-${index}`}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 rounded-full text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                                    onClick={() => handleOpenComment(item)}
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {getShortItemName(item)}
                                </Button>
                            ))}

                            {/* Đã bình luận từ server */}
                            {reviewedFromServer.map((item, index) => (
                                <span
                                    key={`server-${index}`}
                                    className="flex items-center gap-1 text-xs text-muted-foreground"
                                >
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    {getShortItemName(item)}
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
                            {"Tổng cộng"}:{" "}
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
                            {"Thông tin đơn hàng"}
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Comment Modal */}
            {commentItem && (
                <CommentModal
                    open={!!commentItem}
                    onOpenChange={(open) => !open && setCommentItem(null)}
                    product={commentItem._product}
                    image={commentItem._image}
                    productId={commentItem._productId}
                    orderId={order._id || order.id}
                    existingComment={commentItem.existingComment}
                    onSuccess={(commentData) =>
                        handleCommentSuccess(commentItem, commentData)
                    }
                />
            )}
        </>
    );
}
