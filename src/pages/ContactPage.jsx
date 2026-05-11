import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { contactSchema } from "@/lib/validations";

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

export default function ContactPage() {
    const form = useForm({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", phone: "", message: "" },
    });

    const onSubmit = (values) => {
        toast.success("Gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");
        form.reset();
    };

    return (
        <div className="section-padding py-12">
            <div className="mx-auto max-w-5xl">
                <Breadcrumb items={[{ label: "Liên hệ" }]} className="mb-6" />

                <h1 className="mb-8 text-3xl font-semibold text-foreground">
                    {"Liên hệ với chúng tôi"}
                </h1>

                <div className="grid gap-8 md:grid-cols-2">
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

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 rounded-2xl border border-border bg-card p-6"
                        >
                            <h2 className="text-base font-medium text-foreground">
                                {"Gửi tin nhắn"}
                            </h2>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{"Họ và tên"}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={"Nguyễn Văn A"} {...field} />
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
                                        <FormLabel>{"Email"}</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder={"email@example.com"} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{"Số điện thoại (tuỳ chọn)"}</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder={"0901234567"} {...field} />
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
                                        <FormLabel>{"Nội dung"}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={"Nhập nội dung bạn muốn liên hệ..."}
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full rounded-full">
                                {"Gửi tin nhắn"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
