import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import ResponsiveImage from "@/components/shared/ResponsiveImage";

function BannerSkeleton() {
  return (
    <section className="w-full overflow-hidden">
      <div className="aspect-[1440/375] w-full animate-pulse bg-muted" />
    </section>
  );
}

export default function BannerSlider({ slides = [] }) {
  if (!slides.length) return <BannerSkeleton />;

  return (
    <section className="w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="aspect-[1440/375] w-full"
      >
        {slides.map((slide, i) => {
          const Wrapper = slide.ctaLink ? Link : "div";
          return (
            <SwiperSlide key={slide.id}>
              <Wrapper
                to={slide.ctaLink || "#"}
                aria-label={slide.ctaLink ? `Banner ${i + 1}` : undefined}
                className="relative block h-full w-full overflow-hidden bg-muted"
              >
                <ResponsiveImage
                  src={slide.image}
                  alt={slide.ctaLink ? `Banner ${i + 1}` : ""}
                  width={1440}
                  height={375}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </Wrapper>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
