import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { usePersonalizedRecommendMutation } from "@/store/api/aiApi";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { Skeleton } from "@/components/ui/skeleton";

export default function PersonalizedRecommendations({ context = "homepage" }) {
    const [fetch, { data, isLoading, isError }] = usePersonalizedRecommendMutation();
    const fetched = useRef(false);

    useEffect(() => {
        if (!fetched.current) {
            fetched.current = true;
            fetch();
        }
    }, [fetch]);

    const products = (data?.products || []).slice(0, 4);
    const show = !isLoading && !isError && products.length > 0;

    if (isLoading) {
        return (
            <section className="section-padding py-8 md:py-10 lg:py-14">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!show) return null;

    return (
        <section className={`section-padding py-8 md:py-10 lg:py-14 ${context === "homepage" ? "" : "border-t border-border"}`}>
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-apple-blue" />
                    <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                        Có thể bạn thích...
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {products.map((product) => (
                        <Link
                            key={product.slug}
                            to={ROUTES.PRODUCT_DETAIL(product.slug)}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
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
                    ))}
                </div>
            </div>
        </section>
    );
}
