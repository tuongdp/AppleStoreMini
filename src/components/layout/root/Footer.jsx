import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { usePublicSettings } from "@/hooks/usePublicSettings";

const FOOTER_LINKS = [
    {
        title: "Mua sắm",
        links: [
            { label: "iPhone", href: `${ROUTES.PRODUCTS}?category=iphone` },
            { label: "iPad", href: `${ROUTES.PRODUCTS}?category=ipad` },
            { label: "Mac", href: `${ROUTES.PRODUCTS}?category=mac` },
            { label: "Watch", href: `${ROUTES.PRODUCTS}?category=apple-watch` },
            { label: "AirPods", href: `${ROUTES.PRODUCTS}?category=airpods` },
            { label: "Phụ kiện", href: `${ROUTES.PRODUCTS}?category=phu-kien` },
        ],
    },
    {
        title: "Khám phá",
        links: [
            { label: "AppleCare", href: "/apple-care" },
            { label: "Tin tức", href: "/news" },
            { label: "Về chúng tôi", href: "/about" },
            { label: "Liên hệ", href: "/contact" },
        ],
    },
        {
            title: "Hỗ trợ",
            links: [
                { label: "Tra cứu đơn hàng", href: ROUTES.ORDER_LOOKUP },
                { label: "Chính sách bảo hành", href: "/warranty" },
                { label: "Chính sách đổi trả", href: "/return" },
                { label: "Chính sách bảo mật", href: "/privacy" },
                { label: "Điều khoản sử dụng", href: "/terms" },
            ],
        },
];

const FALLBACK_SOCIAL = [
    { name: "Facebook", href: "https://www.facebook.com/Pseidon", key: "facebook" },
    { name: "Instagram", href: "https://www.instagram.com/dotuong/", key: "instagram" },
    { name: "YouTube", href: "https://www.youtube.com/@phuctuongo44", key: "youtube" },
];

export default function Footer() {
    const { data: settings } = usePublicSettings();
    const shop = settings?.shop || {};
    const shopName = shop.name || "Apple Store";

    const socialLinks = [
        { name: "Facebook", href: shop.facebook },
        { name: "Zalo", href: shop.zalo },
        { name: "TikTok", href: shop.tiktok },
        { name: "YouTube", href: shop.youtube },
    ].filter((s) => s.href);

    const displaySocial = socialLinks.length > 0
        ? socialLinks
        : FALLBACK_SOCIAL;

    return (
        <footer className="border-t border-border bg-muted/20">
            <div className="section-padding py-12 md:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
                        <div className="col-span-2 md:col-span-1">
                            {shop.logo ? (
                                <img src={shop.logo} alt={shopName} className="mb-4 h-8 w-auto" />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 814 1000"
                                    className="mb-4 h-8 w-8 fill-foreground"
                                >
                                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.1-73.6-96.2-187.8-96.2-296.7 0-166.7 108.7-254.8 215.7-254.8 56.6 0 103.7 37.5 139 37.5 33.8 0 86.5-39.5 151.8-39.5 24.4 0 108.2 2.6 168.6 80.6zm-159.5-197.7c30.3-35.7 51.5-85.4 51.5-135.1 0-6.5-.6-13-1.9-18.2-48.7 1.9-106.4 32.5-140.8 73.6-26.8 30.3-52 80-52 130.4 0 7.1 1.3 14.3 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 43.4 0 98.4-29 127.7-68.5z" />
                                </svg>
                            )}
                            <p className="mb-4 text-sm text-muted-foreground">
                                {shopName} - Chính hãng, uy tín, bảo hành toàn quốc.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {displaySocial.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                                    >
                                        {social.name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {FOOTER_LINKS.map((column) => (
                            <div key={column.title}>
                                <h3 className="mb-4 text-sm font-semibold text-foreground">{column.title}</h3>
                                <ul className="space-y-2.5">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                to={link.href}
                                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div className="col-span-2 md:col-span-1">
                            <h3 className="mb-4 text-sm font-semibold text-foreground">Liên hệ hỗ trợ</h3>
                            <p className="mb-3 text-xs leading-5 text-muted-foreground">
                                Cần tư vấn sản phẩm, bảo hành hoặc đổi trả? Đội ngũ hỗ trợ luôn sẵn sàng.
                            </p>
                            <Link to="/contact" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
                                Gửi yêu cầu hỗ trợ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="section-padding py-5">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
                        <p className="text-xs text-muted-foreground">
                            © 2026 {shopName}. Bảo lưu mọi quyền.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                Chính sách bảo mật
                            </Link>
                            <Link to="/terms" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                Điều khoản sử dụng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
