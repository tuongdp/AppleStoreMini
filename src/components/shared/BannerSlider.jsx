import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { ROUTES } from "@/lib/constants";

function BannerSkeleton() {
    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[580px] w-full animate-pulse bg-gray-200">
                {/* Gradient overlay giả */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300/60 to-transparent" />

                {/* Content skeleton */}
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
                    <div className="max-w-xl space-y-4">
                        {/* Eyebrow */}
                        <div className="h-3 w-40 rounded-full bg-gray-300" />
                        {/* Title */}
                        <div className="space-y-2">
                            <div className="h-14 w-80 rounded-lg bg-gray-300" />
                            <div className="h-14 w-64 rounded-lg bg-gray-300" />
                        </div>
                        {/* Subtitle */}
                        <div className="h-5 w-72 rounded-full bg-gray-300" />
                        {/* Description */}
                        <div className="h-4 w-56 rounded-full bg-gray-300" />
                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <div className="h-11 w-36 rounded-full bg-gray-300" />
                            <div className="h-11 w-28 rounded-full bg-gray-300" />
                        </div>
                    </div>
                </div>

                {/* Pagination dots skeleton */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full bg-gray-400 transition-all ${i === 0 ? "w-6" : "w-2"}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function BannerSlider({ slides = [] }) {
    if (!slides.length) return <BannerSkeleton />;

    return (
        <section className="relative w-full overflow-hidden">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop
                className="w-full"
            >
                {slides.map((slide) => {
                    const light = slide.textColor === "light";

                    return (
                        <SwiperSlide key={slide.id}>
                            <div className="relative h-[580px] w-full overflow-hidden">
                                {/* Background */}
                                {slide.image ? (
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})`,
                                        }}
                                    />
                                )}

                                {/* Overlay (luôn có để đọc chữ rõ hơn) */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: light
                                            ? "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)"
                                            : "linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
                                    }}
                                />

                                {/* Content */}
                                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
                                    <div className="max-w-xl">
                                        <p
                                            className="mb-3 text-xs font-semibold uppercase tracking-widest"
                                            style={{
                                                color: light
                                                    ? "rgba(255,255,255,0.7)"
                                                    : "rgba(0,0,0,0.5)",
                                            }}
                                        >
                                            Apple Store Vietnam
                                        </p>

                                        <h1
                                            className="mb-4 text-5xl font-semibold md:text-6xl lg:text-7xl"
                                            style={{
                                                color: light
                                                    ? "#ffffff"
                                                    : "#1d1d1f",
                                            }}
                                        >
                                            {slide.title}
                                        </h1>

                                        <p
                                            className="mb-3 text-lg md:text-xl"
                                            style={{
                                                color: light
                                                    ? "rgba(255,255,255,0.9)"
                                                    : "rgba(0,0,0,0.7)",
                                            }}
                                        >
                                            {slide.subtitle}
                                        </p>

                                        <p
                                            className="mb-8 text-sm"
                                            style={{
                                                color: light
                                                    ? "rgba(255,255,255,0.7)"
                                                    : "rgba(0,0,0,0.5)",
                                            }}
                                        >
                                            {slide.description}
                                        </p>

                                        <div className="flex gap-3">
                                            <Link
                                                to={slide.ctaLink}
                                                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90"
                                                style={{
                                                    background: light
                                                        ? "#ffffff"
                                                        : "#1d1d1f",
                                                    color: light
                                                        ? "#1d1d1f"
                                                        : "#ffffff",
                                                }}
                                            >
                                                {slide.cta}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>

                                            <Link
                                                to={ROUTES.PRODUCTS}
                                                className="rounded-full border px-6 py-3 text-sm font-medium transition hover:opacity-80"
                                                style={{
                                                    borderColor: light
                                                        ? "rgba(255,255,255,0.4)"
                                                        : "rgba(0,0,0,0.2)",
                                                    color: light
                                                        ? "#ffffff"
                                                        : "#1d1d1f",
                                                }}
                                            >
                                                Xem tất cả
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}
