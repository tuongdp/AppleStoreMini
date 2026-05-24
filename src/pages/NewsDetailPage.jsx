import { Link, useParams } from "react-router-dom";
import { Calendar, ChevronRight, Clock, Eye, Share2 } from "lucide-react";
import { useGetNewsBySlugQuery, useGetNewsQuery } from "@/store/api/newsApi";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import RichTextViewer from "@/components/shared/RichTextViewer";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

function SidebarNewsCard({ news, index }) {
    return (
        <Link
            to={`/news/${news.slug}`}
            className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
        >
            {news.thumbnail ? (
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <ResponsiveImage
                        src={news.thumbnail}
                        alt={news.title}
                        width={160}
                        height={112}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                </div>
            ) : index ? (
                <span className="mt-0.5 w-5 shrink-0 text-2xl font-bold leading-none text-muted-foreground/30 tabular-nums">
                    {index}
                </span>
            ) : null}
            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-apple-blue">
                    {news.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {news.readTime ? `${news.readTime} phút đọc · ` : ""}
                    {news.viewCount || 0} lượt xem
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
        .filter((item) => item.slug !== currentSlug)
        .slice(0, 3);

    const popular = (popularData?.news || [])
        .filter((item) => item.slug !== currentSlug)
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 4);

    return (
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {related.length > 0 && (
                <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Bài viết liên quan
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
                        Xem nhiều nhất
                    </h3>
                    <div className="space-y-1">
                        {popular.map((item, index) => (
                            <SidebarNewsCard key={item.id} news={item} index={index + 1} />
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}

export default function NewsDetailPage() {
    const { slug } = useParams();
    const { data: news, isLoading, isError } = useGetNewsBySlugQuery(slug);

    const handleShare = async () => {
        const shareUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: news.title, url: shareUrl });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Đã sao chép liên kết bài viết");
            }
        } catch {
            toast.error("Không thể chia sẻ bài viết");
        }
    };

    if (isLoading) {
        return (
            <div className="section-padding py-8 md:py-12">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="aspect-video w-full rounded-2xl" />
                            {[...Array(6)].map((_, index) => (
                                <Skeleton key={index} className="h-4 w-full" />
                            ))}
                        </div>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, index) => (
                                <Skeleton key={index} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !news) {
        return (
            <div className="section-padding flex min-h-[60vh] flex-col items-center justify-center text-center">
                <p className="mb-4 text-muted-foreground">Không tìm thấy bài viết</p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to="/news">Về trang tin tức</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="section-padding py-8 md:py-12">
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
                    <div>
                        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Link to="/news" className="hover:text-foreground">
                                Tin tức
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="line-clamp-1 text-foreground">{news.title}</span>
                        </nav>

                        <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                            {news.title}
                        </h1>

                        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDate(news.publishedAt || news.createdAt)}
                            </span>
                            {news.readTime && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {news.readTime} phút đọc
                                </span>
                            )}
                            {news.author && (
                                <span>
                                    bởi <span className="font-medium text-foreground">{news.author}</span>
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                {news.viewCount || 0} lượt xem
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="ml-auto rounded-full"
                                onClick={handleShare}
                            >
                                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                                Chia sẻ
                            </Button>
                        </div>

                        {news.thumbnail && (
                            <div className="mb-8 overflow-hidden rounded-2xl">
                                <ResponsiveImage
                                    src={news.thumbnail}
                                    alt={news.title}
                                    width={960}
                                    height={540}
                                    className="w-full object-cover"
                                    loading="eager"
                                    fetchPriority="high"
                                />
                            </div>
                        )}

                        <RichTextViewer content={news.content} className="mb-12" />
                    </div>

                    <NewsSidebar currentSlug={slug} currentCategory={news?.category} />
                </div>
            </div>
        </div>
    );
}
