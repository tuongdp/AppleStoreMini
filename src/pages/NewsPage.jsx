import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetNewsQuery } from "@/store/api/newsApi";
import NewsCard from "@/features/news/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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

export default function NewsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
    const debouncedSearch = useDebounce(searchInput, 400);

    const page = Number(searchParams.get("page")) || 1;
    const activeCategory = searchParams.get("category") || "";

    const { data, isLoading } = useGetNewsQuery({
        page,
        limit: PAGINATION.DEFAULT_LIMIT,
        search: debouncedSearch || undefined,
        category: activeCategory || undefined,
    });

    const news = data?.news || [];
    const pagination = data?.pagination || {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {news.map((item) => (
                            <NewsCard key={item._id || item.id} news={item} />
                        ))}
                    </div>
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
