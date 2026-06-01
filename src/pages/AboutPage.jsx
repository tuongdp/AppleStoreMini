import Breadcrumb from "@/components/shared/Breadcrumb";
import SeoHead from "@/components/shared/SeoHead";
import { formatPhone } from "@/lib/utils";
import {
  Store,
  Target,
  Heart,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  Headphones,
  BadgeCheck,
  Users,
} from "lucide-react";

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    label: "Sản phẩm chính hãng 100%",
    desc: "Có hóa đơn VAT đầy đủ, bảo hành theo tiêu chuẩn Apple chính thức",
  },
  {
    icon: BadgeCheck,
    label: "Bảo hành chính hãng",
    desc: "Bảo hành theo tiêu chuẩn Apple chính thức tại các trung tâm ủy quyền",
  },
  {
    icon: Users,
    label: "Đội ngũ chuyên nghiệp",
    desc: "Tư vấn viên am hiểu sản phẩm, sẵn sàng hỗ trợ bạn lựa chọn phù hợp nhất",
  },
  {
    icon: Truck,
    label: "Giao hàng toàn quốc",
    desc: "Vận chuyển nhanh chóng, an toàn đến tận tay bạn trên toàn quốc",
  },
  {
    icon: Headphones,
    label: "Hỗ trợ tận tâm",
    desc: "Đội ngũ hỗ trợ khách hàng 7 ngày trong tuần, sẵn sàng giải đáp mọi thắc mắc",
  },
];

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "41/1 Nguyễn Tất Thành, Quốc lộ 1, Phường Tuy Hòa, TP. Đắk Lắk",
  },
  { icon: Mail, label: "Email", value: "phuctuong123456@gmail.com" },
  {
    icon: Phone,
    label: "Hotline",
    rawPhone: "0562456055",
    suffix: " (miễn phí)",
  },
  { icon: Clock, label: "Giờ làm việc", value: "8:00 – 21:00 hàng ngày" },
];

export default function AboutPage() {
  return (
    <div className="section-padding py-12">
      <div className="mx-auto max-w-7xl">
        <SeoHead
          title="Giới thiệu"
          description="Apple Store - Cửa hàng Apple chính hãng, cung cấp iPhone, iPad, MacBook, Apple Watch, AirPods chính hãng với giá tốt nhất."
          url="/about"
        />

        <Breadcrumb items={[{ label: "Về chúng tôi" }]} className="mb-6" />

        <h1 className="mb-2 text-3xl font-semibold text-foreground">
          Về chúng tôi
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Apple Store Vietnam — đối tác ủy quyền chính thức của Apple tại Việt
          Nam
        </p>

        <div className="space-y-10">
          {/* Who we are */}
          <section className="flex flex-col gap-4 sm:flex-row">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Chúng tôi là ai
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Apple Store Vietnam là cửa hàng ủy quyền chính thức của Apple
                tại Việt Nam, cung cấp toàn bộ các dòng sản phẩm Apple bao gồm
                iPhone, iPad, Mac, Apple Watch, AirPods và các phụ kiện chính
                hãng. Với nhiều năm kinh nghiệm trong lĩnh vực phân phối sản
                phẩm Apple, chúng tôi tự hào là địa chỉ tin cậy của hàng triệu
                khách hàng trên toàn quốc.
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="flex flex-col gap-4 sm:flex-row">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
              <Target className="h-7 w-7" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Sứ mệnh
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho
                người dùng Apple tại Việt Nam — từ tư vấn sản phẩm, giao hàng
                nhanh chóng đến dịch vụ hậu mãi tận tâm. Mỗi khách hàng đến với
                Apple Store đều được phục vụ chu đáo và nhận được giá trị tốt
                nhất cho khoản đầu tư của mình.
              </p>
            </div>
          </section>

          {/* Core values */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <Heart className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Giá trị cốt lõi
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CORE_VALUES.map((v) => (
                <div
                  key={v.label}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <v.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {v.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Liên hệ
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CONTACT_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-sm"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {item.label}:{" "}
                    <span className="text-foreground">
                      {item.rawPhone
                        ? `${formatPhone(item.rawPhone)}${item.suffix || ""}`
                        : item.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
