import Breadcrumb from "@/components/shared/Breadcrumb";
import { Lock } from "lucide-react";

const PRIVACY_ITEMS = [
    {
        title: "Thông tin chúng tôi thu thập",
        content: [
            "Thông tin cá nhân: họ tên, email, số điện thoại, địa chỉ giao hàng",
            "Thông tin thanh toán: được mã hóa và xử lý qua cổng thanh toán bảo mật",
            "Thông tin thiết bị: loại thiết bị, trình duyệt, địa chỉ IP",
            "Lịch sử mua hàng và tương tác với website",
        ],
    },
    {
        title: "Mục đích sử dụng thông tin",
        content: [
            "Xử lý đơn hàng và giao hàng đến địa chỉ của bạn",
            "Gửi thông báo cập nhật trạng thái đơn hàng",
            "Hỗ trợ khách hàng và giải quyết khiếu nại",
            "Cải thiện trải nghiệm mua sắm và tối ưu dịch vụ",
            "Gửi thông tin khuyến mãi (nếu bạn đồng ý nhận)",
        ],
    },
    {
        title: "Bảo mật thông tin",
        content: [
            "Mọi dữ liệu được mã hóa bằng SSL/TLS 256-bit",
            "Thông tin thanh toán không được lưu trữ trên hệ thống của chúng tôi",
            "Chỉ nhân viên được ủy quyền mới có thể truy cập dữ liệu khách hàng",
            "Hệ thống được kiểm tra bảo mật định kỳ",
        ],
    },
    {
        title: "Chia sẻ thông tin",
        content: [
            "Chúng tôi không bán thông tin cá nhân cho bên thứ ba",
            "Thông tin chỉ được chia sẻ với đối tác vận chuyển để giao hàng",
            "Có thể cung cấp cho cơ quan nhà nước khi có yêu cầu pháp lý",
        ],
    },
    {
        title: "Quyền của bạn",
        content: [
            "Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân",
            "Từ chối nhận email marketing bất kỳ lúc nào",
            "Yêu cầu chúng tôi ngừng xử lý dữ liệu của bạn",
            "Liên hệ: privacy@applestore.vn để thực hiện các quyền trên",
        ],
    },
];

export default function PrivacyPage() {
    return (
        <div className="section-padding py-12">
            <div className="mx-auto max-w-3xl">
                <Breadcrumb items={[{ label: "Chính sách bảo mật" }]} className="mb-6" />

                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                        <Lock className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        Chính sách bảo mật
                    </h1>
                </div>

                <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Apple Store Vietnam cam kết bảo vệ quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ của chúng tôi.
                    </p>

                    {PRIVACY_ITEMS.map((item) => (
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
                        Cập nhật lần cuối: 01/01/2024. Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ privacy@applestore.vn.
                    </p>
                </div>
            </div>
        </div>
    );
}
