import Breadcrumb from "@/components/shared/Breadcrumb";
import { ShieldCheck } from "lucide-react";

export default function WarrantyPage() {
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

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb
                items={[{ label: "Chính sách bảo hành" }]}
                className="mb-6"
            />

            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    {"Chính sách bảo hành"}
                </h1>
            </div>

            <div className="space-y-6">
                {WARRANTY_ITEMS.map((item) => (
                    <section
                        key={item.title}
                        className="rounded-2xl border border-border bg-card p-5"
                    >
                        <h2 className="mb-3 text-base font-medium text-foreground">
                            {item.title}
                        </h2>
                        <ul className="space-y-2">
                            {item.content.map((line, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                <p className="text-xs text-muted-foreground">
                    {"Cập nhật lần cuối: 01/01/2024. Chính sách có thể thay đổi mà không cần thông báo trước. Vui lòng liên hệ hotline để biết thêm chi tiết."}
                </p>
            </div>
        </div>
    );
}
