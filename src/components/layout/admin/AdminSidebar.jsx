import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Star,
    LogOut,
    Store,
    ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { logout, selectCurrentUser } from "@/store/authSlice";

const SIDEBAR_MAP = {
  "backToStore": "Về trang Store",
  "banners": "Banner",
  "categories": "Danh mục",
  "coupons": "Khuyến mãi",
  "dashboard": "Tổng quan",
  "flashSales": "Flash Sale",
  "logout": "Đăng xuất",
  "news": "Tin tức",
  "options": "Tùy chọn",
  "orders": "Đơn hàng",
  "products": "Sản phẩm",
  "comments": "Bình luận",
  "settings": "Cài đặt",
  "users": "Người dùng"
};
export const ADMIN_NAV_ITEMS = [
    {
        key: "dashboard",
        href: ROUTES.ADMIN_DASHBOARD,
        icon: LayoutDashboard,
        end: true,
    },
    { key: "products", href: ROUTES.ADMIN_PRODUCTS, icon: Package, end: false },
    {
        key: "orders",
        href: ROUTES.ADMIN_ORDERS,
        icon: ShoppingCart,
        end: false,
    },
    { key: "users", href: ROUTES.ADMIN_USERS, icon: Users, end: false },
    { key: "comments", href: "/admin/comments", icon: Star, end: false },
];

export default function AdminSidebar({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);

    const handleLogout = () => {
        dispatch(logout());
        navigate(ROUTES.HOME);
        onClose?.();
    };

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link
                    to={ROUTES.ADMIN_DASHBOARD}
                    className="text-base font-semibold text-foreground transition-opacity hover:opacity-70"
                    onClick={onClose}
                >
                    {"Quản trị"}
                </Link>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {ADMIN_NAV_ITEMS.map((item) => (
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

            {/* Footer */}
            <div className="space-y-1 p-3">
                {/* Back to store */}
                <Link
                    to={ROUTES.HOME}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Store className="h-4 w-4 shrink-0" />
                    {"Về trang Store"}
                </Link>

                <Separator className="my-1" />

                {/* User info */}
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
