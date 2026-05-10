import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

export default function Breadcrumb({ items = [], className }) {
    const { t } = useTranslation();

    // items = [{ label: "iPhone", href: "/products?category=iphone" }, { label: "iPhone 15 Pro" }]
    // Item cuối cùng không có href — đó là trang hiện tại

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center gap-1 text-sm", className)}
        >
            {/* Home */}
            <Link
                to="/"
                className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only">{t("nav.home")}</span>
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <span key={index} className="flex items-center gap-1">
                        {/* Separator */}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />

                        {/* Item */}
                        {isLast || !item.href ? (
                            <span
                                className="max-w-[200px] truncate font-medium text-foreground"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.href}
                                className="max-w-[150px] truncate text-muted-foreground transition-colors hover:text-foreground"
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
