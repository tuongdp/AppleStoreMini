import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronDown } from "lucide-react";
import { productsApi } from "@/store/api/productsApi";
import { PAGINATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

const getCategoryLinks = (category) => [
    { label: `Tất cả ${category.label}`, href: category.href, bold: true },
    { label: "Mới nhất", href: `${category.href}&sort=newest` },
    { label: "Bán chạy nhất", href: `${category.href}&sort=best_seller` },
    { label: "Giá thấp đến cao", href: `${category.href}&sort=price_asc` },
    { label: "Giá cao đến thấp", href: `${category.href}&sort=price_desc` },
];

export default function MegaMenu({ category }) {
    const dispatch = useDispatch();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const links = getCategoryLinks(category);
    const currentCategory = new URLSearchParams(location.search).get("category");
    const isActive = location.pathname === "/products" && currentCategory === category.value;

    const prefetchProductList = (href) => {
        const params = new URLSearchParams(href.split("?")[1] || "");
        dispatch(
            productsApi.util.prefetch(
                "getProducts",
                {
                    page: 1,
                    limit: PAGINATION.DEFAULT_LIMIT,
                    category: params.get("category") || undefined,
                    sort: params.get("sort") || undefined,
                },
                { ifOlderThan: 60 },
            ),
        );
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Trigger */}
            <button
                aria-current={isActive ? "page" : undefined}
                className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isOpen || isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                {category.label}
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
                                reloadDocument
                                onMouseEnter={() => prefetchProductList(link.href)}
                                onFocus={() => prefetchProductList(link.href)}
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
