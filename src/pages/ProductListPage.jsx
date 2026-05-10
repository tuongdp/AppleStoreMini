import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX, X } from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productsApi";
import ProductGrid from "@/features/products/components/ProductGrid";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { ROUTES, SORT_OPTIONS, PAGINATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ProductListPage() {
    const { categories } = useCategories();
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = {
        page: Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
        limit: Number(searchParams.get("limit")) || PAGINATION.DEFAULT_LIMIT,
        category: searchParams.get("category") || undefined,
        sort: searchParams.get("sort") || "featured",
        search: searchParams.get("search") || undefined,
        slug: searchParams.get("slug") || undefined,
    };

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
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== "page") params.set("page", "1");
        if (key === "category") params.delete("slug");
        setSearchParams(params);
    };

    const clearAll = () => setSearchParams({});

    const currentCategory = categories.find((c) => c.slug === filters.category);

    const slugGroups = useMemo(() => {
        const source = slugData?.products ?? [];
        if (!filters.category || !source.length) return [];
        const map = new Map();
        source.forEach((p) => {
            const parts = p.slug?.split("-") || [];
            const n = p.slug?.startsWith("apple-") ? 3 : 2;
            if (parts.length > n) {
                const family = parts.slice(0, n).join("-");
                map.set(family, (map.get(family) || 0) + 1);
            }
        });
        return [...map.entries()]
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
    }, [slugData?.products, filters.category]);

    const totalPages = pagination.totalPages || 1;
    const currentPage = filters.page;

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        if (currentPage - delta > 2) range.unshift("...");
        if (currentPage + delta < totalPages - 1) range.push("...");
        if (totalPages > 1) { range.unshift(1); range.push(totalPages); }
        else { range.unshift(1); }
        return [...new Set(range)];
    };

    const hasActiveFilters = filters.category || filters.slug;

    return (
        <div className="section-padding py-8 md:py-12">
            <div className="mx-auto max-w-7xl">
                <Breadcrumb
                    items={[
                        { label: "Sản phẩm", href: ROUTES.PRODUCTS },
                        ...(currentCategory ? [{ label: currentCategory.label }] : []),
                    ]}
                    className="mb-6"
                />

                {/* Category tabs - horizontal scroll */}
                <div className="mb-4 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1.5 min-w-max pb-1">
                        <button
                            onClick={() => updateFilter("category", "")}
                            className={cn(
                                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                !filters.category
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                            )}
                        >
                            {"Tất cả danh mục"}
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => updateFilter("category", cat.slug)}
                                className={cn(
                                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                    filters.category === cat.slug
                                        ? "bg-foreground text-background"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Slug filters + active filter badge */}
                {slugGroups.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-1.5">
                        {slugGroups.map(([slug, count]) => (
                            <button
                                key={slug}
                                onClick={() => updateFilter("slug", filters.slug === slug ? "" : slug)}
                                className={cn(
                                    "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
                                    filters.slug === slug
                                        ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-400"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                )}
                            >
                                {slug.replace(/-/g, " ")}
                                <span className="ml-1 opacity-50">({count})</span>
                            </button>
                        ))}
                        {hasActiveFilters && (
                            <button
                                onClick={clearAll}
                                className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="mr-1 inline h-3 w-3" />
                                Xoá bộ lọc
                            </button>
                        )}
                    </div>
                )}

                {/* Header row: title, count, sort */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {currentCategory ? currentCategory.label : "Tất cả sản phẩm"}
                        </h1>
                        {!isLoading && pagination.total > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {pagination.total} {"sản phẩm"}
                            </p>
                        )}
                    </div>
                    <Select value={filters.sort} onValueChange={(val) => updateFilter("sort", val)}>
                        <SelectTrigger className="w-44 rounded-full text-sm">
                            <SelectValue placeholder={"Sắp xếp theo"} />
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

                {/* Product grid */}
                {products.length === 0 && !isLoading ? (
                    <EmptyState
                        icon={SearchX}
                        title={"products"}
                        description={"productsDesc"}
                        actionLabel={"Xoá bộ lọc"}
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
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled={currentPage <= 1} onClick={() => updateFilter("page", currentPage - 1)}>
                                    ‹
                                </Button>
                                {getPageNumbers().map((page, idx) =>
                                    page === "..." ? (
                                        <span key={`e-${idx}`} className="px-1 text-sm text-muted-foreground">...</span>
                                    ) : (
                                        <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className="h-9 w-9 rounded-full text-sm" onClick={() => updateFilter("page", page)}>
                                            {page}
                                        </Button>
                                    ),
                                )}
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled={currentPage >= totalPages} onClick={() => updateFilter("page", currentPage + 1)}>
                                    ›
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
