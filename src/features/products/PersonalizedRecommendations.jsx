import { useEffect, useRef } from "react";
import { usePersonalizedRecommendMutation } from "@/store/api/aiApi";
import ProductCard from "@/components/shared/ProductCard";
import ProductSlider from "@/components/shared/ProductSlider";
import SectionTitle from "@/components/shared/SectionTitle";

export default function PersonalizedRecommendations() {
    const [fetch, { data, isLoading, isError }] = usePersonalizedRecommendMutation();
    const fetched = useRef(false);

    useEffect(() => {
        if (!fetched.current) {
            fetched.current = true;
            fetch();
        }
    }, [fetch]);

    const products = (data?.products || []).slice(0, 6);

    if (isError || (!isLoading && products.length === 0)) return null;

    return (
        <section className="section-padding py-8 md:py-10 lg:py-14">
            <div className="mx-auto max-w-7xl">
                <SectionTitle title="Có thể bạn thích..." className="mb-8" />
                <ProductSlider
                    products={products}
                    isLoading={isLoading}
                    sliderId="personalized-recs"
                    skeletonCount={4}
                    autoplayDelay={5000}
                    renderItem={(product) => <ProductCard product={product} />}
                />
            </div>
        </section>
    );
}
