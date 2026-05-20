import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { newsApi } from "@/store/api/newsApi";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function NewsCard({ news, className }) {
    const dispatch = useDispatch();
    const slug = news.slug || news._id || news.id;
    const prefetchNewsDetail = () => {
        if (!slug) return;
        dispatch(
            newsApi.util.prefetch("getNewsBySlug", slug, {
                ifOlderThan: 60,
            }),
        );
    };

    return (
        <Link
            to={`/news/${slug}`}
            reloadDocument
            onMouseEnter={prefetchNewsDetail}
            onFocus={prefetchNewsDetail}
            className={cn(
                "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-border/80 hover:shadow-md",
                className,
            )}
        >
            {/* Thumbnail */}
            <div className="aspect-video w-full overflow-hidden bg-muted">
                {news.thumbnail ? (
                    <img
                        src={news.thumbnail}
                        alt={news.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-3xl">📰</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Category badge */}
                {news.category && (
                    <Badge variant="secondary" className="mb-2 w-fit text-xs">
                        {news.category}
                    </Badge>
                )}

                {/* Title */}
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-apple-blue">
                    {news.title}
                </h3>

                {/* Excerpt */}
                {news.excerpt && (
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                        {news.excerpt}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(news.publishedAt || news.createdAt)}
                        </span>
                        {news.readTime && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {news.readTime} {"phút"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
