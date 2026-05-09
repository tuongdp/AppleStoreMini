import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

const BADGES = [
    {
        icon: Truck,
        title: "Miễn phí vận chuyển",
        desc: "Đơn từ 500.000₫",
    },
    {
        icon: ShieldCheck,
        title: "Bảo hành chính hãng",
        desc: "1 - 2 năm tuỳ sản phẩm",
    },
    {
        icon: RotateCcw,
        title: "Đổi trả dễ dàng",
        desc: "Trong vòng 14 ngày",
    },
];

export default function TrustBadges() {
    return (
        <div className="border-t border-border">
            <div className="section-padding py-6 md:py-8">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {BADGES.map((badge) => (
                            <div
                                key={badge.title}
                                className="flex items-center justify-center gap-3"
                            >
                                <badge.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {badge.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {badge.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
