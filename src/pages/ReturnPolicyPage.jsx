import Breadcrumb from "@/components/shared/Breadcrumb";
import { RotateCcw } from "lucide-react";

export default function ReturnPolicyPage() {
    const RETURN_ITEMS = [
        {
            title: "Điều kiện đổi trả",
            content: [
                "Sản phẩm còn trong thời hạn 7 ngày kể từ ngày mua",
                "Sản phẩm còn nguyên vẹn, chưa qua sử dụng hoặc lỗi do nhà sản xuất",
                "Có đầy đủ hóa đơn, phụ kiện và bao bì gốc",
                "Tem bảo hành còn nguyên, không bị rách hoặc tẩy xóa",
            ],
        },
        {
            title: "Trường hợp được đổi trả",
            content: [
                "Sản phẩm bị lỗi kỹ thuật do nhà sản xuất ngay khi nhận hàng",
                "Sản phẩm không đúng model, màu sắc hoặc cấu hình đã đặt",
                "Sản phẩm bị hư hỏng trong quá trình vận chuyển",
            ],
        },
        {
            title: "Trường hợp không được đổi trả",
            content: [
                "Đã qua 7 ngày kể từ ngày mua",
                "Sản phẩm bị hư hỏng do lỗi người dùng",
                "Sản phẩm đã được kích hoạt và sử dụng bình thường",
                "Không còn đầy đủ phụ kiện, hộp và hóa đơn",
            ],
        },
        {
            title: "Quy trình đổi trả",
            content: [
                "Bước 1: Liên hệ hotline 1800 1234 hoặc email support@applestore.vn trong vòng 7 ngày",
                "Bước 2: Cung cấp thông tin đơn hàng và mô tả lỗi sản phẩm",
                "Bước 3: Gửi sản phẩm về cửa hàng theo hướng dẫn",
                "Bước 4: Nhận sản phẩm mới hoặc hoàn tiền trong vòng 3–5 ngày làm việc",
            ],
        },
        {
            title: "Chính sách hoàn tiền",
            content: [
                "Hoàn tiền 100% nếu lỗi do nhà sản xuất hoặc giao sai hàng",
                "Thời gian hoàn tiền: 3–5 ngày làm việc với thanh toán online",
                "Tiền mặt hoàn ngay tại cửa hàng trong ngày làm việc",
            ],
        },
    ];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb
                items={[{ label: "Chính sách đổi trả" }]}
                className="mb-6"
            />

            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">
                    <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    {"Chính sách đổi trả"}
                </h1>
            </div>

            <div className="space-y-6">
                {RETURN_ITEMS.map((item) => (
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
                    {"Cập nhật lần cuối: 01/01/2024. Mọi thắc mắc vui lòng liên hệ hotline 1800 1234 hoặc email support@applestore.vn."}
                </p>
            </div>
        </div>
    );
}
