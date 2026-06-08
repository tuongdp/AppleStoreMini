import { useEffect, useRef } from "react";
import { usePersonalizedRecommendMutation } from "@/store/api/aiApi";
import ProductCard from "@/components/shared/ProductCard";
import ProductSlider from "@/components/shared/ProductSlider";
import SectionTitle from "@/components/shared/SectionTitle";
import useAiFeatureAvailable from "@/features/ai/useAiFeatureAvailable";

export default function PersonalizedRecommendations({ enabled = true }) {
    const [fetch, { data, isLoading, isError }] = usePersonalizedRecommendMutation();
    const { available: aiAvailable } = useAiFeatureAvailable("personalized");
    const fetched = useRef(false);

    useEffect(() => {
        if (enabled && aiAvailable && !fetched.current) {
            fetched.current = true;
            fetch();
        }
    }, [aiAvailable, enabled, fetch]);

    const products = (data?.products || []).slice(0, 6);

    if (!(enabled && aiAvailable)) return null;
    if (isError || (!isLoading && products.length === 0)) return null;

    return (
        <section>
            <SectionTitle title="Có thể bạn thích" className="mb-8" />
            <ProductSlider
                products={products}
                isLoading={isLoading}
                sliderId="personalized-recs"
                skeletonCount={4}
                autoplayDelay={5000}
                renderItem={(product) => <ProductCard product={product} />}
            />
        </section>
    );
}
