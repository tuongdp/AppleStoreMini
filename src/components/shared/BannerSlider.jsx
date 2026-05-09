import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function BannerSkeleton() {
    return (
        <section className="w-full overflow-hidden">
            <div className="h-[580px] w-full animate-pulse bg-muted" />
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
                className="w-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative h-[580px] w-full overflow-hidden bg-muted">
                            <img
                                src={slide.image}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
