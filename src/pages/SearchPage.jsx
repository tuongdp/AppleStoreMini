import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Newspaper, Search } from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useGetNewsQuery } from "@/store/api/newsApi";
import ProductCard from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/ProductCardSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { Input } from "@/components/ui/input";
import { PAGINATION } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SeoHead from "@/components/shared/SeoHead";
import { getNewsHref, groupProductsByCategory } from "@/features/products/utils/searchResults";

function getNewsImage(news) {
    return news.thumbnail || news.image;
}

function NewsResultCard({ news }) {
    const image = getNewsImage(news);

    return (
        <Link
            to={getNewsHref(news)}
            className="group flex h-full gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
            <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
                {image ? (
                    <ResponsiveImage
                        src={image}
                        alt={news.title || ""}
                        width={160}
                        height={96}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <Newspaper className="h-5 w-5" />
                )}
            </span>
            <span className="min-w-0 py-1">
                <span className="line-clamp-2 text-sm font-semibold text-foreground">
                    {news.title}
                </span>
                <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {news.title || "Tin tức"}
                </span>
            </span>
        </Link>
    );
}

function SectionHeader({ title, count, className }) {
    return (
        <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <span className="shrink-0 text-sm text-muted-foreground">
                {count} kết quả
            </span>
        </div>
    );
}

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("q") || "";
    const [inputValue, setInputValue] = useState(keyword);
    const page = Number(searchParams.get("page")) || 1;

    const { data, isLoading, isFetching } = useGetProductsQuery(
        {
            search: keyword,
            page,
            limit: PAGINATION.DEFAULT_LIMIT,
        },
        { skip: !keyword },
    );

    const { data: newsData, isFetching: isNewsFetching } = useGetNewsQuery(
        { search: keyword, limit: 6 },
        { skip: !keyword },
    );

    useEffect(() => {
        setInputValue(keyword);
    }, [keyword]);

    const pagination = data?.pagination || {};
    const products = useMemo(() => data?.products || [], [data]);
    const newsResults = newsData?.news || [];
    const productGroups = useMemo(() => groupProductsByCategory(products), [products]);
    const totalProducts = pagination.total || products.length;
    const hasResults = products.length > 0 || newsResults.length > 0;
    const isResultLoading = isLoading || isFetching || isNewsFetching;

    const handleSearch = (e) => {
        e.preventDefault();
        const nextKeyword = inputValue.trim();
        const params = new URLSearchParams();
        if (nextKeyword) params.set("q", nextKeyword);
        if (nextKeyword) params.set("page", "1");
        setSearchParams(params);
    };

    const updatePage = (nextPage) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(nextPage));
        setSearchParams(params);
    };

    return (
        <div className="section-padding py-8 md:py-12">
            <SeoHead
                title="Tìm kiếm"
                description="Tìm kiếm sản phẩm Apple - iPhone, iPad, MacBook, Apple Watch, AirPods và phụ kiện chính hãng."
                url="/search"
            />

            <Breadcrumb
                items={[{ label: "Tìm kiếm" }]}
                className="mb-6"
            />

            <form onSubmit={handleSearch} className="mb-8">
                <div className="relative mx-auto max-w-2xl">
                    <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <label htmlFor="search-page-input" className="sr-only">
                        {"Tìm kiếm sản phẩm và tin tức"}
                    </label>
                    <Input
                        id="search-page-input"
                        type="search"
                        placeholder="Tìm iPhone, iPad, MacBook..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="h-12 rounded-full border-border pl-12 pr-24 text-base"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-full px-6 text-sm"
                        disabled={isResultLoading}
                    >
                        Tìm
                    </Button>
                </div>
            </form>

            {keyword && (
                <div className="mt-4">
                    {isResultLoading ? (
                        <ProductGridSkeleton count={8} />
                    ) : !hasResults ? (
                        <EmptyState
                            icon={Search}
                            title="Không tìm thấy kết quả"
                            description={`Không có sản phẩm hoặc tin tức nào khớp với "${keyword}"`}
                        />
                    ) : (
                        <>
                            {productGroups.map((group) => (
                                <div key={group.category} className="mb-8">
                                    <SectionHeader
                                        title={group.category || "Kết quả"}
                                        count={totalProducts}
                                        className="mb-4"
                                    />
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {group.products.map((product) => (
                                            <ProductCard key={product.id || product.slug} product={product} />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {newsResults.length > 0 && (
                                <div className="mb-8">
                                    <SectionHeader title="Tin tức" count={newsResults.length} />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {newsResults.map((item) => (
                                            <NewsResultCard key={item.id || item.slug} news={item} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        disabled={page <= 1}
                                        onClick={() => updatePage(page - 1)}
                                    >
                                        Trước
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Trang {page} / {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        disabled={page >= pagination.totalPages}
                                        onClick={() => updatePage(page + 1)}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
