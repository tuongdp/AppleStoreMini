import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/StarRating";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import ImageLightbox from "@/components/shared/ImageLightbox";
import { timeAgo, isVideoUrl } from "@/lib/utils";
import { Play } from "lucide-react";

export default function ProductCommentItem({ comment }) {
    const medias = comment.images || [];
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);

    const openLightbox = useCallback((index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
    }, []);

    const commentText = comment.comment || comment.content || "";
    const MAX_LENGTH = 200;
    const shouldTruncate = commentText.length > MAX_LENGTH;
    const displayText = !shouldTruncate || expanded ? commentText : commentText.slice(0, MAX_LENGTH) + "...";

    const toggleExpand = useCallback(() => setExpanded((prev) => !prev), []);

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

            {/* Comment text */}
            <div>
                <p className="break-words text-sm leading-relaxed text-foreground">
                    {displayText}
                </p>
                {shouldTruncate && (
                    <button
                        type="button"
                        onClick={toggleExpand}
                        className="mt-1 text-xs font-medium text-primary hover:underline"
                    >
                        {expanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                )}
            </div>

            {comment.adminReply && (
                <AdminReply reply={comment} />
            )}

            {/* Media thumbnails */}
            {medias.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Hình ảnh / Video</p>
                    <div className="flex flex-wrap gap-2">
                        {medias.map((url, index) => {
                            const isVideo = isVideoUrl(url);
                            return (
                                <button
                                    key={`media-${index}`}
                                    type="button"
                                    className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted/30 cursor-pointer border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                    onClick={() => openLightbox(index)}
                                >
                                    {isVideo ? (
                                        <>
                                            <video
                                                src={url}
                                                preload="metadata"
                                                className="h-full w-full object-cover"
                                                muted
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <Play className="h-6 w-6 text-white drop-shadow-md" />
                                            </div>
                                        </>
                                    ) : (
                                        <ResponsiveImage
                                            src={url}
                                            alt={`Ảnh ${index + 1}`}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <ImageLightbox
                images={medias}
                open={lightboxOpen}
                onClose={closeLightbox}
                initialIndex={lightboxIndex}
            />
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
