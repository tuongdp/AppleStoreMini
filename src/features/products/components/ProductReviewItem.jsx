import { useTranslation } from "@/i18n/useTranslation";
import { useSelector } from "react-redux";
import { Trash2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/shared/StarRating";
import { selectCurrentUser } from "@/store/authSlice";
import { timeAgo } from "@/lib/utils";

export default function ProductReviewItem({ review, onEdit, onDelete }) {
    const { t } = useTranslation("product");
    const currentUser = useSelector(selectCurrentUser);
    const isOwner = currentUser?.id === review.user?.id;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage
                            src={review.user?.avatar}
                            alt={review.user?.fullName}
                        />
                        <AvatarFallback className="text-xs">
                            {review.user?.fullName?.charAt(0)?.toUpperCase() ||
                                "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                                {review.user?.fullName}
                            </p>
                            {review.isVerifiedPurchase && (
                                <Badge
                                    variant="outline"
                                    className="border-green-500/30 bg-green-50 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                >
                                    {t("review.verifiedPurchase")}
                                </Badge>
                            )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">
                                {timeAgo(review.createdAt)}
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
                            onClick={() => onEdit?.(review)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete?.(review.id)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Comment */}
            <p className="text-sm leading-relaxed text-foreground">
                {review.comment}
            </p>

            {/* Review images */}
            {review.images?.length > 0 && (
                <div className="flex gap-2">
                    {review.images.map((img, index) => (
                        <div
                            key={index}
                            className="h-16 w-16 overflow-hidden rounded-lg bg-muted/30"
                        >
                            <img
                                src={img}
                                alt={`Review ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
