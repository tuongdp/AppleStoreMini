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
import AISearchToggle from "@/features/ai/AISearchToggle";
import { useAiSearchMutation } from "@/store/api/aiApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
                    {news.excerpt || news.category || "Tin tức"}
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
    const [page, setPage] = useState(1);

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

    const [aiMode, setAiMode] = useState(() => searchParams.get("ai") === "1");
    const [aiSearch, { isLoading: isAiLoading }] = useAiSearchMutation();
    const [aiProducts, setAiProducts] = useState(null);

    useEffect(() => {
        if (keyword && searchParams.get("ai") === "1" && !aiProducts) {
            const runAiSearch = async () => {
                try {
                    const res = await aiSearch({ query: keyword }).unwrap();
                    setAiProducts(res.products || []);
                } catch {
                    toast.error("Không thể kết nối AI, vui lòng thử lại");
                }
            };
            runAiSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pagination = data?.pagination || {};
    const products = useMemo(
        () => (aiMode && aiProducts ? aiProducts : (data?.products || [])),
        [aiMode, aiProducts, data?.products],
    );
    const newsResults = newsData?.news || [];
    const productGroups = useMemo(() => groupProductsByCategory(products), [products]);
    const totalProducts = aiMode && aiProducts ? products.length : (pagination.total || products.length);
    const hasResults = products.length > 0 || newsResults.length > 0;
    const isResultLoading = isLoading || isFetching || isNewsFetching || isAiLoading;

    const handleSearch = async (e) => {
        e.preventDefault();
        const nextKeyword = inputValue.trim();

        if (aiMode && nextKeyword) {
            try {
                const res = await aiSearch({ query: nextKeyword }).unwrap();
                setAiProducts(res.products || []);
                const params = new URLSearchParams();
                params.set("q", nextKeyword);
                setSearchParams(params);
            } catch {
                toast.error("Không thể kết nối AI, vui lòng thử lại");
            }
        } else {
            setAiProducts(null);
            const params = new URLSearchParams();
            if (nextKeyword) params.set("q", nextKeyword);
            setSearchParams(params);
        }
        setPage(1);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <div className="section-padding py-8 md:py-12">
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
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={aiMode ? "VD: iPhone pin trâu chụp đẹp dưới 20 triệu" : "Tìm kiếm sản phẩm, tin tức..."}
                        className="h-12 rounded-full pl-12 pr-32 text-base"
                        name="search"
                        autoComplete="off"
                        data-testid="search-page-input"
                    />
                    <Button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-6"
                    >
                        {"Tìm kiếm"}
                    </Button>
                </div>
            </form>
            <AISearchToggle enabled={aiMode} onToggle={setAiMode} disabled={isAiLoading} />

            {keyword && (
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-foreground">
                        {"Kết quả tìm kiếm cho"}{" "}
                        <span className="text-apple-blue">
                            &ldquo;{keyword}&rdquo;
                        </span>
                        {aiMode && aiProducts && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-apple-blue/10 px-2 py-0.5 text-xs font-normal text-apple-blue">
                                AI
                            </span>
                        )}
                    </h1>
                    {!isResultLoading && hasResults && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {totalProducts} sản phẩm · {newsResults.length} tin tức
                        </p>
                    )}
                </div>
            )}

            {!keyword ? (
                <EmptyState
                    icon={Search}
                    title={"Tìm kiếm sản phẩm và tin tức"}
                    description={"Nhập tên sản phẩm hoặc chủ đề tin tức bạn cần tìm."}
                />
            ) : isResultLoading ? (
                <ProductGridSkeleton count={PAGINATION.DEFAULT_LIMIT} />
            ) : !hasResults ? (
                <EmptyState
                    icon={Search}
                    title={"Không tìm thấy kết quả"}
                    description={"Thử tìm bằng tên sản phẩm hoặc từ khóa ngắn hơn."}
                    actionLabel={"Xóa tìm kiếm"}
                    onAction={() => {
                        setInputValue("");
                        setSearchParams({});
                    }}
                />
            ) : (
                <div className="space-y-10">
                    {products.length > 0 && (
                        <section>
                            <SectionHeader title="Sản phẩm" count={totalProducts} />
                            <div className="space-y-8">
                                {productGroups.map((group) => (
                                    <div key={group.category}>
                                        <div className="mb-3 flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {group.category}
                                            </h3>
                                            <span className="text-xs text-muted-foreground">
                                                ({group.products.length})
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {group.products.map((product) => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="mt-10 flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        {"Trước"}
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {"Trang"} {page} {"trong"} {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        disabled={page >= pagination.totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        {"Sau"}
                                    </Button>
                                </div>
                            )}
                        </section>
                    )}

                    {newsResults.length > 0 && (
                        <section>
                            <SectionHeader title="Tin tức liên quan" count={newsResults.length} />
                            <div className="grid gap-3 md:grid-cols-2">
                                {newsResults.map((news) => (
                                    <NewsResultCard key={news.id || news._id || news.slug} news={news} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
