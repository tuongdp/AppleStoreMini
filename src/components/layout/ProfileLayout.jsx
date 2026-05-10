import { t } from "@/i18n/useTranslation";
import { Outlet, useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import ProfileSidebar from "./profile/ProfileSidebar";

const BREADCRUMB_MAP = {
    "/profile": "sidebar.profile",
    "/profile/orders": "sidebar.orders",
    "/profile/addresses": "sidebar.addresses",
    "/profile/change-password": "sidebar.changePassword",
    "/profile/wishlist": "sidebar.wishlist",
    "/profile/points": "sidebar.points",
};

export default function ProfileLayout() {
    const { pathname } = useLocation();

    const isOrderDetail = /^\/profile\/orders\/.+/.test(pathname);
    const currentLabel = isOrderDetail
        ? "Đơn hàng của tôi"
        : t(BREADCRUMB_MAP[pathname] || "sidebar.profile");

    return (
        <div className="section-padding py-8 md:py-12">
            <div className="mx-auto max-w-7xl">
                {/* ── Breadcrumb ── */}
                <nav className="mb-6 flex items-center gap-1.5 text-sm">
                    <Link
                        to="/"
                        className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Home className="h-3.5 w-3.5" />
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                        {currentLabel}
                    </span>
                    {isOrderDetail && (
                        <>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                                {"Chi tiết đơn hàng"}
                            </span>
                        </>
                    )}
                </nav>

                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                    {/* ── Sidebar ── */}
                    <aside className="w-full shrink-0 md:w-64">
                        <ProfileSidebar />
                    </aside>

                    {/* ── Main content ── */}
                    <main className="min-w-0 flex-1">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
