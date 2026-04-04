import { useTranslation } from "react-i18next";
import { useGetRelatedProductsQuery } from "@/store/api/productsApi";
import ProductCard from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/ProductCardSkeleton";
import SectionTitle from "@/components/shared/SectionTitle";
import { ROUTES } from "@/lib/constants";

export default function RelatedProducts({ slug, category }) {
    const { t } = useTranslation("product");

    const { data, isLoading } = useGetRelatedProductsQuery(
        { slug, limit: 4 },
        { skip: !slug },
    );

    const products = (data || []).map((p) => ({
        ...p,
        images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
        colors: typeof p.colors === "string" ? JSON.parse(p.colors) : p.colors,
        storage:
            typeof p.storage === "string" ? JSON.parse(p.storage) : p.storage,
    }));
    if (!isLoading && products.length === 0) return null;

    return (
        <section>
            <SectionTitle
                title={t("detail.relatedProducts")}
                viewAllHref={`${ROUTES.PRODUCTS}?category=${category}`}
                className="mb-6"
            />
            {isLoading ? (
                <ProductGridSkeleton count={4} />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
