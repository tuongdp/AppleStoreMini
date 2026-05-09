import { useTranslation } from "react-i18next";
import Breadcrumb from "@/components/shared/Breadcrumb";
import {
  Wrench,
  ShieldCheck,
  Award,
  Lock,
  Sparkles,
  PiggyBank,
  Package,
  ClipboardList,
  Search,
  Clipboard,
  CheckCircle,
  Hand,
  Building2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import iphoneImg from "@/assets/images/categories/iphone.jpg";
import ipadImg from "@/assets/images/categories/ipad.jpg";
import macImg from "@/assets/images/categories/mac.jpg";
import watchImg from "@/assets/images/categories/watch.jpg";
import airpodsImg from "@/assets/images/categories/airpods.jpg";
import productPlaceholder from "@/assets/images/placeholder/product-placeholder.jpg";
import careImg1 from "@/assets/images/care/img_1-min.jpg";
import careImg2 from "@/assets/images/care/img_2-min.jpg";
import careImg3 from "@/assets/images/care/img_3-min.jpg";
import careImg4 from "@/assets/images/care/img_4-min.jpg";
import careImg5 from "@/assets/images/care/img_5-min.jpg";

const CARE_IMAGES = [careImg1, careImg2, careImg3, careImg4, careImg5];

export default function AppleCarePage() {
  const { t } = useTranslation("common");

  const PROCESS_STEPS = [
    { icon: Search, key: "0" },
    { icon: Clipboard, key: "1" },
    { icon: Wrench, key: "2" },
    { icon: CheckCircle, key: "3" },
    { icon: Hand, key: "4" },
  ];

  const ACCESSORIES_LIST = [
    { image: productPlaceholder, key: "earphones" },
    { image: productPlaceholder, key: "cables" },
    { image: productPlaceholder, key: "cases" },
    { image: productPlaceholder, key: "watchStraps" },
    { image: productPlaceholder, key: "airtag" },
    { image: productPlaceholder, key: "mouse" },
    { image: productPlaceholder, key: "appletv" },
    { image: productPlaceholder, key: "keyboard" },
  ];

  const REASONS_LIST = [
    { icon: ShieldCheck, key: "authentic" },
    { icon: Award, key: "certified" },
    { icon: Lock, key: "secure" },
    { icon: Sparkles, key: "premium" },
    { icon: PiggyBank, key: "saving" },
  ];

  const SERVICES_LIST = [
    { nameKey: "iphone", image: iphoneImg },
    { nameKey: "ipad", image: ipadImg },
    { nameKey: "macbook", image: macImg },
    { nameKey: "watch", image: watchImg },
    { nameKey: "airpods", image: airpodsImg },
  ];
  return (
    <div className="section-padding py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb
          items={[{ label: t("appleCare.breadcrumb") }]}
          className="mb-6"
        />

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">
            <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            {t("appleCare.title")}
          </h1>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES_LIST.map((service) => (
            <div
              key={service.nameKey}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div className="aspect-4/2.5 overflow-hidden">
                <img
                  src={service.image}
                  alt={t(`appleCare.services.${service.nameKey}.name`)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h2 className="mb-1.5 text-sm font-medium text-foreground">
                  {t(`appleCare.services.${service.nameKey}.name`)}
                </h2>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t(`appleCare.services.${service.nameKey}.desc`)}
                </p>
                <a
                  href="#"
                  className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t("appleCare.viewPricing")}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {t("appleCare.reasonsTitle")}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS_LIST.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.key}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="mb-1.5 text-sm font-medium text-foreground">
                  {t(`appleCare.reasons.${reason.key}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(`appleCare.reasons.${reason.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/30">
            <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {t("appleCare.accessoriesTitle")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {ACCESSORIES_LIST.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={item.image}
                  alt={t(`appleCare.accessories.${item.key}.name`)}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-1 text-sm font-medium text-foreground">
                {t(`appleCare.accessories.${item.key}.name`)}
              </h3>
              <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {t(`appleCare.accessories.${item.key}.tag`)}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          {t("appleCare.accessoriesNote")}
        </p>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30">
            <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {t("appleCare.processTitle")}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="rounded-2xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-1 text-sm font-medium text-foreground">
                  {t(`appleCare.process.${step.key}.title`)}
                </h3>
                <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {t(`appleCare.process.${step.key}.tag`)}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {t("appleCare.processNote")}{" "}
          <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">{t("appleCare.legal")}</a>
          {" | "}
          <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">{t("appleCare.repair")}</a>
        </p>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/30">
            <Building2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {t("appleCare.centerTitle")}
          </h2>
        </div>

        <p className="mb-8 text-sm text-muted-foreground">
          {t("appleCare.centerDesc")}
        </p>

        <div className="overflow-hidden rounded-2xl">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            slidesPerView="auto"
            spaceBetween={20}
            loop
            className="w-full"
          >
            {CARE_IMAGES.map((img, i) => (
              <SwiperSlide key={i} style={{ width: 486 }}>
                <div className="overflow-hidden rounded-xl bg-muted" style={{ height: 324 }}>
                  <img
                    src={img}
                    alt={`AppleCare ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
