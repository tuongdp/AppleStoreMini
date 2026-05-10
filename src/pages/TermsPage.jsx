import Breadcrumb from "@/components/shared/Breadcrumb";
import { FileText } from "lucide-react";

export default function TermsPage() {
    const TERMS_ITEMS = [
        {
            title: "1. Điều khoản chung",
            content: [
                "Bằng cách truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản sử dụng được quy định dưới đây.",
                "Chúng tôi có quyền thay đổi, chỉnh sửa hoặc cập nhật các điều khoản này bất kỳ lúc nào mà không cần thông báo trước.",
                "Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.",
            ],
        },
        {
            title: "2. Tài khoản người dùng",
            content: [
                "Bạn có trách nhiệm bảo mật thông tin tài khoản của mình.",
                "Không được chia sẻ tài khoản cho người khác sử dụng.",
                "Thông báo ngay cho chúng tôi nếu phát hiện tài khoản bị xâm phạm.",
                "Chúng tôi có quyền khóa tài khoản nếu phát hiện hành vi gian lận hoặc vi phạm điều khoản.",
            ],
        },
        {
            title: "3. Đặt hàng và thanh toán",
            content: [
                "Đơn hàng chỉ được xác nhận sau khi thanh toán thành công.",
                "Giá sản phẩm có thể thay đổi mà không cần thông báo trước.",
                "Chúng tôi có quyền hủy đơn hàng nếu phát hiện gian lận hoặc lỗi hệ thống.",
                "Mọi giao dịch đều được ghi nhận và có thể truy xuất khi cần thiết.",
            ],
        },
        {
            title: "4. Sở hữu trí tuệ",
            content: [
                "Toàn bộ nội dung trên website thuộc quyền sở hữu của Apple Store Vietnam.",
                "Không được sao chép, phân phối hoặc sử dụng nội dung khi chưa có sự đồng ý.",
                "Logo và tên thương hiệu Apple là tài sản của Apple Inc.",
            ],
        },
        {
            title: "5. Giới hạn trách nhiệm",
            content: [
                "Chúng tôi không chịu trách nhiệm với các thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ.",
                "Không đảm bảo website luôn hoạt động liên tục, không có lỗi hay virus.",
                "Trách nhiệm tối đa của chúng tôi không vượt quá giá trị đơn hàng của bạn.",
            ],
        },
        {
            title: "6. Luật áp dụng",
            content: [
                "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam.",
                "Mọi tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền tại TP. Hồ Chí Minh.",
            ],
        },
    ];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb
                items={[{ label: "Điều khoản sử dụng" }]}
                className="mb-6"
            />

            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/30">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    {"Điều khoản sử dụng"}
                </h1>
            </div>

            <div className="space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {"Vui lòng đọc kỹ các điều khoản sử dụng trước khi sử dụng dịch vụ của Apple Store Vietnam. Điều khoản này có hiệu lực từ ngày 01/01/2024."}
                </p>

                {TERMS_ITEMS.map((item) => (
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
                    {"Cập nhật lần cuối: 01/01/2024. Mọi thắc mắc vui lòng liên hệ legal@applestore.vn."}
                </p>
            </div>
        </div>
    );
}
