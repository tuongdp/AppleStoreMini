import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminNotificationBell from "@/features/admin/components/AdminNotificationBell";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Store,
    MessageSquare,
    MessageCircle,
    Tag,
    LayoutGrid,
    Newspaper,
    FileSliders,
    Zap,
    ListFilter,
    RotateCcw,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { logout, selectCurrentUser, selectIsAdmin, selectUserPermissions } from "@/store/authSlice";

const SIDEBAR_MAP = {
  "backToStore": "Về trang Store",
  "banners": "Banner quảng cáo",
  "categories": "Danh mục",
  "coupons": "Khuyến mãi",
  "dashboard": "Tổng quan",
  "flashSales": "Giảm sốc",
  "emailMarketing": "Email Marketing",
  "logout": "Đăng xuất",
  "news": "Tin tức",
  "options": "Tùy chọn",
  "orders": "Đơn hàng",
  "products": "Sản phẩm",
  "returns": "Yêu cầu trả hàng",
  "comments": "Bình luận sản phẩm",
  "news-comments": "Bình luận tin tức",
  "settings": "Cài đặt",
  "users": "Người dùng"
};
const NAV_ITEMS = [
    {
        key: "dashboard",
        href: ROUTES.ADMIN_DASHBOARD,
        icon: LayoutDashboard,
        permission: "dashboard",
        end: true,
    },
    { key: "products", href: ROUTES.ADMIN_PRODUCTS, icon: Package, permission: "products", end: false },
    {
        key: "orders",
        href: ROUTES.ADMIN_ORDERS,
        icon: ShoppingCart,
        permission: "orders",
        end: false,
    },
    { key: "returns", href: "/admin/returns", icon: RotateCcw, permission: "returns", end: false },
    { key: "users", href: ROUTES.ADMIN_USERS, icon: Users, permission: "users", end: false, adminOnly: true },
    { key: "comments", href: "/admin/comments", icon: MessageSquare, permission: "comments", end: false },
    { key: "news-comments", href: "/admin/news-comments", icon: MessageCircle, permission: "newsComments", end: false },
    { key: "coupons", href: "/admin/coupons", icon: Tag, permission: "coupons", end: false, adminOnly: true },
    {
        key: "categories",
        href: "/admin/categories",
        icon: LayoutGrid,
        permission: "categories",
        end: false,
    },
    { key: "news", href: "/admin/news", icon: Newspaper, permission: "news", end: false },
    { key: "banners", href: "/admin/banners", icon: FileSliders, permission: "banners", end: false, adminOnly: true },
    { key: "flashSales", href: "/admin/flash-sales", icon: Zap, permission: "flashSales", end: false, adminOnly: true },
    { key: "emailMarketing", href: "/admin/email-marketing", icon: Mail, permission: null, end: false, adminOnly: true },
    { key: "options", href: "/admin/options", icon: ListFilter, permission: null, end: false, adminOnly: true },
];

function SidebarContent({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const isAdmin = useSelector(selectIsAdmin);
    const permissions = useSelector(selectUserPermissions);

    const visibleItems = NAV_ITEMS.filter((item) => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.permission && !isAdmin && !permissions.includes(item.permission)) return false;
        return true;
    });

    const handleLogout = () => {
        dispatch(logout());
        navigate(ROUTES.HOME);
        onClose?.();
    };

    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link
                    to={ROUTES.ADMIN_DASHBOARD}
                    className="text-base font-semibold text-foreground"
                    onClick={onClose}
                >
                    {"Quản trị"}
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 p-3">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.key}
                        to={item.href}
                        end={item.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                                isActive
                                    ? "bg-accent font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )
                        }
                    >
                        <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {(SIDEBAR_MAP[item.key] || item.key)}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    </NavLink>
                ))}
            </nav>

            <Separator />

            {/* User info + logout */}
            <div className="space-y-0.5 p-3">
                {/* Về store */}
                <Link
                    to={ROUTES.HOME}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={onClose}
                >
                    <Store className="h-4 w-4 shrink-0" />
                    {"Về trang Store"}
                </Link>

                <Separator className="my-1" />

                {/* Avatar + tên */}
                <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.fullName} />
                        <AvatarFallback className="text-xs">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                            {user?.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {"Đăng xuất"}
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-muted/40">
            {/* ── Sidebar desktop ── */}
            <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:flex md:flex-col">
                <SidebarContent />
            </aside>

            {/* ── Main ── */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Topbar */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
                    {/* Mobile menu trigger */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SidebarContent
                                onClose={() => setMobileOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>

                    {/* Title — desktop */}
                    <span className="hidden text-sm font-medium text-muted-foreground md:block">
                        Admin
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <AdminNotificationBell />
                        <ThemeToggle />
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
