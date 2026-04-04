import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

export function useCategories() {
    const { data = [], isLoading } = useGetCategoriesQuery();

    const categories = data
        .filter((cat) => cat.isActive)
        .sort((a, b) => a.order - b.order)
        .map((cat) => ({
            ...cat,
            label: cat.name,
            href: `/products?category=${cat.slug}`,
        }));

    return { categories, isLoading };
}
