import { useGetRelatedProductsQuery } from "@/store/api/productsApi";
import ProductCard from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/ProductCardSkeleton";
import SectionTitle from "@/components/shared/SectionTitle";
import { ROUTES } from "@/lib/constants";

export default function RelatedProducts({ slug, category }) {
    const { data, isLoading } = useGetRelatedProductsQuery(
        { slug, limit: 8 },
        { skip: !slug },
    );

    const products = data || [];
    const viewAllHref = category
        ? `${ROUTES.PRODUCTS}?category=${encodeURIComponent(category)}`
        : ROUTES.PRODUCTS;

    if (!isLoading && products.length === 0) return null;

    return (
        <section>
            <SectionTitle
                title={"Sản phẩm liên quan"}
                viewAllHref={viewAllHref}
                className="mb-6"
            />
            {isLoading ? (
                <ProductGridSkeleton count={8} />
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
