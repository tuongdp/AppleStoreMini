import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { formatPhone } from "@/lib/utils";

const SHOP_LINKS = CATEGORIES.map((category) => ({
    label: category.label,
    href: category.href,
}));

const FOOTER_LINKS = [
    {
        title: "Mua sắm",
        links: SHOP_LINKS,
    },
    {
        title: "Khám phá",
        links: [
            { label: "AppleCare", href: ROUTES.APPLE_CARE },
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

function FacebookIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M14 8.5h2V5.3c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.9V13H5.4v3.6h3.1V24h3.8v-7.4h3l.5-3.6h-3.5v-2.5c0-1 .3-2 1.7-2Z" />
        </svg>
    );
}

function ZaloIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M5.2 5.5h13.6c1 0 1.7.8 1.7 1.7v8.2c0 1-.8 1.7-1.7 1.7H12l-3.5 2.4v-2.4H5.2c-1 0-1.7-.8-1.7-1.7V7.2c0-1 .8-1.7 1.7-1.7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M7 9h4l-4 5h4M13 14V9h1.8c1.4 0 2.2 1 2.2 2.5S16.2 14 14.8 14H13Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TikTokIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M15.8 3c.3 2.4 1.7 4 4.2 4.2v3.3c-1.5.1-2.9-.3-4.1-1.1v5.9c0 3.4-2.2 5.7-5.5 5.7-3 0-5.4-2.2-5.4-5.1 0-3.4 2.9-5.8 6.2-5.1v3.4c-1.5-.5-2.8.3-2.8 1.7 0 1.1.9 1.9 2 1.9 1.3 0 2.1-.8 2.1-2.5V3h3.3Z" />
        </svg>
    );
}

function YouTubeIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.8 12 4.8 12 4.8s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29.2 29.2 0 0 0 2 12a29.2 29.2 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29.2 29.2 0 0 0 22 12a29.2 29.2 0 0 0-.4-4.8ZM10 15.2V8.8l5.3 3.2L10 15.2Z" />
        </svg>
    );
}

const SOCIAL_ICONS = {
    Facebook: FacebookIcon,
    Zalo: ZaloIcon,
    TikTok: TikTokIcon,
    YouTube: YouTubeIcon,
};

export default function Footer() {
    const { data: settings } = usePublicSettings();
    const shop = settings?.shop || {};
    const shopName = shop.name || "Apple Store";

    const socialLinks = [
        { name: "Facebook", href: shop.facebook, icon: SOCIAL_ICONS.Facebook },
        { name: "Zalo", href: shop.zalo, icon: SOCIAL_ICONS.Zalo },
        { name: "TikTok", href: shop.tiktok, icon: SOCIAL_ICONS.TikTok },
        { name: "YouTube", href: shop.youtube, icon: SOCIAL_ICONS.YouTube },
    ];

    const contactLinks = [
        shop.phone
            ? {
                label: formatPhone(shop.phone),
                href: `tel:${String(shop.phone).replace(/\D/g, "")}`,
                icon: Phone,
            }
            : null,
        shop.email
            ? {
                label: shop.email,
                href: `mailto:${shop.email}`,
                icon: Mail,
            }
            : null,
    ].filter(Boolean);

    return (
        <footer className="border-t border-border bg-muted/20">
            <div className="section-padding py-12 md:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
                        <div className="col-span-2 md:col-span-1">
                            <Link
                                to={ROUTES.HOME}
                                aria-label={`Về trang chủ ${shopName}`}
                                className="mb-4 inline-flex transition-opacity hover:opacity-70"
                            >
                                {shop.logo ? (
                                    <img
                                        src={shop.logo}
                                        alt={shopName}
                                        className="h-8 w-auto"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 814 1000"
                                        className="h-8 w-8 fill-foreground"
                                        aria-hidden="true"
                                    >
                                        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.1-73.6-96.2-187.8-96.2-296.7 0-166.7 108.7-254.8 215.7-254.8 56.6 0 103.7 37.5 139 37.5 33.8 0 86.5-39.5 151.8-39.5 24.4 0 108.2 2.6 168.6 80.6zm-159.5-197.7c30.3-35.7 51.5-85.4 51.5-135.1 0-6.5-.6-13-1.9-18.2-48.7 1.9-106.4 32.5-140.8 73.6-26.8 30.3-52 80-52 130.4 0 7.1 1.3 14.3 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 43.4 0 98.4-29 127.7-68.5z" />
                                    </svg>
                                )}
                            </Link>

                            <p className="mb-4 text-sm text-muted-foreground">
                                {shopName} - Chính hãng, uy tín, bảo hành toàn quốc.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {socialLinks.map((social) => (
                                    social.href ? (
                                        <a
                                            key={social.name}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`${social.name} của ${shopName}`}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                                        >
                                            <social.icon className="h-3.5 w-3.5 shrink-0" />
                                            <span>{social.name}</span>
                                        </a>
                                    ) : (
                                        <span
                                            key={social.name}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground/60"
                                            title={`${social.name} chưa được cấu hình`}
                                            aria-label={`${social.name} chưa được cấu hình`}
                                        >
                                            <social.icon className="h-3.5 w-3.5 shrink-0" />
                                            <span>{social.name}</span>
                                        </span>
                                    )
                                ))}
                            </div>
                        </div>

                        {FOOTER_LINKS.map((column) => (
                            <div key={column.title}>
                                <h3 className="mb-4 text-sm font-semibold text-foreground">
                                    {column.title}
                                </h3>
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
                            <h3 className="mb-4 text-sm font-semibold text-foreground">
                                Liên hệ hỗ trợ
                            </h3>
                            <p className="mb-3 text-xs leading-5 text-muted-foreground">
                                Cần tư vấn sản phẩm, bảo hành hoặc đổi trả? Đội ngũ hỗ trợ luôn sẵn sàng.
                            </p>

                            {contactLinks.length > 0 && (
                                <ul className="mb-3 space-y-2">
                                    {contactLinks.map((contact) => (
                                        <li key={contact.href}>
                                            <a
                                                href={contact.href}
                                                className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                <contact.icon className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{contact.label}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {shop.address && (
                                <p className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{shop.address}</span>
                                </p>
                            )}

                            <Link
                                to="/contact"
                                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                            >
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
                            <Link
                                to="/privacy"
                                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Chính sách bảo mật
                            </Link>
                            <Link
                                to="/terms"
                                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Điều khoản sử dụng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
