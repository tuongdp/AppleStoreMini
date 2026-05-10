import { useState } from "react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
    const CONTACT_INFO = [
        {
            icon: MapPin,
            label: "Địa chỉ",
            value: "41/1 Khu phố 7, Phường 2, Đắk Lắk",
        },
        {
            icon: Phone,
            label: "Hotline",
            value: "0562456055 (miễn phí)",
        },
        {
            icon: Mail,
            label: "Email",
            value: "phuctuong123456@gmail.com",
        },
        {
            icon: Clock,
            label: "Giờ làm việc",
            value: "8:00 – 21:00, tất cả các ngày",
        },
    ];

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        toast.success("Gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");

        setForm({
            name: "",
            email: "",
            phone: "",
            message: "",
        });
    };

    return (
        <div className="section-padding py-12">
            <div className="mx-auto max-w-5xl">
                <Breadcrumb items={[{ label: "Liên hệ" }]} className="mb-6" />

                <h1 className="mb-8 text-3xl font-semibold text-foreground">
                    {"Liên hệ với chúng tôi"}
                </h1>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Contact info */}
                    <div className="space-y-6">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {"Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ qua các kênh bên dưới hoặc để lại tin nhắn, chúng tôi sẽ phản hồi trong vòng 24 giờ."}
                        </p>

                        <div className="space-y-4">
                            {CONTACT_INFO.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                        <item.icon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 rounded-2xl border border-border bg-card p-6"
                    >
                        <h2 className="text-base font-medium text-foreground">
                            {"Gửi tin nhắn"}
                        </h2>

                        <div className="space-y-1.5">
                            <Label htmlFor="name">{"Họ và tên"}</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={"Nguyễn Văn A"}
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">{"Email"}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={"email@example.com"}
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">{"Số điện thoại"}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder={"0901234567"}
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="message">{"Nội dung"}</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder={"Nhập nội dung bạn muốn liên hệ..."}
                                rows={4}
                                value={form.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full rounded-full">
                            {"Gửi tin nhắn"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
