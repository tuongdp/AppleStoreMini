import Breadcrumb from "@/components/shared/Breadcrumb";

export default function AboutPage() {
    const values = [0, 1, 2, 3, 4];

    return (
        <div className="mx-auto max-w-3xl section-padding py-12">
            <Breadcrumb items={[{ label: "Về chúng tôi" }]} className="mb-6" />

            <h1 className="mb-8 text-3xl font-semibold text-foreground">
                {"Về chúng tôi"}
            </h1>

            <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {"Chúng tôi là ai"}
                    </h2>
                    <p>{"Apple Store Vietnam là cửa hàng ủy quyền chính thức của Apple tại Việt Nam, cung cấp toàn bộ các dòng sản phẩm Apple bao gồm iPhone, iPad, Mac, Apple Watch, AirPods và các phụ kiện chính hãng."}</p>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {"Sứ mệnh"}
                    </h2>
                    <p>{"Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho người dùng Apple tại Việt Nam — từ tư vấn sản phẩm, giao hàng nhanh chóng đến dịch vụ hậu mãi tận tâm."}</p>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {"Giá trị cốt lõi"}
                    </h2>
                    <ul className="list-inside list-disc space-y-2">
                        {values.map((i) => (
                            <li key={i}>{t(`about.values.${i}`)}</li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        {"Liên hệ"}
                    </h2>
                    <ul className="space-y-1">
                        <li>{"Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"}</li>
                        <li>{"Email: support@applestore.vn"}</li>
                        <li>{"Hotline: 1800 1234 (miễn phí)"}</li>
                        <li>{"Giờ làm việc: 8:00 – 21:00 hàng ngày"}</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
