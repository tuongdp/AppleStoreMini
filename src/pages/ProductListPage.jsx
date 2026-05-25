import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX, X, SlidersHorizontal } from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productsApi";
import ProductGrid from "@/features/products/components/ProductGrid";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { CATEGORIES, ROUTES, SORT_OPTIONS, PRICE_RANGES, PAGINATION } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

const MAX_PRICE = 100000000;
const OPEN_ENDED_PRICE = 999999999;

const SORT_LABELS = {
    featured: "Nổi bật",
    best_seller: "Bán chạy nhất",
    newest: "Mới nhất",
    price_asc: "Giá thấp đến cao",
    price_desc: "Giá cao đến thấp",
    rating: "Đánh giá cao nhất",
};

const PRODUCT_ARRIVAL_FILTERS = [
    { label: "Mới ra mắt", value: "NEW_RELEASE" },
    { label: "Mới nhập về", value: "RESTOCK" },
];

export default function ProductListPage() {
    const { categories } = useCategories();
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => {
        const raw = {
            page: Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
            limit: Number(searchParams.get("limit")) || PAGINATION.DEFAULT_LIMIT,
            category: searchParams.get("category") || undefined,
            minPrice: searchParams.get("minPrice") || undefined,
            maxPrice: searchParams.get("maxPrice") || undefined,
            sort: searchParams.get("sort") || (searchParams.get("arrivalType") ? "newest" : "featured"),
            search: searchParams.get("search") || undefined,
            slug: searchParams.get("slug") || undefined,
            arrivalType: searchParams.get("arrivalType") || undefined,
        };
        return Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== undefined));
    }, [searchParams]);

    const [priceRange, setPriceRange] = useState([
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || MAX_PRICE,
    ]);

    const { data, isLoading, isFetching } = useGetProductsQuery(filters);

    const slugOptionsFilters = useMemo(() => ({
        category: filters.category,
        limit: 100,
        sort: "featured",
    }), [filters.category]);

    const { data: slugData } = useGetProductsQuery(slugOptionsFilters, {
        skip: !filters.category,
    });

    const products = useMemo(() => data?.products ?? [], [data?.products]);
    const pagination = data?.pagination ?? {};

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, String(value));
        } else {
            params.delete(key);
        }
        if (key !== "page") params.set("page", "1");
        if (key === "category") params.delete("slug");
        setSearchParams(params);
    };

    const updateFilters = (updates) => {
        const params = new URLSearchParams(searchParams);
        updates.forEach(([key, value]) => {
            if (value) {
                params.set(key, String(value));
            } else {
                params.delete(key);
            }
        });
        params.set("page", "1");
        setSearchParams(params);
    };

    const clearAll = () => {
        setSearchParams({});
        setPriceRange([0, MAX_PRICE]);
    };

    const handlePriceCommit = (value) => {
        updateFilters([
            ["minPrice", value[0] > 0 ? String(value[0]) : ""],
            ["maxPrice", value[1] < MAX_PRICE ? String(value[1]) : ""],
        ]);
    };

    const slugGroups = useMemo(() => {
        const source = slugData?.products ?? [];
        if (!filters.category || !source.length) return [];
        const map = new Map();
        source.forEach((product) => {
            const parts = product.slug?.split("-") || [];
            const familyLength = product.slug?.startsWith("apple-") ? 3 : 2;
            if (parts.length > familyLength) {
                const family = parts.slice(0, familyLength).join("-");
                map.set(family, (map.get(family) || 0) + 1);
            }
        });
        return [...map.entries()]
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
    }, [slugData?.products, filters.category]);

    const currentCategory = categories.find((category) => category.slug === filters.category);
    const fallbackCategory = CATEGORIES.find((category) => category.value === filters.category);
    const categoryLabel = currentCategory?.label || fallbackCategory?.label || filters.category;
    const arrivalFilter = PRODUCT_ARRIVAL_FILTERS.find((item) => item.value === filters.arrivalType);
    const pageTitle = arrivalFilter?.label || categoryLabel || "Tất cả sản phẩm";

    const activeFilterChips = [
        arrivalFilter && {
            key: "arrivalType",
            label: arrivalFilter.label,
            onRemove: () => updateFilter("arrivalType", ""),
        },
        filters.category && {
            key: "category",
            label: categoryLabel,
            onRemove: () => updateFilters([["category", ""], ["slug", ""]]),
        },
        filters.slug && {
            key: "slug",
            label: filters.slug.replace(/-/g, " "),
            onRemove: () => updateFilter("slug", ""),
        },
        (filters.minPrice || filters.maxPrice) && {
            key: "price",
            label: `${filters.minPrice ? formatPrice(Number(filters.minPrice)) : "0đ"} - ${filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : "Không giới hạn"}`,
            onRemove: () => {
                setPriceRange([0, MAX_PRICE]);
                updateFilters([["minPrice", ""], ["maxPrice", ""]]);
            },
        },
        filters.sort && filters.sort !== "featured" && {
            key: "sort",
            label: SORT_LABELS[filters.sort] || filters.sort,
            onRemove: () => updateFilter("sort", "featured"),
        },
        filters.search && {
            key: "search",
            label: filters.search,
            onRemove: () => updateFilter("search", ""),
        },
    ].filter(Boolean);

    const totalPages = pagination.totalPages || 1;
    const currentPage = filters.page;

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
                <Breadcrumb
                    items={[
                        { label: "Sản phẩm", href: ROUTES.PRODUCTS },
                        ...(arrivalFilter ? [{ label: arrivalFilter.label }] : []),
                        ...(categoryLabel ? [{ label: categoryLabel }] : []),
                    ]}
                    className="mb-6"
                />

                {slugGroups.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-1.5">
                        {slugGroups.map(([slug, count]) => (
                            <button
                                key={slug}
                                type="button"
                                onClick={() => updateFilter("slug", filters.slug === slug ? "" : slug)}
                                className={cn(
                                    "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                    filters.slug === slug
                                        ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-400"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                )}
                            >
                                {slug.replace(/-/g, " ")}
                                <span className="ml-1 opacity-50">({count})</span>
                            </button>
                        ))}
                    </div>
                )}

                {activeFilterChips.length > 0 && (
                    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang áp dụng">
                        {activeFilterChips.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                data-testid="active-filter-chip"
                                onClick={chip.onRemove}
                                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                aria-label={`Xóa bộ lọc ${chip.label}`}
                            >
                                <span className="truncate">{chip.label}</span>
                                <X className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={clearAll}
                            className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            aria-label="Xóa tất cả bộ lọc"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {pageTitle}
                        </h1>
                        {!isLoading && pagination.total > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {pagination.total} sản phẩm
                            </p>
                        )}
                    </div>
                    <Select value={filters.sort} onValueChange={(value) => updateFilter("sort", value)}>
                        <SelectTrigger className="w-44 rounded-full text-sm">
                            <SelectValue placeholder="Sắp xếp theo" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {SORT_LABELS[option.value] || option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-6 rounded-2xl border border-border bg-card p-4">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {PRODUCT_ARRIVAL_FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => updateFilter("arrivalType", filters.arrivalType === filter.value ? "" : filter.value)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                    filters.arrivalType === filter.value
                                        ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-400/50 dark:bg-blue-400/10 dark:text-blue-400"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Khoảng giá</span>
                        <span className="text-sm text-muted-foreground">
                            {formatPrice(priceRange[0])} - {priceRange[1] >= MAX_PRICE ? "Không giới hạn" : formatPrice(priceRange[1])}
                        </span>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                        {PRICE_RANGES.map((range) => (
                            <button
                                key={range.label}
                                type="button"
                                onClick={() => {
                                    setPriceRange([range.min, range.max]);
                                    updateFilters([
                                        ["minPrice", range.min > 0 ? String(range.min) : ""],
                                        ["maxPrice", range.max < OPEN_ENDED_PRICE ? String(range.max) : ""],
                                    ]);
                                }}
                                className={cn(
                                    "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                    Number(filters.minPrice || 0) === range.min && (Number(filters.maxPrice || OPEN_ENDED_PRICE) === range.max || (!filters.maxPrice && range.max === OPEN_ENDED_PRICE))
                                        ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-400"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <Slider
                        min={0}
                        max={MAX_PRICE}
                        step={1000000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        onValueCommit={handlePriceCommit}
                        className="mt-2"
                    />
                </div>

                {products.length === 0 && !isLoading ? (
                    <EmptyState
                        icon={SearchX}
                        title="Không tìm thấy sản phẩm"
                        description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
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
                                    onClick={() => updateFilter("page", currentPage - 1)}
                                    aria-label="Trang trước"
                                >
                                    {"‹"}
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
                                            onClick={() => updateFilter("page", page)}
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
                                    onClick={() => updateFilter("page", currentPage + 1)}
                                    aria-label="Trang tiếp theo"
                                >
                                    {"›"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
