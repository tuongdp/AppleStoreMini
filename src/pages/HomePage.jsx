import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    ChevronRight,
    Truck,
    ShieldCheck,
    RefreshCw,
    CreditCard,
} from "lucide-react";

// RTK Query
import {
    useGetFeaturedProductsQuery,
    useGetNewProductsQuery,
    useGetProductsQuery,
} from "@/store/api/productsApi";

// shadcn UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Shared components
import BannerSlider from "@/components/shared/BannerSlider";
import ProductSlider from "@/components/shared/ProductSlider";
import SectionTitle from "@/components/shared/SectionTitle";
import ProductCardSkeleton from "@/components/shared/ProductCardSkeleton";
import ProductCard from "@/components/shared/ProductCard";

// Constants & utils
import { ROUTES } from "@/lib/constants";

import { useGetBannersQuery } from "@/store/api/bannersApi";
import { useCategories } from "@/hooks/useCategories";
const TRUST_BADGES = [
    {
        icon: Truck,
        title: "Miễn phí vận chuyển",
        desc: "Đơn hàng từ 500.000₫",
    },
    {
        icon: ShieldCheck,
        title: "Bảo hành chính hãng",
        desc: "1 - 2 năm theo sản phẩm",
    },
    {
        icon: RefreshCw,
        title: "Đổi trả dễ dàng",
        desc: "Trong vòng 14 ngày",
    },
    {
        icon: CreditCard,
        title: "Thanh toán an toàn",
        desc: "VNPay, Momo, ZaloPay",
    },
];

export default function HomePage() {
    const { categories, isLoading: isCategoriesLoading } = useCategories();
    const getCatImage = (slug) =>
        categories.find((c) => c.slug === slug)?.image || "";
    const { t } = useTranslation("product");

    const { data: featuredData, isLoading: isFeaturedLoading } =
        useGetFeaturedProductsQuery(12);

    const { data: newData, isLoading: isNewLoading } =
        useGetNewProductsQuery(12);

    const { data: saleData, isLoading: isSaleLoading } = useGetProductsQuery({
        onSale: true,
        limit: 12,
    });

    const { data: bannerData, isLoading: isBannerLoading } =
        useGetBannersQuery();

    const banners =
        bannerData
            ?.filter((item) => item.isActive)
            ?.sort((a, b) => a.order - b.order)
            ?.map((item) => ({
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                description: item.description,
                image: item.image,
                textColor: item.textColor,
                bgFrom: item.bgFrom,
                bgTo: item.bgTo,
                cta: item.ctaText,
                ctaLink: item.ctaLink,
            })) || [];

    const featuredProducts = featuredData ?? [];
    const newProducts = newData ?? [];
    const saleProducts = saleData?.products ?? [];

    return (
        <div className="flex flex-col">
            {/* ── 1. Hero Banner Slider ── */}
            <BannerSlider slides={banners} isLoading={isBannerLoading} />

            {/* ── 2. Category Bar ── */}
            <section className="section-padding border-b border-border bg-muted/20 py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:gap-4">
                        {isCategoriesLoading
                            ? [...Array(5)].map((_, i) => (
                                  <div
                                      key={i}
                                      className="flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-card p-4 md:p-5"
                                  >
                                      <div className="h-14 w-14 animate-pulse rounded-xl bg-muted md:h-20 md:w-20" />
                                      <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                                  </div>
                              ))
                            : categories.map((cat) => (
                                  <Link
                                      key={cat.slug}
                                      to={cat.href}
                                      className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-sm md:p-5"
                                  >
                                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted md:h-20 md:w-20">
                                          {cat.image ? (
                                              <img
                                                  src={cat.image}
                                                  alt={cat.name}
                                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                  loading="lazy"
                                              />
                                          ) : (
                                              <div className="h-full w-full bg-muted" />
                                          )}
                                      </div>
                                      <span className="text-xs font-medium text-foreground md:text-sm">
                                          {cat.name}
                                      </span>
                                  </Link>
                              ))}
                    </div>
                </div>
            </section>

            {/* ── 3. Featured Products ── */}
            <section className="section-padding section-y">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title={t("home.featured", {
                            defaultValue: "Sản phẩm nổi bật",
                        })}
                        subtitle="Nổi bật"
                        viewAllHref={ROUTES.PRODUCTS}
                        className="mb-8"
                    />
                    <ProductSlider
                        products={featuredProducts}
                        isLoading={isFeaturedLoading}
                        sliderId="featured"
                    />
                </div>
            </section>

            {/* ── 4. Promo Banner — 2 cột ── */}
            <section className="section-padding py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* iPhone */}
                        <Link
                            to={`${ROUTES.PRODUCTS}?category=iphone`}
                            className="group relative overflow-hidden rounded-3xl p-8 transition-transform duration-300 hover:scale-[1.015]"
                            style={{
                                background:
                                    "linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 100%)",
                                minHeight: "240px",
                            }}
                        >
                            <div className="relative z-10">
                                <Badge className="mb-3 border-white/20 bg-white/10 text-white/80 hover:bg-white/20">
                                    Mới nhất
                                </Badge>
                                <h3 className="mb-2 text-2xl font-semibold text-white md:text-3xl">
                                    iPhone 16 Pro
                                </h3>
                                <p className="mb-5 text-sm text-white/55">
                                    Camera 48MP. Chip A18 Pro. Titanium.
                                </p>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-white/75 transition-all group-hover:gap-2 group-hover:text-white">
                                    Mua ngay
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                            <img
                                src={getCatImage("iphone")}
                                alt=""
                                aria-hidden
                                className="absolute -bottom-4 -right-4 h-44 w-44 object-cover opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:opacity-25"
                            />
                        </Link>

                        {/* Mac */}
                        <Link
                            to={`${ROUTES.PRODUCTS}?category=mac`}
                            className="group relative overflow-hidden rounded-3xl p-8 transition-transform duration-300 hover:scale-[1.015]"
                            style={{
                                background:
                                    "linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)",
                                minHeight: "240px",
                            }}
                        >
                            <div className="relative z-10">
                                <Badge variant="secondary" className="mb-3">
                                    Chip M4
                                </Badge>
                                <h3 className="mb-2 text-2xl font-semibold text-[#1d1d1f] md:text-3xl">
                                    MacBook Pro
                                </h3>
                                <p className="mb-5 text-sm text-[#86868b]">
                                    Hiệu năng đỉnh cao. Pin 22 giờ.
                                </p>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-apple-blue transition-all group-hover:gap-2">
                                    Khám phá
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                            <img
                                src={getCatImage("mac")}
                                alt=""
                                aria-hidden
                                className="absolute -bottom-4 -right-4 h-44 w-44 object-cover opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:opacity-25"
                            />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 5. New Arrivals ── */}
            <section className="section-padding section-y bg-muted/30">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title={t("home.newest", {
                            defaultValue: "Sản phẩm mới",
                        })}
                        subtitle="Mới nhất"
                        viewAllHref={`${ROUTES.PRODUCTS}?sort=newest`}
                        className="mb-8"
                    />
                    <ProductSlider
                        products={newProducts}
                        isLoading={isNewLoading}
                        sliderId="new"
                        autoplayDelay={4500}
                    />
                </div>
            </section>

            {/* ── 6. Sale Products ── */}
            <section className="section-padding section-y">
                <div className="mx-auto max-w-7xl">
                    {/* Header thủ công vì cần màu đỏ riêng */}
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-red-500">
                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                Flash Sale
                            </p>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                {t("home.onSale", {
                                    defaultValue: "Đang giảm giá",
                                })}
                            </h2>
                        </div>
                        <Link
                            to={`${ROUTES.PRODUCTS}?onSale=true`}
                            className="group flex shrink-0 items-center gap-0.5 text-sm font-medium text-apple-blue transition-opacity hover:opacity-70"
                        >
                            Xem tất cả
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {isSaleLoading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : saleProducts.length > 0 ? (
                        // Sale dùng ProductSlider nhưng wrap thêm Badge SALE
                        // nên tự render Swiper ở đây để control từng slide
                        <ProductSlider
                            products={saleProducts}
                            isLoading={false}
                            sliderId="sale"
                            autoplayDelay={5000}
                            renderItem={(product) => (
                                <div className="relative">
                                    <div className="absolute left-3 top-3 z-20">
                                        <Badge
                                            variant="destructive"
                                            className="text-xs font-bold"
                                        >
                                            SALE
                                        </Badge>
                                    </div>
                                    <ProductCard product={product} />
                                </div>
                            )}
                        />
                    ) : (
                        <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-border">
                            <p className="text-sm text-muted-foreground">
                                Chưa có sản phẩm đang giảm giá
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── 7. Trust Badges ── */}
            <section className="section-padding border-t border-border bg-muted/20 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="flex flex-col items-center gap-3 text-center"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                    <Icon
                                        className="h-6 w-6 text-foreground"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 8. CTA Bottom ── */}
            <section className="section-padding py-20 text-center">
                <div className="mx-auto max-w-lg">
                    <p className="mb-2 text-sm font-medium text-apple-blue">
                        Ưu đãi độc quyền
                    </p>
                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
                        Đừng bỏ lỡ deal hot
                    </h2>
                    <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                        Khám phá hàng nghìn sản phẩm Apple chính hãng với giá
                        tốt nhất, giao hàng nhanh, bảo hành uy tín.
                    </p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Button asChild size="lg" className="rounded-full px-8">
                            <Link to={ROUTES.PRODUCTS}>
                                Khám phá ngay
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-full px-8"
                        >
                            <Link to="/contact">Liên hệ tư vấn</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
