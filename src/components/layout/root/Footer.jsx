import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      { label: "Chính sách bảo hành", href: "/warranty" },
      { label: "Chính sách đổi trả", href: "/return" },
      { label: "Chính sách bảo mật", href: "/privacy" },
      { label: "Điều khoản sử dụng", href: "/terms" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/Pseidon",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/dotuong/",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@phuctuongo44",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        toast.success("Đăng ký nhận tin thành công!");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.message || "Đăng ký thất bại");
      }
    } catch {
      toast.error("Không thể kết nối, vui lòng thử lại");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="border-t border-border bg-muted/20">
      {/* ── Main footer ── */}
      <div className="section-padding py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 814 1000"
                className="mb-4 h-8 w-8 fill-foreground"
              >
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.1-73.6-96.2-187.8-96.2-296.7 0-166.7 108.7-254.8 215.7-254.8 56.6 0 103.7 37.5 139 37.5 33.8 0 86.5-39.5 151.8-39.5 24.4 0 108.2 2.6 168.6 80.6zm-159.5-197.7c30.3-35.7 51.5-85.4 51.5-135.1 0-6.5-.6-13-1.9-18.2-48.7 1.9-106.4 32.5-140.8 73.6-26.8 30.3-52 80-52 130.4 0 7.1 1.3 14.3 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 43.4 0 98.4-29 127.7-68.5z" />
              </svg>
              <p className="mb-4 text-sm text-muted-foreground">
                Apple Store — Chính hãng, uy tín, bảo hành toàn quốc.
              </p>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
              ))}
            </div>

            {/* Subscribe column */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Đăng ký nhận tin
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Nhận khuyến mãi và thông tin sản phẩm mới nhất
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                <Button type="submit" size="sm" className="h-9 shrink-0" disabled={subscribing}>
                  {subscribing ? "..." : "Đăng ký"}
                </Button>
              </form>
            </div>
          </div>

            {/* Link columns */}
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link, index) => (
                    <li key={index}>
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
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border">
        <div className="section-padding py-5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2026 Apple Store. Bảo lưu mọi quyền.
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
