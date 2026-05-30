import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { usePersonalizedRecommendMutation } from "@/store/api/aiApi";
import { Card, CardContent } from "@/components/ui/card";
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
                        <Card className="group overflow-hidden rounded-2xl border-border transition-shadow hover:shadow-md">
                            <Link
                                to={ROUTES.PRODUCT_DETAIL(product.slug)}
                                className="block"
                            >
                                <div className="aspect-square overflow-hidden bg-muted/50">
                                    {product.image ? (
                                        <ResponsiveImage
                                            src={product.image}
                                            alt={product.name}
                                            width={400}
                                            height={300}
                                            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground/20">
                                            {product.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <CardContent className="p-3 text-center">
                                <Link
                                    to={ROUTES.PRODUCT_DETAIL(product.slug)}
                                    className="block"
                                >
                                    <h3 className="line-clamp-1 text-sm font-semibold transition-colors hover:text-apple-blue">
                                        {product.name}
                                    </h3>
                                </Link>
                                {product.reason && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground italic">
                                        {product.reason}
                                    </p>
                                )}
                                <div className="mt-1.5">
                                    <span className="text-sm font-semibold text-foreground">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                />
            </div>
        </section>
    );
}
