import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productsApi";
import ProductGrid from "@/features/products/components/ProductGrid";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumb from "@/components/shared/Breadcrumb";
import SectionTitle from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCategories } from "@/hooks/useCategories";
import { ROUTES, SORT_OPTIONS, PAGINATION } from "@/lib/constants";

export default function ProductListPage() {
    const { categories } = useCategories();
    const { t } = useTranslation("product");
    const [searchParams, setSearchParams] = useSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);

    const filters = {
        page: Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
        limit: Number(searchParams.get("limit")) || PAGINATION.DEFAULT_LIMIT,
        category: searchParams.get("category") || undefined,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || "featured",
        search: searchParams.get("search") || undefined,
    };

    const { data, isLoading, isFetching } = useGetProductsQuery(filters);

    // ✅ productsApi transformResponse → { products, pagination }
    const products = data?.products ?? [];
    const pagination = data?.pagination ?? {};

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const currentCategory = categories.find((c) => c.slug === filters.category);

    const totalPages = pagination.totalPages || 1;
    const currentPage = filters.page;

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
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
                        { label: t("page.title"), href: ROUTES.PRODUCTS },
                        ...(currentCategory
                            ? [{ label: currentCategory.label }]
                            : []),
                    ]}
                    className="mb-6"
                />

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <SectionTitle
                            title={
                                currentCategory
                                    ? currentCategory.label
                                    : t("page.allProducts")
                            }
                        />
                        {!isLoading && pagination.total > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {pagination.total} {t("page.results")}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={filters.sort}
                            onValueChange={(val) => updateFilter("sort", val)}
                        >
                            <SelectTrigger className="w-44 rounded-full text-sm">
                                <SelectValue placeholder={t("sort.label")} />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                    {t(opt.label)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full lg:hidden"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-6">
                                <FilterPanel
                                    filters={filters}
                                    categories={categories}
                                    onUpdate={updateFilter}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex gap-6">
                    <aside className="hidden w-52 shrink-0 lg:block">
                        <FilterPanel
                            filters={filters}
                            categories={categories}
                            onUpdate={(k, v) => {
                                updateFilter(k, v);
                                setFilterOpen(false);
                            }}
                        />
                    </aside>

                    <div className="min-w-0 flex-1">
                        {products.length === 0 && !isLoading ? (
                            <EmptyState
                                icon={SearchX}
                                title={t("empty.products")}
                                description={t("empty.productsDesc")}
                                actionLabel={t("filter.reset")}
                                onAction={() => setSearchParams({})}
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
                                            onClick={() =>
                                                updateFilter(
                                                    "page",
                                                    currentPage - 1,
                                                )
                                            }
                                        >
                                            ‹
                                        </Button>

                                        {getPageNumbers().map((page, idx) =>
                                            page === "..." ? (
                                                <span
                                                    key={`ellipsis-${idx}`}
                                                    className="px-1 text-sm text-muted-foreground"
                                                >
                                                    ...
                                                </span>
                                            ) : (
                                                <Button
                                                    key={page}
                                                    variant={
                                                        currentPage === page
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="icon"
                                                    className="h-9 w-9 rounded-full text-sm"
                                                    onClick={() =>
                                                        updateFilter(
                                                            "page",
                                                            page,
                                                        )
                                                    }
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
                                            onClick={() =>
                                                updateFilter(
                                                    "page",
                                                    currentPage + 1,
                                                )
                                            }
                                        >
                                            ›
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterPanel({ filters, categories = [], onUpdate }) {
    const { t } = useTranslation("product");

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("filter.category")}
                </h3>
                <div className="space-y-0.5">
                    <button
                        onClick={() => onUpdate("category", "")}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            !filters.category
                                ? "bg-accent font-medium text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        {t("filter.allCategories")}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => onUpdate("category", cat.slug)}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                filters.category === cat.slug
                                    ? "bg-accent font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                onClick={() => onUpdate("category", "")}
            >
                {t("filter.reset")}
            </Button>
        </div>
    );
}
