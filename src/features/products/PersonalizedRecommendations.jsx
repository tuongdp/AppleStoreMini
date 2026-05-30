import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { usePersonalizedRecommendMutation } from "@/store/api/aiApi";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
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
                    renderItem={(product) => (
                        <Link
                            to={ROUTES.PRODUCT_DETAIL(product.slug)}
                            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                        >
                            <div className="aspect-square overflow-hidden bg-muted/50">
                                {product.image ? (
                                    <ResponsiveImage
                                        src={product.image}
                                        alt={product.name}
                                        width={300}
                                        height={300}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground/20">
                                        {product.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-1 p-4">
                                <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-apple-blue">
                                    {product.name}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                    {formatPrice(product.price)}
                                </p>
                                {product.reason && (
                                    <p className="mt-auto text-xs italic text-muted-foreground line-clamp-2">
                                        {product.reason}
                                    </p>
                                )}
                            </div>
                        </Link>
                    )}
                />
            </div>
        </section>
    );
}
