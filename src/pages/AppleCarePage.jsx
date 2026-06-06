import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle,
  Clipboard,
  ClipboardList,
  Hand,
  Lock,
  Package,
  PiggyBank,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import SeoHead from "@/components/shared/SeoHead";
import { Button } from "@/components/ui/button";
import { care } from "@/assets/images/care";

const PROCESS_STEPS = [
  {
    icon: Search,
    title: "Kiểm tra tổng quan",
    desc: "Tiếp nhận máy, kiểm tra tình trạng ngoại quan và lỗi khách hàng ghi nhận.",
  },
  {
    icon: Clipboard,
    title: "Xác nhận phương án",
    desc: "Tư vấn hạng mục sửa chữa, linh kiện và thời gian xử lý trước khi thực hiện.",
  },
  {
    icon: Wrench,
    title: "Sửa chữa, thay thế",
    desc: "Kỹ thuật viên xử lý theo quy trình và tiêu chuẩn dịch vụ Apple.",
  },
  {
    icon: CheckCircle,
    title: "Kiểm tra sau sửa",
    desc: "Kiểm tra lại chức năng, độ ổn định và tình trạng linh kiện sau khi hoàn tất.",
  },
  {
    icon: Hand,
    title: "Bàn giao sản phẩm",
    desc: "Bàn giao thiết bị, hướng dẫn lưu ý sử dụng và chính sách bảo hành sau sửa.",
  },
];

const ACCESSORIES_LIST = [
  { image: care.accessories.careAccessorie_1, name: "Tai nghe chính hãng Apple", tag: "Tai nghe" },
  { image: care.accessories.careAccessorie_2, name: "Cáp, sạc chính hãng Apple", tag: "Cáp | Sạc" },
  { image: care.accessories.careAccessorie_3, name: "Ốp lưng, bao da chính hãng Apple", tag: "Ốp lưng | Bao da" },
  { image: care.accessories.careAccessorie_4, name: "Dây Apple Watch chính hãng", tag: "Dây Apple Watch" },
  { image: care.accessories.careAccessorie_5, name: "AirTag chính hãng Apple", tag: "AirTag" },
  { image: care.accessories.careAccessorie_6, name: "Chuột, trackpad chính hãng Apple", tag: "Chuột | Trackpad" },
  { image: care.accessories.careAccessorie_7, name: "Apple TV chính hãng Apple", tag: "Apple TV" },
  { image: care.accessories.careAccessorie_8, name: "Bàn phím chính hãng Apple", tag: "Bàn phím" },
];

const REASONS_LIST = [
  {
    icon: ShieldCheck,
    title: "Linh kiện chính hãng",
    desc: "Linh kiện sửa chữa được kiểm soát nguồn gốc, phù hợp với tiêu chuẩn dịch vụ của Apple.",
  },
  {
    icon: Award,
    title: "Kỹ thuật viên được đào tạo",
    desc: "Đội ngũ kỹ thuật viên nắm rõ quy trình tiếp nhận, chẩn đoán và xử lý thiết bị Apple.",
  },
  {
    icon: Lock,
    title: "Bảo mật dữ liệu",
    desc: "Thông tin và thiết bị của khách hàng được tiếp nhận theo quy trình bảo mật rõ ràng.",
  },
  {
    icon: Sparkles,
    title: "Trải nghiệm chỉn chu",
    desc: "Không gian dịch vụ gọn gàng, minh bạch về tình trạng máy và hạng mục sửa chữa.",
  },
  {
    icon: PiggyBank,
    title: "Chi phí minh bạch",
    desc: "Tư vấn phương án phù hợp, báo giá trước khi sửa và có chương trình ưu đãi theo thời điểm.",
  },
];

const SERVICES_LIST = [
  {
    name: "Sửa chữa iPhone",
    desc: "Thay pin, màn hình, kính lưng và kiểm tra các lỗi phần cứng phổ biến.",
    image: care.fix.careFix_1,
  },
  {
    name: "Sửa chữa iPad",
    desc: "Kiểm tra, tư vấn đổi máy hoặc sửa chữa theo tình trạng thiết bị.",
    image: care.fix.careFix_2,
  },
  {
    name: "Sửa chữa MacBook",
    desc: "Kiểm tra pin, màn hình, bàn phím, trackpad, logic board và các lỗi vận hành.",
    image: care.fix.careFix_3,
  },
  {
    name: "Sửa chữa Apple Watch",
    desc: "Tư vấn đổi máy, kiểm tra tình trạng pin, màn hình và kết nối.",
    image: care.fix.careFix_4,
  },
  {
    name: "Sửa chữa AirPods",
    desc: "Kiểm tra âm thanh, pin, hộp sạc và phương án đổi máy phù hợp.",
    image: care.fix.careFix_5,
  },
];

const HERO_STATS = [
  { label: "Nhóm thiết bị", value: "5+" },
  { label: "Bước xử lý", value: "5" },
  { label: "Phụ kiện", value: "8+" },
];

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppleCarePage() {
  return (
    <div className="section-padding py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <SeoHead
          title="AppleCare & Dịch vụ sửa chữa"
          description="Dịch vụ AppleCare, sửa chữa iPhone, iPad, MacBook, Apple Watch chính hãng. Bảo hành mở rộng, thay pin, thay màn hình."
          url="/apple-care"
        />

        <Breadcrumb
          items={[{ label: "Dịch vụ sửa chữa AppleCare" }]}
          className="mb-6"
        />

        <section className="relative mb-12 min-h-[420px] overflow-hidden rounded-lg bg-foreground text-background">
          <ResponsiveImage
            src={care.center[0]}
            alt="Không gian trung tâm AppleCare"
            width={1440}
            height={720}
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/15" />
          <div className="relative flex min-h-[420px] max-w-3xl flex-col justify-end px-5 py-8 sm:px-8 md:px-10 md:py-10">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
              Dịch vụ sửa chữa AppleCare
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Chăm sóc thiết bị Apple rõ ràng từ tiếp nhận đến bàn giao
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/82 md:text-base">
              Kiểm tra thiết bị, tư vấn phương án sửa chữa và phụ kiện chính hãng trong một trải nghiệm gọn gàng, minh bạch, dễ theo dõi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-white/90">
                <Link to="/contact">
                  Liên hệ tư vấn
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <a href="https://support.apple.com/repair" target="_blank" rel="noreferrer">
                  Chính sách sửa chữa
                </a>
              </Button>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-white/12 px-3 py-3 ring-1 ring-white/15">
                  <p className="text-xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <SectionHeading
            icon={Wrench}
            title="Dịch vụ sửa chữa"
            description="Các nhóm dịch vụ được trình bày theo thiết bị để khách hàng chọn đúng nhu cầu trước khi liên hệ."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICES_LIST.map((service) => (
              <article
                key={service.name}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/20"
              >
                <div className="flex aspect-square items-center justify-center bg-muted/30 p-5">
                  <ResponsiveImage
                    src={service.image}
                    alt={service.name}
                    width={220}
                    height={220}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold text-foreground">{service.name}</h3>
                  <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">{service.desc}</p>
                  <Button asChild variant="link" className="mt-3 h-auto justify-start p-0 text-xs text-foreground">
                    <Link to="/contact">
                      Liên hệ tư vấn giá
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <SectionHeading
            icon={ShieldCheck}
            title="Lý do lựa chọn AppleCare"
            description="Tập trung vào tính minh bạch, bảo mật và trải nghiệm sửa chữa dễ theo dõi."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {REASONS_LIST.map((reason) => {
              const Icon = reason.icon;
              return (
                <article key={reason.title} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{reason.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{reason.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <SectionHeading
            icon={Package}
            title="Phụ kiện chính hãng Apple tại AppleCare"
            description="Một số nhóm phụ kiện được trưng bày tại cửa hàng, khách hàng có thể xem trực tiếp khi đến trung tâm."
          />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ACCESSORIES_LIST.map((item) => (
              <article key={item.name} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted/30 p-4">
                  <ResponsiveImage
                    src={item.image}
                    alt={item.name}
                    width={180}
                    height={180}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-foreground">{item.name}</h3>
                <span className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {item.tag}
                </span>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Lưu ý: Phụ kiện được trưng bày tại AppleCare. Khách hàng vui lòng đến cửa hàng để xem tình trạng hàng và ưu đãi hiện có.
          </p>
        </section>

        <section className="mb-16">
          <SectionHeading
            icon={ClipboardList}
            title="Quy trình bảo hành AppleCare"
            description="Quy trình được chia thành từng bước để khách hàng biết thiết bị đang được xử lý ở giai đoạn nào."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.desc}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Điều khoản bảo hành sửa chữa Apple toàn cầu:{" "}
            <a href="https://www.apple.com/legal/" target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
              Pháp lý
            </a>
            {" | "}
            <a href="https://support.apple.com/repair" target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sửa chữa
            </a>
          </p>
        </section>

        <section>
          <SectionHeading
            icon={Building2}
            title="Không gian trung tâm AppleCare"
            description="Khách hàng có thể trải nghiệm khu vực tiếp nhận, tư vấn và trưng bày phụ kiện Apple trong cùng một điểm đến."
          />
          <div className="overflow-hidden rounded-lg">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              slidesPerView="auto"
              spaceBetween={16}
              loop
              className="w-full"
            >
              {care.center.map((img, index) => (
                <SwiperSlide key={img} className="!w-[min(486px,82vw)]">
                  <div className="aspect-[3/2] overflow-hidden rounded-lg bg-muted">
                    <ResponsiveImage
                      src={img}
                      alt={`Không gian AppleCare ${index + 1}`}
                      width={486}
                      height={324}
                      className="h-full w-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : undefined}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      </div>
    </div>
  );
}
