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
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { contactSchema } from "@/lib/validations";
import { formatPhone } from "@/lib/utils";

const CONTACT_INFO = [
    {
        icon: MapPin,
        label: "Địa chỉ",
        value: "41/1 Khu phố 7, Phường 2, Đắk Lắk",
        color: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
        icon: Phone,
        label: "Hotline",
        rawPhone: "0562456055",
        suffix: " (miễn phí)",
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
        icon: Mail,
        label: "Email",
        value: "phuctuong123456@gmail.com",
        color: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    },
    {
        icon: Clock,
        label: "Giờ làm việc",
        value: "8:00 – 21:00, tất cả các ngày",
        color: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
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

                <h1 className="mb-2 text-3xl font-semibold text-foreground">
                    Liên hệ với chúng tôi
                </h1>
                <p className="mb-8 text-sm text-muted-foreground">
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại tin nhắn, chúng tôi sẽ phản hồi trong vòng 24 giờ.
                </p>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        {CONTACT_INFO.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
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
                                                    <Input type="email" placeholder="email@example.com" {...field} />
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
            </div>
        </div>
    );
}
