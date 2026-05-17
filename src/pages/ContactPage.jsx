import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Clock, ExternalLink, Mail, MapPin, Phone, Send } from "lucide-react";
import { contactSchema } from "@/lib/validations";
import { formatPhone } from "@/lib/utils";

const STORE_ADDRESS =
  "41/1, Nguyễn Tất Thành, Quốc lộ 1, Phường Tuy Hòa, Đắk Lắk";
const STORE_COORDINATES = {
  longitude: 109.3029,
  latitude: 13.0957,
};
const STORE_MAP_QUERY = encodeURIComponent(STORE_ADDRESS);
const STORE_MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${STORE_MAP_QUERY}`;

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: STORE_ADDRESS,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    icon: Phone,
    label: "Hotline",
    rawPhone: "0562456055",
    suffix: " (miễn phí)",
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  {
    icon: Mail,
    label: "Email",
    value: "phuctuong123456@gmail.com",
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "8:00 – 21:00, tất cả các ngày",
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
  },
];

export default function ContactPage() {
  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = () => {
    toast.success("Gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");
    form.reset();
  };

  return (
      <div className="section-padding py-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Liên hệ" }]} className="mb-6" />

        <h1 className="mb-2 text-3xl font-semibold text-foreground">
          Liên hệ với chúng tôi
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại tin nhắn, chúng tôi sẽ
          phản hồi trong vòng 24 giờ.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {CONTACT_INFO.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {item.rawPhone
                      ? `${formatPhone(item.rawPhone)}${item.suffix || ""}`
                      : item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-5 text-base font-semibold text-foreground">
                Gửi tin nhắn
              </h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="0901234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập nội dung bạn muốn liên hệ..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full rounded-full" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  Gửi tin nhắn
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Bản đồ cửa hàng
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {STORE_ADDRESS}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <a
                href={STORE_MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Chỉ đường
              </a>
            </Button>
          </div>
          <div className="aspect-[16/9] min-h-[280px] bg-muted sm:aspect-[21/9]">
            <Map
              center={[STORE_COORDINATES.longitude, STORE_COORDINATES.latitude]}
              zoom={15}
            >
              <MapControls showFullscreen />
              <MapMarker
                longitude={STORE_COORDINATES.longitude}
                latitude={STORE_COORDINATES.latitude}
              >
                <MarkerContent>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shadow-lg ring-4 ring-background">
                    <MapPin className="h-5 w-5" />
                  </div>
                </MarkerContent>
                <MarkerTooltip>Apple Store Mini</MarkerTooltip>
                <MarkerPopup>
                  <div className="max-w-56 space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Apple Store Mini
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {STORE_ADDRESS}
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            </Map>
          </div>
        </section>
      </div>
    </div>
  );
}
