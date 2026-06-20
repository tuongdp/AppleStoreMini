import { useGetRelatedProductsQuery } from "@/store/api/productsApi";
import ProductSlider from "@/components/shared/ProductSlider";
import SectionTitle from "@/components/shared/SectionTitle";
import { ROUTES } from "@/lib/constants";

export default function RelatedProducts({ slug, category }) {
    const { data, isLoading } = useGetRelatedProductsQuery(
        { slug, limit: 10 },
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
            <ProductSlider
                products={products}
                isLoading={isLoading}
                sliderId="related"
            />
        </section>
    );
}
