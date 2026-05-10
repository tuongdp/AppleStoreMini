import { useSearchParams } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { Search } from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productsApi";
import ProductCard from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/ProductCardSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Input } from "@/components/ui/input";
import { ROUTES, PAGINATION } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SearchPage() {
    const { t } = useTranslation("product");
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

    const products = data?.products || [];
    const pagination = data?.pagination || {};

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (inputValue.trim()) {
            params.set("q", inputValue.trim());
        }
        setSearchParams(params);
        setPage(1);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <div className="section-padding py-8 md:py-12">
            {/* Breadcrumb */}
            <Breadcrumb
                items={[{ label: t("search.placeholder") }]}
                className="mb-6"
            />

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="relative mx-auto max-w-2xl">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={t("search.placeholder")}
                        className="h-12 rounded-full pl-12 pr-32 text-base"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-6"
                    >
                        {t("search.submit", { defaultValue: "Tìm kiếm" })}
                    </Button>
                </div>
            </form>

            {/* Results header */}
            {keyword && (
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-foreground">
                        {t("page.searchResults")}{" "}
                        <span className="text-apple-blue">
                            &ldquo;{keyword}&rdquo;
                        </span>
                    </h1>
                    {!isLoading && pagination.total > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("page.showing")} {pagination.total}{" "}
                            {t("page.results")}
                        </p>
                    )}
                </div>
            )}

            {/* Content */}
            {!keyword ? (
                <EmptyState
                    icon="🔍"
                    title={t("search.placeholder")}
                    description={t("search.noResultsDesc")}
                />
            ) : isLoading || isFetching ? (
                <ProductGridSkeleton count={PAGINATION.DEFAULT_LIMIT} />
            ) : products.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title={t("search.noResults")}
                    description={t("search.noResultsDesc")}
                    actionLabel={t("filter.reset")}
                    onAction={() => {
                        setInputValue("");
                        setSearchParams({});
                    }}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                {t("pagination.prev", { ns: "common" })}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {t("pagination.page", { ns: "common" })} {page}{" "}
                                {t("pagination.of", { ns: "common" })}{" "}
                                {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                {t("pagination.next", { ns: "common" })}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
