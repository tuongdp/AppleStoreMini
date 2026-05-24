import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { productsApi } from "@/store/api/productsApi";
import { PAGINATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function MegaMenu({ category }) {
    const dispatch = useDispatch();
    const location = useLocation();
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
                },
                { ifOlderThan: 60 },
            ),
        );
    };

    return (
        <Link
            to={category.href}
            aria-current={isActive ? "page" : undefined}
            onMouseEnter={() => prefetchProductList(category.href)}
            onFocus={() => prefetchProductList(category.href)}
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
        >
            {category.label}
        </Link>
    );
}
