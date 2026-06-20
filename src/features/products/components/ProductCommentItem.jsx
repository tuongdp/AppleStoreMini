import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/StarRating";
import { timeAgo } from "@/lib/utils";

export default function ProductCommentItem({ comment }) {
    const [expanded, setExpanded] = useState(false);

    const commentText = comment.comment || comment.content || "";
    const MAX_LENGTH = 200;
    const shouldTruncate = commentText.length > MAX_LENGTH;
    const displayText = !shouldTruncate || expanded ? commentText : commentText.slice(0, MAX_LENGTH) + "...";

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage
                        src={comment.user?.avatar}
                        alt={comment.user?.fullName}
                    />
                    <AvatarFallback className="text-xs">
                        {comment.user?.fullName?.charAt(0)?.toUpperCase() ||
                            "U"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                            {comment.user?.fullName}
                        </p>
                        {comment.isVerifiedPurchase && (
                            <Badge
                                variant="outline"
                                className="border-green-500/30 bg-green-50 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            >
                                {"Đã mua hàng"}
                            </Badge>
                        )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                        <StarRating rating={comment.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                            {timeAgo(comment.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <p className="break-words text-sm leading-relaxed text-foreground">
                    {displayText}
                </p>
                {shouldTruncate && (
                    <button
                        type="button"
                        onClick={() => setExpanded((prev) => !prev)}
                        className="mt-1 text-xs font-medium text-primary hover:underline"
                    >
                        {expanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                )}
            </div>

            {comment.adminReply && (
                <AdminReply reply={comment} />
            )}
        </div>
    );
}

function AdminReply({ reply }) {
    const [expanded, setExpanded] = useState(false);
    const MAX_LENGTH = 200;
    const text = reply.adminReply || "";
    const shouldTruncate = text.length > MAX_LENGTH;
    const displayText = !shouldTruncate || expanded ? text : text.slice(0, MAX_LENGTH) + "...";

    return (
        <div className="rounded-lg border bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary">Cửa hàng phản hồi</Badge>
                {reply.repliedAt && (
                    <span className="text-xs text-muted-foreground">
                        {timeAgo(reply.repliedAt)}
                    </span>
                )}
            </div>
            <p className="break-words text-sm leading-relaxed text-foreground">
                {displayText}
            </p>
            {shouldTruncate && (
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                    {expanded ? "Thu gọn" : "Xem thêm"}
                </button>
            )}
        </div>
    );
}
