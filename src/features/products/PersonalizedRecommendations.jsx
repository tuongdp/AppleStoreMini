import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { usePersonalizedRecommendMutation } from "@/store/api/aiApi";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { Skeleton } from "@/components/ui/skeleton";

export default function PersonalizedRecommendations({ context = "homepage" }) {
    const [fetch, { data, isLoading, isError }] = usePersonalizedRecommendMutation();
    const scrollRef = useRef(null);
    const fetched = useRef(false);

    useEffect(() => {
        if (!fetched.current) {
            fetched.current = true;
            fetch();
        }
    }, [fetch]);

    const products = data?.products || [];
    const show = !isLoading && !isError && products.length > 0;

    if (isLoading) {
        return (
            <section className="section-padding py-8 md:py-10 lg:py-14">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="flex gap-4 overflow-x-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-64 w-44 shrink-0 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!show) return null;

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
    };

    return (
        <section className={`section-padding py-8 md:py-10 lg:py-14 ${context === "homepage" ? "" : "border-t border-border"}`}>
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-apple-blue" />
                        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                            Có thể bạn thích...
                        </h2>
                    </div>
                    <div className="hidden gap-1 sm:flex">
                        <button
                            onClick={() => scroll(-1)}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Cuộn trái"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => scroll(1)}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Cuộn phải"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product) => (
                        <Link
                            key={product.slug}
                            to={ROUTES.PRODUCT_DETAIL(product.slug)}
                            className="group flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                        >
                            <div className="aspect-square overflow-hidden bg-muted/50">
                                {product.image ? (
                                    <ResponsiveImage
                                        src={product.image}
                                        alt={product.name}
                                        width={176}
                                        height={176}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground/20">
                                        {product.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-1 p-3">
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
