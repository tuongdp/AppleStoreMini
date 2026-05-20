import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetNewsQuery } from "@/store/api/newsApi";
import NewsCard from "@/features/news/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Search, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGINATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = [
    { value: "", label: "Tất cả" },
    { value: "iPhone", label: "iPhone" },
    { value: "Mac", label: "Mac" },
    { value: "iPad", label: "iPad" },
    { value: "Watch", label: "Watch" },
    { value: "Âm thanh", label: "Âm thanh" },
    { value: "Phụ kiện", label: "Phụ kiện" },
    { value: "Dịch vụ", label: "Dịch vụ" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "popular", label: "Xem nhiều" },
];

export default function NewsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
    const debouncedSearch = useDebounce(searchInput, 400);

    const page = Number(searchParams.get("page")) || 1;
    const activeCategory = searchParams.get("category") || "";
    const activeSort = searchParams.get("sort") || "newest";

    const { data, isLoading } = useGetNewsQuery({
        page,
        limit: PAGINATION.DEFAULT_LIMIT,
        search: debouncedSearch || undefined,
        category: activeCategory || undefined,
        sort: activeSort === "newest" ? undefined : activeSort,
    });

    const news = data?.news || [];
    const pagination = data?.pagination || {};
    const hasFocusedFilters = !!activeCategory || !!debouncedSearch || page > 1;
    const featuredNews = !hasFocusedFilters ? news[0] : null;
    const gridNews = featuredNews ? news.slice(1) : news;

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    return (
        <div className="section-padding py-8 md:py-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">
                            {"Tin tức"}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {"Cập nhật những tin tức mới nhất về sản phẩm Apple"}
                        </p>
                    </div>
                    {/* Search */}
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={"Tìm kiếm bài viết..."}
                            className="rounded-full pl-9"
                        />
                    </div>
                    <Select
                        value={activeSort}
                        onValueChange={(val) => updateParam("sort", val === "newest" ? "" : val)}
                    >
                        <SelectTrigger className="w-full rounded-full sm:w-40">
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category tabs */}
                <div className="mb-6 -mx-1 flex flex-wrap gap-1">
                    {ALL_CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => updateParam("category", cat.value)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                (activeCategory === cat.value) ||
                                (!activeCategory && cat.value === "")
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-2xl border border-border"
                            >
                                <Skeleton className="aspect-video w-full" />
                                <div className="space-y-2 p-4">
                                    <Skeleton className="h-4 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : news.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <p className="text-lg font-medium text-foreground">
                            {"Không tìm thấy bài viết"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {"Thử tìm kiếm với từ khoá khác"}
                        </p>
                    </div>
                ) : (
                    <>
                        {featuredNews && (
                            <Link
                                to={`/news/${featuredNews.slug}`}
                                reloadDocument
                                className="group mb-6 grid overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-border/80 md:grid-cols-[1.25fr_1fr]"
                            >
                                <div className="aspect-video overflow-hidden bg-muted md:aspect-auto">
                                    {featuredNews.thumbnail && (
                                        <img
                                            src={featuredNews.thumbnail}
                                            alt={featuredNews.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col justify-center p-5 md:p-7">
                                    <Badge variant="secondary" className="mb-3 w-fit">
                                        {featuredNews.category || "Tin nổi bật"}
                                    </Badge>
                                    <h2 className="line-clamp-3 text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-apple-blue">
                                        {featuredNews.title}
                                    </h2>
                                    {featuredNews.excerpt && (
                                        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                                            {featuredNews.excerpt}
                                        </p>
                                    )}
                                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(featuredNews.publishedAt || featuredNews.createdAt).toLocaleDateString("vi-VN")}
                                        </span>
                                        {featuredNews.readTime && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {featuredNews.readTime} phút
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            {featuredNews.viewCount || 0} lượt xem
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {gridNews.map((item) => (
                                <NewsCard key={item._id || item.id} news={item} />
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!isLoading && pagination.totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={page <= 1}
                            onClick={() => updateParam("page", page - 1)}
                        >
                            {"Trước"}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={page >= pagination.totalPages}
                            onClick={() => updateParam("page", page + 1)}
                        >
                            {"Sau"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
