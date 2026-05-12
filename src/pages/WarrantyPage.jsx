import Breadcrumb from "@/components/shared/Breadcrumb";
import { ShieldCheck } from "lucide-react";
import { formatPhone } from "@/lib/utils";

const WARRANTY_ITEMS = [
    {
        title: "Thời gian bảo hành",
        content: [
            "iPhone, iPad, Mac, Apple Watch: 12 tháng tại các trung tâm bảo hành Apple ủy quyền",
            "AirPods và phụ kiện Apple: 12 tháng",
            "Phụ kiện bên thứ ba: theo chính sách của nhà sản xuất",
        ],
    },
    {
        title: "Điều kiện được bảo hành",
        content: [
            "Sản phẩm còn trong thời hạn bảo hành",
            "Sản phẩm bị lỗi do nhà sản xuất, không phải do tác động bên ngoài",
            "Có hóa đơn mua hàng hợp lệ từ Apple Store Vietnam",
            "Tem bảo hành còn nguyên vẹn, không có dấu hiệu tháo mở",
        ],
    },
    {
        title: "Không được bảo hành",
        content: [
            "Hư hỏng do va đập, rơi vỡ, vào nước",
            "Hư hỏng do tự ý sửa chữa hoặc can thiệp phần cứng",
            "Hư hỏng do sử dụng sai cách, không đúng hướng dẫn",
            "Hao mòn tự nhiên theo thời gian sử dụng",
            "Màn hình bị trầy xước, vỏ máy bị móp méo",
        ],
    },
    {
        title: "Quy trình bảo hành",
        content: [
            "Bước 1: Liên hệ hotline 1800 1234 hoặc đến trực tiếp cửa hàng",
            "Bước 2: Nhân viên kiểm tra và xác nhận lỗi sản phẩm",
            "Bước 3: Gửi máy đến trung tâm bảo hành Apple ủy quyền",
            "Bước 4: Nhận máy sau khi sửa chữa (thông thường 3–7 ngày làm việc)",
        ],
    },
];

export default function WarrantyPage() {
    return (
        <div className="section-padding py-12">
            <div className="mx-auto max-w-3xl">
                <Breadcrumb items={[{ label: "Chính sách bảo hành" }]} className="mb-6" />

                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        Chính sách bảo hành
                    </h1>
                </div>

                <div className="space-y-6">
                    {WARRANTY_ITEMS.map((item) => (
                        <section
                            key={item.title}
                            className="rounded-2xl border border-border bg-card p-5 md:p-6"
                        >
                            <h2 className="mb-3 text-base font-semibold text-foreground">
                                {item.title}
                            </h2>
                            <ul className="space-y-2.5">
                                {item.content.map((line, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                                    >
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}

                    <p className="text-xs text-muted-foreground">
                        Cập nhật lần cuối: 01/01/2024. Chính sách có thể thay đổi mà không cần thông báo trước. Vui lòng liên hệ hotline {formatPhone("18001234")} để biết thêm chi tiết.
                    </p>
                </div>
            </div>
        </div>
    );
}
