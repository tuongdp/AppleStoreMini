import { useSelector } from "react-redux";
import { Trash2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/shared/StarRating";
import { selectCurrentUser } from "@/store/authSlice";
import { timeAgo } from "@/lib/utils";

export default function ProductCommentItem({ comment, onEdit, onDelete }) {
    const currentUser = useSelector(selectCurrentUser);
    const isOwner = currentUser?.id === comment.user?.id;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
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

                {/* Owner actions */}
                {isOwner && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onEdit?.(comment)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete?.(comment.id)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Comment */}
            <p className="text-sm leading-relaxed text-foreground">
                {comment.comment}
            </p>

            {/* Comment images */}
            {comment.images?.length > 0 && (
                <div className="flex gap-2">
                    {comment.images.map((img, index) => (
                        <div
                            key={index}
                            className="h-16 w-16 overflow-hidden rounded-lg bg-muted/30"
                        >
                            <img
                                src={img}
                                alt={`Ảnh ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
