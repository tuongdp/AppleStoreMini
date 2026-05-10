import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const getCategoryLinks = (category, t) => [
    { label: `${t("category.all")} ${t(category.label)}`, href: category.href, bold: true },
    { label: t("sort.newest"), href: `${category.href}&sort=newest` },
    { label: t("sort.bestSeller"), href: `${category.href}&sort=best_seller` },
    { label: t("sort.priceAsc"), href: `${category.href}&sort=price_asc` },
    { label: t("sort.priceDesc"), href: `${category.href}&sort=price_desc` },
];

export default function MegaMenu({ category }) {
    const { t } = useTranslation("product");
    const [isOpen, setIsOpen] = useState(false);

    const links = getCategoryLinks(category, t);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Trigger */}
            <button
                className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isOpen
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                {t(category.label)}
                <ChevronDown
                    className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        isOpen && "rotate-180",
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2">
                    {/* ✅ Bridge vô hình — lấp khoảng trống giữa button và dropdown */}
                    <div className="h-3 w-full" />

                    {/* Arrow */}
                    <div className="mx-auto mb-1 h-2 w-4 overflow-hidden">
                        <div className="mx-auto h-3 w-3 rotate-45 border border-border bg-popover" />
                    </div>

                    <div className="w-48 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                to={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                                    link.bold
                                        ? "font-medium text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
