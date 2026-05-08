import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    Truck,
    ShieldCheck,
    RefreshCw,
    CreditCard,
} from "lucide-react";

import { useGetProductsByCategoryQuery } from "@/store/api/productsApi";
import { useGetActiveFlashSaleQuery } from "@/store/api/flashSalesApi";
import { useGetBannersQuery } from "@/store/api/bannersApi";

import { Button } from "@/components/ui/button";
import BannerSlider from "@/components/shared/BannerSlider";
import FlashSaleBanner from "@/components/shared/FlashSaleBanner";
import ProductSlider from "@/components/shared/ProductSlider";
import SectionTitle from "@/components/shared/SectionTitle";

import { ROUTES, CATEGORIES } from "@/lib/constants";

const CATEGORY_SLIDERS = [
    { slug: "iphone", label: "iPhone", subtitle: "iPhone" },
    { slug: "mac", label: "Mac", subtitle: "Mac" },
    { slug: "ipad", label: "iPad", subtitle: "iPad" },
    { slug: "apple-watch", label: "Apple Watch", subtitle: "Watch" },
    { slug: "airpods", label: "Tai nghe & Loa", subtitle: "Audio" },
    { slug: "phu-kien", label: "Phụ kiện", subtitle: "Phụ kiện" },
];

const TRUST_BADGES = (t) => [
    { icon: Truck, title: t("trust.freeShipping"), desc: t("trust.freeShippingDesc") },
    { icon: ShieldCheck, title: t("trust.warranty"), desc: t("trust.warrantyDesc") },
    { icon: RefreshCw, title: t("trust.returns"), desc: t("trust.returnsDesc") },
    { icon: CreditCard, title: t("trust.payment"), desc: t("trust.paymentDesc") },
];

function CategoryProductSlider({ slug, label, subtitle }) {
    const { data, isLoading } = useGetProductsByCategoryQuery({ category: slug, limit: 10 });
    const products = data ?? [];

    return (
        <section className="section-padding section-y">
            <div className="mx-auto max-w-7xl">
                <SectionTitle
                    title={label}
                    subtitle={subtitle}
                    viewAllHref={`${ROUTES.PRODUCTS}?category=${slug}`}
                    className="mb-8"
                />
                <ProductSlider
                    products={products}
                    isLoading={isLoading}
                    sliderId={`cat-${slug}`}
                />
            </div>
        </section>
    );
}

export default function HomePage() {
    const { t: tc } = useTranslation();

    const { data: flashSale, isLoading: isFlashLoading } = useGetActiveFlashSaleQuery();
    const { data: bannerData, isLoading: isBannerLoading } = useGetBannersQuery();

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
                cta: item.ctaText,
                ctaLink: item.ctaLink,
            })) || [];

    return (
        <div className="flex flex-col">
            <BannerSlider slides={banners} isLoading={isBannerLoading} />

            <FlashSaleBanner flashSale={flashSale} isLoading={isFlashLoading} />

            <section className="section-padding border-b border-border bg-muted/20 py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:gap-4">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.value}
                                to={cat.href}
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-sm md:p-5"
                            >
                                <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted md:h-20 md:w-20">
                                    <img
                                        src={cat.image}
                                        alt={cat.label}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="text-xs font-medium text-foreground md:text-sm">
                                    {cat.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {CATEGORY_SLIDERS.map((cat) => (
                <CategoryProductSlider
                    key={cat.slug}
                    slug={cat.slug}
                    label={cat.label}
                    subtitle={cat.subtitle}
                />
            ))}

            <section className="section-padding border-t border-border bg-muted/20 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {TRUST_BADGES(tc).map(({ icon, title, desc }) => {
                            const Icon = icon;
                            return (
                                <div key={title} className="flex flex-col items-center gap-3 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                        <Icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{title}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="section-padding py-20 text-center">
                <div className="mx-auto max-w-lg">
                    <p className="mb-2 text-sm font-medium text-apple-blue">{tc("home.ctaBadge")}</p>
                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">{tc("home.ctaTitle")}</h2>
                    <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{tc("home.ctaDesc")}</p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Button asChild size="lg" className="rounded-full px-8">
                            <Link to={ROUTES.PRODUCTS}>
                                {tc("home.ctaExplore")}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                            <Link to="/contact">{tc("home.ctaContact")}</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
