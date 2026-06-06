import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useGetSeriesQuery } from "@/store/api/seriesApi";
import ProductGrid from "@/features/products/components/ProductGrid";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BannerSlider from "@/components/shared/BannerSlider";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { CATEGORIES, PAGINATION, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import SeoHead from "@/components/shared/SeoHead";
import {
    buildSeriesFilters,
    buildSeriesFiltersFromSeries,
    getCategorySliderImages,
} from "@/features/products/utils/productListFilters";

const PRODUCT_SORT_OPTIONS = [
    { label: "Nổi bật", value: "featured", sort: "featured" },
    { label: "Bán chạy", value: "best_seller", sort: "best_seller" },
    { label: "Giảm giá", value: "discount", sort: "discount" },
    { label: "Mới ra mắt", value: "new_release", sort: "newest", arrivalType: "NEW_RELEASE" },
    { label: "Mới nhập về", value: "restocked", sort: "newest", arrivalType: "RESTOCK" },
    { label: "Giá cao đến thấp", value: "price_desc", sort: "price_desc" },
    { label: "Giá thấp đến cao", value: "price_asc", sort: "price_asc" },
];

function getSortOption(searchParams) {
    const arrivalType = searchParams.get("arrivalType");
    if (arrivalType === "NEW_RELEASE") return PRODUCT_SORT_OPTIONS.find((option) => option.value === "new_release");
    if (arrivalType === "RESTOCK") return PRODUCT_SORT_OPTIONS.find((option) => option.value === "restocked");
    const sort = searchParams.get("sort") || "featured";
    return PRODUCT_SORT_OPTIONS.find((option) => option.sort === sort && !option.arrivalType) || PRODUCT_SORT_OPTIONS[0];
}

function ScrollNav({ label, children, wrap = false }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <p className="shrink-0 whitespace-nowrap text-sm font-medium leading-9 text-foreground sm:w-24">
                {label}
            </p>
            <div
                className={cn(
                    "-mx-4 flex min-w-0 flex-1 gap-2 px-4 pb-1 sm:mx-0 sm:px-0",
                    wrap ? "flex-wrap overflow-visible" : "overflow-x-auto scrollbar-hide",
                )}
            >
                {children}
            </div>
        </div>
    );
}

export default function ProductListPage() {
    const { categories } = useCategories();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeSortOption = useMemo(() => getSortOption(searchParams), [searchParams]);

    const filters = useMemo(() => {
        const raw = {
            page: Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
            limit: Number(searchParams.get("limit")) || PAGINATION.DEFAULT_LIMIT,
            category: searchParams.get("category") || undefined,
            sort: activeSortOption.sort,
            search: searchParams.get("search") || undefined,
            series: searchParams.get("series") || undefined,
            slug: searchParams.get("slug") || undefined,
            arrivalType: activeSortOption.arrivalType,
        };
        return Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== undefined));
    }, [activeSortOption, searchParams]);

    const { data, isLoading, isFetching } = useGetProductsQuery(filters);

    const seriesQuery = useMemo(() => ({
        category: filters.category,
        limit: 120,
        sort: "featured",
    }), [filters.category]);

    const { data: seriesData } = useGetProductsQuery(seriesQuery, {
        skip: !filters.category,
    });
    const { data: dbSeries = [] } = useGetSeriesQuery(
        { category: filters.category },
        { skip: !filters.category },
    );

    const products = useMemo(() => data?.products ?? [], [data?.products]);
    const pagination = data?.pagination ?? {};
    const totalPages = pagination.totalPages || 1;
    const currentPage = filters.page;

    const currentCategory = categories.find((category) => category.slug === filters.category);
    const fallbackCategory = CATEGORIES.find((category) => category.value === filters.category);
    const categoryLabel = currentCategory?.label || fallbackCategory?.label || "Tất cả sản phẩm";
    const searchKeyword = searchParams.get("search")?.trim();
    const pageTitle = searchKeyword
        ? `Tìm kiếm ${searchKeyword}`
        : categoryLabel;
    const seoDescription = filters.category
        ? `Khám phá ${categoryLabel} chính hãng tại Apple Store Mini. Sắp xếp theo nhu cầu, lọc theo series và xem giá mới nhất.`
        : "Khám phá tất cả sản phẩm Apple chính hãng - iPhone, iPad, MacBook, Apple Watch, AirPods, phụ kiện. Giá tốt, bảo hành chính hãng.";
    const canonicalPath = `${ROUTES.PRODUCTS}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const categorySliderImages = getCategorySliderImages(currentCategory);
    const categorySlides = categorySliderImages.map((image, index) => ({
        id: `${currentCategory?.slug || "category"}-${index}`,
        image,
    }));

    const seriesFilters = useMemo(() => {
        const databaseFilters = buildSeriesFiltersFromSeries(dbSeries);
        if (databaseFilters.length > 0) {
            return databaseFilters.map((series) => ({ ...series, source: "series" }));
        }
        return buildSeriesFilters(seriesData?.products ?? [], filters.category)
            .map((series) => ({ ...series, source: "slug" }));
    }, [dbSeries, filters.category, seriesData?.products]);

    const activeSeries = filters.series || filters.slug;

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams);
        updates.forEach(([key, value]) => {
            if (value) params.set(key, String(value));
            else params.delete(key);
        });
        params.set("page", "1");
        setSearchParams(params);
    };

    const updatePage = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(page));
        setSearchParams(params);
    };

    const clearSeries = () => {
        updateParams([["series", ""], ["slug", ""]]);
    };

    const updateSeries = (series) => {
        const nextValue = activeSeries === series.slug ? "" : series.slug;
        updateParams([
            ["series", series.source === "series" ? nextValue : ""],
            ["slug", series.source === "slug" ? nextValue : ""],
        ]);
    };

    const updateSort = (option) => {
        updateParams([
            ["sort", option.sort === "featured" ? "" : option.sort],
            ["arrivalType", option.arrivalType || ""],
        ]);
    };

    const clearAll = () => setSearchParams({});

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i += 1) {
            range.push(i);
        }
        if (currentPage - delta > 2) range.unshift("...");
        if (currentPage + delta < totalPages - 1) range.push("...");
        if (totalPages > 1) {
            range.unshift(1);
            range.push(totalPages);
        } else {
            range.unshift(1);
        }
        return [...new Set(range)];
    };

    return (
        <div className="section-padding py-8 md:py-12">
            <div className="mx-auto max-w-7xl">
                <SeoHead
                    title={pageTitle}
                    description={seoDescription}
                    url={canonicalPath}
                />

                <Breadcrumb
                    items={[
                        { label: "Sản phẩm", href: ROUTES.PRODUCTS },
                        ...(filters.category ? [{ label: categoryLabel }] : []),
                    ]}
                    className="mb-6"
                />

                <div className="mb-6">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                        {categoryLabel}
                    </h1>
                    {!isLoading && pagination.total > 0 && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            {pagination.total} sản phẩm
                        </p>
                    )}
                </div>

                {categorySlides.length > 0 && (
                    <div className="mb-8 overflow-hidden rounded-xl border border-border">
                        <BannerSlider slides={categorySlides} />
                    </div>
                )}

                <div className="mb-8 space-y-5 border-y border-border py-4">
                    {seriesFilters.length > 0 && (
                        <ScrollNav label="Lọc" wrap>
                            <button
                                type="button"
                                onClick={clearSeries}
                                className={cn(
                                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                    !activeSeries
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                )}
                            >
                                Tất cả
                            </button>
                            {seriesFilters.map((series) => (
                                <button
                                    key={series.slug}
                                    type="button"
                                    onClick={() => updateSeries(series)}
                                    className={cn(
                                        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                        activeSeries === series.slug
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                    )}
                                >
                                    {series.label}
                                </button>
                            ))}
                        </ScrollNav>
                    )}

                    <ScrollNav label="Sắp xếp theo">
                        {PRODUCT_SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => updateSort(option)}
                                className={cn(
                                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                    activeSortOption.value === option.value
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </ScrollNav>
                </div>

                {products.length === 0 && !isLoading ? (
                    <EmptyState
                        icon={SearchX}
                        title="Không tìm thấy sản phẩm"
                        description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                        actionLabel="Xóa bộ lọc"
                        onAction={clearAll}
                    />
                ) : (
                    <>
                        <ProductGrid
                            products={products}
                            isLoading={isLoading || isFetching}
                            skeletonCount={PAGINATION.DEFAULT_LIMIT}
                        />

                        {!isLoading && totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-full"
                                    disabled={currentPage <= 1}
                                    onClick={() => updatePage(currentPage - 1)}
                                    aria-label="Trang trước"
                                >
                                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                </Button>
                                {getPageNumbers().map((page, index) =>
                                    page === "..." ? (
                                        <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">...</span>
                                    ) : (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-sm"
                                            onClick={() => updatePage(page)}
                                            aria-label={`Trang ${page}`}
                                        >
                                            {page}
                                        </Button>
                                    ),
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-full"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => updatePage(currentPage + 1)}
                                    aria-label="Trang tiếp theo"
                                >
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
