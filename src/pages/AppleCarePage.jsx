import Breadcrumb from "@/components/shared/Breadcrumb";
import SeoHead from "@/components/shared/SeoHead";
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
import { care } from "@/assets/images/care";
import ResponsiveImage from "@/components/shared/ResponsiveImage";

export default function AppleCarePage() {
  const PROCESS_STEPS = [
    {
      icon: Search,
      title: "Kiểm tra tổng quan trước sửa chữa",
      tag: "1. Kiểm tra tổng quan trước sửa chữa",
    },
    {
      icon: Clipboard,
      title: "Đặt linh kiện chính hãng Apple",
      tag: "2. Đặt linh kiện",
    },
    {
      icon: Wrench,
      title: "Tiến hành sửa chữa và thay thế",
      tag: "3. Sửa chữa | Thay thế",
    },
    {
      icon: CheckCircle,
      title: "Kiểm tra tổng quan sau sửa chữa",
      tag: "4. Kiểm tra tổng quan sau sửa chữa",
    },
    {
      icon: Hand,
      title: "Trả sản phẩm lại cho khách hàng",
      tag: "5. Trả sản phẩm",
    },
  ];

  const ACCESSORIES_LIST = [
    {
      image: care.accessories.careAccessorie_1,
      name: "Tai nghe chính hãng Apple",
      tag: "Tai nghe",
    },
    {
      image: care.accessories.careAccessorie_2,
      name: "Cáp, sạc chính hãng Apple",
      tag: "Cáp | Sạc",
    },
    {
      image: care.accessories.careAccessorie_3,
      name: "Ốp lưng, bao da chính hãng Apple",
      tag: "Ốp lưng | Bao da",
    },
    {
      image: care.accessories.careAccessorie_4,
      name: "Dây Apple Watch chính hãng",
      tag: "Dây Apple Watch",
    },
    {
      image: care.accessories.careAccessorie_5,
      name: "AirTag chính hãng Apple",
      tag: "AirTag",
    },
    {
      image: care.accessories.careAccessorie_6,
      name: "Chuột, trackpad chính hãng Apple",
      tag: "Chuột | Trackpad",
    },
    {
      image: care.accessories.careAccessorie_7,
      name: "Apple TV chính hãng Apple",
      tag: "Apple TV",
    },
    {
      image: care.accessories.careAccessorie_8,
      name: "Bàn phím chính hãng Apple",
      tag: "Bàn phím",
    },
  ];

  const REASONS_LIST = [
    {
      icon: ShieldCheck,
      title: "Chính hãng Apple",
      desc: "AppleCare là trung tâm dịch vụ ủy quyền chính thức của Apple. Tất cả linh kiện sửa chữa tại AppleCare đều do Apple cung cấp chính hãng.",
    },
    {
      icon: Award,
      title: "Chứng chỉ Apple",
      desc: "100% đội ngũ chuyên viên và kỹ thuật viên của AppleCare được đào tạo và cấp chứng chỉ bởi Apple.",
    },
    {
      icon: Lock,
      title: "Bảo mật tuyệt đối",
      desc: "Thông tin khách hàng cung cấp được bảo vệ nghiêm ngặt theo tiêu chuẩn kiểm soát cao nhất.",
    },
    {
      icon: Sparkles,
      title: "Dịch vụ đẳng cấp",
      desc: "Với phương châm lấy khách hàng làm trọng tâm, AppleCare cam kết mang đến chất lượng phục vụ vượt trội dành cho khách hàng.",
    },
    {
      icon: PiggyBank,
      title: "Tiết kiệm",
      desc: "AppleCare thường xuyên có những chương trình ưu đãi giúp khách hàng tiết kiệm hơn khi sửa chữa sản phẩm.",
    },
  ];

  const SERVICES_LIST = [
    {
      name: "Sửa chữa iPhone",
      desc: "Gửi đi xưởng sửa chữa Apple Màn hình iPhone và Kính lưng iPhone Pin iPhone",
      image: care.fix.careFix_1,
    },
    { name: "Sửa chữa iPad", desc: "Đổi máy iPad", image: care.fix.careFix_2 },
    {
      name: "Sửa chữa Macbook",
      desc: "Logic Board MacBook Pin MacBook Màn hình MacBook",
      image: care.fix.careFix_3,
    },
    {
      name: "Sửa chữa Watch",
      desc: "Đổi máy Watch",
      image: care.fix.careFix_4,
    },
    {
      name: "Sửa chữa AirPods",
      desc: "Đổi máy AirPods",
      image: care.fix.careFix_5,
    },
  ];
  return (
    <div className="section-padding py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <SeoHead
          title="AppleCare & Dịch vụ sửa chữa"
          description="Dịch vụ AppleCare, sửa chữa iPhone, iPad, MacBook, Apple Watch chính hãng. Bảo hành mở rộng, thay pin, thay màn hình."
          url="/applecare"
        />

        <Breadcrumb
          items={[{ label: "Dịch vụ sửa chữa AppleCare" }]}
          className="mb-6"
        />

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            {"Dịch vụ sửa chữa AppleCare"}
          </h1>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES_LIST.map((service) => (
            <div
              key={service.name}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div
                className="mx-auto flex items-center justify-center"
                style={{ width: 200, height: 200 }}
              >
                <ResponsiveImage
                  src={service.image}
                  alt={service.name}
                  width={200}
                  height={200}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  style={{ width: 200, height: 200 }}
                />
              </div>
              <div className="p-4">
                <h2 className="mb-1.5 text-sm font-medium text-foreground">
                  {service.name}
                </h2>
                <p className="mb-3 text-xs text-muted-foreground">
                  {service.desc}
                </p>
                <a
                  href="#"
                  className="text-xs font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                >
                  {"Xem bảng giá tham khảo →"}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {"Lý do lựa chọn AppleCare"}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS_LIST.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="mb-1.5 text-sm font-medium text-foreground">
                  {reason.title}
                </h3>
                <p className="text-xs text-muted-foreground">{reason.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
            <Package className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {"Phụ kiện chính hãng Apple tại AppleCare"}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {ACCESSORIES_LIST.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div
                className="mb-3 mx-auto flex items-center justify-center overflow-hidden rounded-xl"
                style={{ width: 150, height: 150 }}
              >
                <ResponsiveImage
                  src={item.image}
                  alt={item.name}
                  width={150}
                  height={150}
                  className="object-contain"
                  loading="lazy"
                  style={{ width: 150, height: 150 }}
                />
              </div>
              <h3 className="mb-1 truncate text-sm font-medium text-foreground">
                {item.name}
              </h3>
              <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {item.tag}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          {
            "Lưu ý: Các sản phẩm được trưng bày tại AppleCare. Quý khách vui lòng đến và mua trực tiếp với nhiều khuyến mãi hấp dẫn."
          }
        </p>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {"Quy trình bảo hành AppleCare"}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {PROCESS_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-1 text-sm font-medium text-foreground">
                  {step.title}
                </h3>
                <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {step.tag}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {"Điều khoản bảo hành sửa chữa Apple toàn cầu:"}{" "}
          <a
            href="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            {"Pháp lý"}
          </a>
          {" | "}
          <a
            href="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            {"Sửa chữa"}
          </a>
        </p>

        <div className="mb-8 mt-16 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            {"Trung tâm bảo hành AppleCare - Đẳng cấp khác biệt"}
          </h2>
        </div>

        <p className="mb-8 text-sm text-muted-foreground">
          {
            "Tại Trung tâm bảo hành AppleCare, khách hàng yêu mến hệ sinh thái Apple sẽ trải nghiệm đầy đủ và đa dạng nhất các dịch vụ bảo hành chính hãng Apple từ iPhone, iPad đến những chiếc tai nghe AirPods... trong một không gian đẳng cấp và hiện đại."
          }
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
            {care.center.map((img, i) => (
              <SwiperSlide key={i} style={{ width: 486 }}>
                <div
                  className="overflow-hidden rounded-xl bg-muted"
                  style={{ height: 324 }}
                >
                  <ResponsiveImage
                    src={img}
                    alt={`AppleCare ${i + 1}`}
                    width={486}
                    height={324}
                    className="h-full w-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
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
