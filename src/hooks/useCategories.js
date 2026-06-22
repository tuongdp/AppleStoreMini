import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useMemo } from "react";

export function useCategories() {
    const { data = [], isLoading } = useGetCategoriesQuery();

    const categories = useMemo(() =>
        data
            .filter((cat) => cat.isActive)
            .sort((a, b) => a.order - b.order)
            .map((cat) => ({
                ...cat,
                label: cat.name,
                value: cat.slug,
                href: `/products?category=${cat.slug}`,
            })),
        [data],
    );

    return { categories, isLoading };
}
