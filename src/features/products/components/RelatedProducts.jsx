import { useTranslation } from "@/i18n/useTranslation";
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

    const products = data || [];

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
