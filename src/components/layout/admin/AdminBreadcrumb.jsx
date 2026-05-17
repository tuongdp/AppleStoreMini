import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const SEGMENT_MAP = {
    admin: "Quản trị",
    dashboard: "Tổng quan",
    products: "Sản phẩm",
    orders: "Đơn hàng",
    users: "Người dùng",
    comments: "Bình luận SP",
    "news-comments": "Bình luận tin",
    create: "Tạo mới",
    edit: "Chỉnh sửa",
};

export default function AdminBreadcrumb({ className }) {
    let pathname = "";
    try {
        const location = useLocation();
        pathname = location.pathname;
    } catch (e) {
        pathname = "";
    }

    const segments = pathname.split("/").filter(Boolean);

    const items = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isId = /^[0-9a-fA-F-]{6,}$/.test(segment);
        const label = isId
            ? segment.slice(0, 8) + "..."
            : SEGMENT_MAP[segment] || segment;

        return { label, href, isId };
    });

    if (items.length <= 1) return null;

    return (
        <nav
            aria-label="Admin breadcrumb"
            className={cn("flex items-center gap-1 text-sm", className)}
        >
            {/* Home */}
            <Link
                to={ROUTES.ADMIN_DASHBOARD}
                className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
                <Home className="h-3.5 w-3.5" />
            </Link>

            {/* Segments */}
            {items.slice(1).map((item, index) => {
                const isLast = index === items.length - 2;

                return (
                    <span key={index} className="flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        {isLast ? (
                            <span className="font-medium text-foreground">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.href}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
