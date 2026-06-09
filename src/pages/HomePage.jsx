import { lazy, Suspense, memo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import PersonalizedRecommendations from "@/features/products/PersonalizedRecommendations";

import { selectIsAuthenticated } from "@/store/authSlice";
import { useGetHomepageQuery } from "@/store/api/homepageApi";

import { Button } from "@/components/ui/button";
import BannerSlider from "@/components/shared/BannerSlider";
import ProductSlider from "@/components/shared/ProductSlider";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import SectionTitle from "@/components/shared/SectionTitle";
import { ROUTES } from "@/lib/constants";
import SeoHead from "@/components/shared/SeoHead";
import StructuredData from "@/components/shared/StructuredData";

const WelcomeModal = lazy(() => import("@/components/shared/WelcomeModal"));
const WELCOME_STORAGE_KEY = "app-welcome-dismissed";

function isWelcomeDismissed() {
  try {
    return localStorage.getItem(WELCOME_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function CategoryProductSlider({ slug, label, products = [], isLoading }) {
  return (
    <section className="section-padding py-8 md:py-10 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          title={label}
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

const MemoizedCategoryProductSlider = memo(CategoryProductSlider);

const CATEGORY_SLIDERS = [
  { slug: "iphone", label: "iPhone", subtitle: "iPhone" },
  { slug: "mac", label: "Mac", subtitle: "Mac" },
  { slug: "ipad", label: "iPad", subtitle: "iPad" },
  { slug: "apple-watch", label: "Apple Watch", subtitle: "Watch" },
  { slug: "tai-nghe-loa", label: "Tai nghe & Loa", subtitle: "Audio" },
  { slug: "phu-kien", label: "Phụ kiện", subtitle: "Phụ kiện" },
];

const CATEGORY_SECTION_SLUGS = CATEGORY_SLIDERS.map((category) => category.slug);

const TRUST_BADGES = [
  { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng từ 500.000₫" },
  {
    icon: ShieldCheck,
    title: "Bảo hành chính hãng",
    desc: "1 - 2 năm theo sản phẩm",
  },
  { icon: RefreshCw, title: "Đổi trả dễ dàng", desc: "Trong vòng 14 ngày" },
  {
    icon: CreditCard,
    title: "Thanh toán an toàn",
    desc: "VNPay, Thanh toán khi nhận hàng",
  },
];

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(() => !isWelcomeDismissed());
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { data: homepageData, isLoading: isHomepageLoading } = useGetHomepageQuery({
    sections: CATEGORY_SECTION_SLUGS,
    limit: 10,
  });

  const banners =
    [...(homepageData?.banners || [])]
      ?.filter((item) => item.isActive)
      ?.sort((a, b) => a.order - b.order)
      ?.map((item) => ({
        id: item.id,
        image: item.image,
        ctaLink: item.ctaLink,
      }));
  const categories = homepageData?.categories || [];
  const newReleaseProducts = homepageData?.newReleaseProducts || [];
  const restockedProducts = homepageData?.restockedProducts || [];
  const categorySectionBySlug = new Map(
    (homepageData?.categorySections || []).map((section) => [section.slug, section]),
  );

  return (
    <div className="flex flex-col">
      <h1 className="sr-only">Apple Store - Cửa hàng Apple chính hãng</h1>
      <SeoHead title="Trang chủ" />
      <StructuredData />
      {showWelcome && (
        <Suspense fallback={null}>
          <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />
        </Suspense>
      )}

      <BannerSlider slides={banners} isLoading={isHomepageLoading} />

      <section className="section-padding py-8 md:py-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            title="Sản phẩm mới ra mắt"
            viewAllHref={`${ROUTES.PRODUCTS}?arrivalType=NEW_RELEASE`}
            className="mb-8"
          />
          <ProductSlider
            products={newReleaseProducts}
            isLoading={isHomepageLoading}
            sliderId="new-releases"
          />
        </div>
      </section>

      <section className="section-padding bg-muted/20 py-8 md:py-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            title="Sản phẩm mới nhập về"
            viewAllHref={`${ROUTES.PRODUCTS}?arrivalType=RESTOCK`}
            className="mb-8"
          />
          <ProductSlider
            products={restockedProducts}
            isLoading={isHomepageLoading}
            sliderId="restocked"
          />
        </div>
      </section>

      <section className="section-padding border-b border-border bg-muted/20 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:p-5"
              >
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted md:h-20 md:w-20">
                  {cat.image ? (
                    <ResponsiveImage
                      src={cat.image}
                      alt={cat.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground/30">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="truncate text-xs font-medium text-foreground md:text-sm">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {CATEGORY_SLIDERS.map((cat) => (
        <MemoizedCategoryProductSlider
          key={cat.slug}
          slug={cat.slug}
          label={categorySectionBySlug.get(cat.slug)?.label || cat.label}
          products={categorySectionBySlug.get(cat.slug)?.products || []}
          isLoading={isHomepageLoading}
        />
        ))}

      <section className="section-padding py-8 md:py-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <PersonalizedRecommendations enabled={isAuthenticated} />
        </div>
      </section>

      <section className="section-padding border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {TRUST_BADGES.map(({ icon, title, desc }) => {
              const Icon = icon;
              return (
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
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding py-20 text-center">
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Ưu đãi độc quyền
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
            Đừng bỏ lỡ deal hot
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            Khám phá hàng nghìn sản phẩm Apple chính hãng với giá tốt nhất, giao
            hàng nhanh, bảo hành uy tín.
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
