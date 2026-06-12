import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/StarRating";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { timeAgo } from "@/lib/utils";

const isVideoUrl = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(url);

export default function ProductCommentItem({ comment }) {
    const medias = comment.images || [];
    const imageUrls = medias.filter((url) => !isVideoUrl(url));
    const videoUrls = medias.filter(isVideoUrl);

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
            <p className="break-words text-sm leading-relaxed text-foreground">
                {comment.comment || comment.content}
            </p>

            {comment.adminReply && (
                <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="mb-1 flex items-center gap-2">
                        <Badge variant="secondary">Cửa hàng phản hồi</Badge>
                        {comment.repliedAt && (
                            <span className="text-xs text-muted-foreground">
                                {timeAgo(comment.repliedAt)}
                            </span>
                        )}
                    </div>
                    <p className="break-words text-sm leading-relaxed text-foreground">
                        {comment.adminReply}
                    </p>
                </div>
            )}

            {/* Images */}
            {imageUrls.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Hình ảnh</p>
                    <div className="flex flex-wrap gap-2">
                        {imageUrls.map((img, index) => (
                            <div
                                key={`img-${index}`}
                                className="h-20 w-20 overflow-hidden rounded-lg bg-muted/30"
                            >
                                <ResponsiveImage
                                    src={img}
                                    alt={`Ảnh ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Videos */}
            {videoUrls.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Video</p>
                    <div className="space-y-2">
                        {videoUrls.map((url, index) => (
                            <div
                                key={`vid-${index}`}
                                className="overflow-hidden rounded-lg border bg-muted/30"
                            >
                                <video
                                    src={url}
                                    controls
                                    preload="metadata"
                                    className="w-full"
                                    style={{ maxHeight: "320px" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
