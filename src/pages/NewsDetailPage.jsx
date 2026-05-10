import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Calendar,
    Clock,
    ChevronRight,
    Star,
    Send,
    Trash2,
} from "lucide-react";
import {
    useGetNewsQuery,
    useGetNewsBySlugQuery,
    useGetNewsCommentsQuery,
    useCreateNewsCommentMutation,
    useDeleteNewsCommentMutation,
    useRateNewsMutation,
} from "@/store/api/newsApi";
import { selectIsAuthenticated, selectCurrentUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import RichTextViewer from "@/components/shared/RichTextViewer";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import { toast } from "sonner";

function StarRatingInput({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={cn(
                            "h-6 w-6 transition-colors",
                            (hovered || value) >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground",
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

function SidebarNewsCard({ news, index }) {
    return (
        <Link
            to={`/news/${news.slug}`}
            className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
        >
            {index && (
                <span className="mt-0.5 w-5 shrink-0 text-2xl font-bold leading-none text-muted-foreground/30 tabular-nums">
                    {index}
                </span>
            )}
            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-apple-blue">
                    {news.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {news.readTime ? `${"minRead"} · ` : ""}
                    {"views"}
                </p>
            </div>
        </Link>
    );
}

function NewsSidebar({ currentSlug, currentCategory }) {
    const { data: relatedData } = useGetNewsQuery(
        { category: currentCategory, limit: 5 },
        { skip: !currentCategory },
    );
    const { data: popularData } = useGetNewsQuery({ limit: 10 });

    const related = (relatedData?.news || [])
        .filter((n) => n.slug !== currentSlug)
        .slice(0, 3);

    const popular = (popularData?.news || [])
        .filter((n) => n.slug !== currentSlug)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 4);

    return (
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {related.length > 0 && (
                <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {"Bài viết liên quan"}
                    </h3>
                    <div className="space-y-1">
                        {related.map((item) => (
                            <SidebarNewsCard key={item.id} news={item} />
                        ))}
                    </div>
                </div>
            )}

            {related.length > 0 && popular.length > 0 && <Separator />}

            {popular.length > 0 && (
                <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {"Xem nhiều nhất"}
                    </h3>
                    <div className="space-y-1">
                        {popular.map((item, i) => (
                            <SidebarNewsCard
                                key={item.id}
                                news={item}
                                index={i + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}

export default function NewsDetailPage() {
    const { slug } = useParams();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [commentPage, setCommentPage] = useState(1);

    const { data, isLoading, isError } = useGetNewsBySlugQuery(slug);
    const news = data;

    const { data: commentsData, isLoading: isCommentsLoading } =
        useGetNewsCommentsQuery(
            {
                newsId: news?._id || news?.id,
                params: { page: commentPage, limit: 10 },
            },
            { skip: !news },
        );
    const [createComment, { isLoading: isCommenting }] =
        useCreateNewsCommentMutation();
    const [deleteComment, { isLoading: isDeletingComment }] =
        useDeleteNewsCommentMutation();
    const [rateNews] = useRateNewsMutation();

    const comments = commentsData || [];
    const commentPagination = {};

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await createComment({
                newsId: news._id || news.id,
                content: comment,
            }).unwrap();
            setComment("");
            toast.success("Đã gửi bình luận");
        } catch {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    const handleRate = async (value) => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để tiếp tục");
            return;
        }
        setRating(value);
        try {
            await rateNews({
                newsId: news._id || news.id,
                rating: value,
            }).unwrap();
            toast.success("Đã đánh giá bài viết");
        } catch {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment({
                newsId: news._id || news.id,
                commentId,
            }).unwrap();
            toast.success("Đã xóa bình luận");
        } catch {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    if (isLoading)
        return (
            <div className="section-padding py-8 md:py-12">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="aspect-video w-full rounded-2xl" />
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </div>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-16 w-full rounded-xl"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );

    if (isError || !news)
        return (
            <div className="section-padding flex min-h-[60vh] flex-col items-center justify-center text-center">
                <p className="mb-4 text-muted-foreground">
                    {"Không tìm thấy bài viết"}
                </p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to="/news">{"Về trang tin tức"}</Link>
                </Button>
            </div>
        );

    return (
        <div className="section-padding py-8 md:py-12">
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
                    {/* ── Main content ── */}
                    <div>
                        {/* Breadcrumb */}
                        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Link to="/news" className="hover:text-foreground">
                                {"Tin tức"}
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="line-clamp-1 text-foreground">
                                {news.title}
                            </span>
                        </nav>

                        {/* Title */}
                        <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                            {news.title}
                        </h1>

                        {/* Meta */}
                        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDate(news.publishedAt || news.createdAt)}
                            </span>
                            {news.readTime && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {"minRead"}
                                </span>
                            )}
                            {news.author && (
                                <span>
                                    {"bởi"}{" "}
                                    <span className="font-medium text-foreground">
                                        {news.author}
                                    </span>
                                </span>
                            )}
                            {news.rating > 0 && (
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    {news.rating.toFixed(1)} (
                                    {"ratings"})
                                </span>
                            )}
                        </div>

                        {/* Thumbnail */}
                        {news.thumbnail && (
                            <div className="mb-8 overflow-hidden rounded-2xl">
                                <img
                                    src={news.thumbnail}
                                    alt={news.title}
                                    className="w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <RichTextViewer
                            content={news.content}
                            className="mb-12"
                        />

                        <Separator className="mb-8" />

                        {/* Rating */}
                        <div className="mb-8 rounded-2xl border border-border bg-card p-5">
                            <h3 className="mb-3 text-sm font-medium text-foreground">
                                {"Đánh giá bài viết này"}
                            </h3>
                            <StarRatingInput
                                value={rating || news.userRating || 0}
                                onChange={handleRate}
                            />
                            {!isAuthenticated && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    <Link
                                        to="/login"
                                        className="text-apple-blue hover:underline"
                                    >
                                        {"Đăng nhập"}
                                    </Link>{" "}
                                    {"Đăng nhập để đánh giá"}
                                </p>
                            )}
                        </div>

                        {/* Comments */}
                        <div>
                            <h3 className="mb-5 text-lg font-semibold text-foreground">
                                {"Bình luận"}{" "}
                                {comments.length > 0 &&
                                    `(${commentPagination.total || comments.length})`}
                            </h3>

                            {isAuthenticated ? (
                                <form
                                    onSubmit={handleComment}
                                    className="mb-6 flex gap-3"
                                >
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage
                                            src={currentUser?.avatar}
                                        />
                                        <AvatarFallback className="text-xs">
                                            {currentUser?.fullName
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            value={comment}
                                            onChange={(e) =>
                                                setComment(e.target.value)
                                            }
                                            placeholder={"Viết bình luận của bạn..."}
                                            rows={3}
                                            disabled={isCommenting}
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="rounded-full"
                                                disabled={
                                                    isCommenting ||
                                                    !comment.trim()
                                                }
                                            >
                                                <Send className="mr-1.5 h-3.5 w-3.5" />
                                                {isCommenting
                                                    ? "Đang gửi..."
                                                    : "Gửi bình luận"}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="mb-6 rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                                    <Link
                                        to="/login"
                                        className="text-apple-blue hover:underline"
                                    >
                                        {"Đăng nhập"}
                                    </Link>{" "}
                                    {"Đăng nhập để bình luận"}
                                </div>
                            )}

                            {isCommentsLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-12 w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    {"Chưa có bình luận nào. Hãy là người đầu tiên!"}
                                </p>
                            ) : (
                                <div className="space-y-5">
                                    {comments.map((cmt) => {
                                        const cId = cmt._id || cmt.id;
                                        const isOwner =
                                            currentUser &&
                                            (currentUser._id ||
                                                currentUser.id) ===
                                                (cmt.user?._id || cmt.user?.id);
                                        return (
                                            <div
                                                key={cId}
                                                className="flex gap-3"
                                            >
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage
                                                        src={cmt.user?.avatar}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {cmt.user?.fullName
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div>
                                                            <span className="text-sm font-medium text-foreground">
                                                                {
                                                                    cmt.user
                                                                        ?.fullName
                                                                }
                                                            </span>
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                {formatDateTime(
                                                                    cmt.createdAt,
                                                                )}
                                                            </span>
                                                        </div>
                                                        {isOwner && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteComment(
                                                                        cId,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeletingComment
                                                                }
                                                                className="text-muted-foreground hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-foreground">
                                                        {cmt.content}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {commentPagination.totalPages > 1 && (
                                        <div className="flex justify-center gap-2 pt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                                disabled={commentPage <= 1}
                                                onClick={() =>
                                                    setCommentPage((p) => p - 1)
                                                }
                                            >
                                                {"Trước"}
                                            </Button>
                                            <span className="flex items-center text-sm text-muted-foreground">
                                                {commentPage} /{" "}
                                                {commentPagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                                disabled={
                                                    commentPage >=
                                                    commentPagination.totalPages
                                                }
                                                onClick={() =>
                                                    setCommentPage((p) => p + 1)
                                                }
                                            >
                                                {"Sau"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <NewsSidebar
                        currentSlug={slug}
                        currentCategory={news?.category}
                    />
                </div>
            </div>
        </div>
    );
}
