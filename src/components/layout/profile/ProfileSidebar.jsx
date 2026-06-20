import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, ShoppingBag, Lock, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ProfileSidebarItem from "./ProfileSidebarItem";
import { logout, selectCurrentUser } from "@/store/authSlice";
import { ROUTES } from "@/lib/constants";

const SIDEBAR_MAP = {
  backToStore: "Về cửa hàng",
  banners: "Banner quảng cáo",
  categories: "Danh mục",
  coupons: "Khuyến mãi",
    dashboard: "Tổng quan",
    logout: "Đăng xuất",
  news: "Tin tức",
  options: "Tùy chọn",
  orders: "Đơn hàng",
  products: "Sản phẩm",
  comments: "Bình luận sản phẩm",
  settings: "Cài đặt",
  users: "Người dùng",
  profile: "Trang cá nhân",
  changePassword: "Đổi mật khẩu",
};

const NAV_ITEMS = [
  {
    key: "profile",
    href: ROUTES.PROFILE,
    icon: User,
    end: true,
  },
  {
    key: "orders",
    href: ROUTES.ORDERS,
    icon: ShoppingBag,
    end: false,
  },
  {
    key: "changePassword",
    href: `${ROUTES.PROFILE}/change-password`,
    icon: Lock,
    end: true,
  },
];

export default function ProfileSidebar({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đã đăng xuất");
    navigate(ROUTES.LOGIN);
    onClose?.();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {/* User info */}
      <div className="mb-4 flex items-center gap-3 px-2 py-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.avatar} alt={user?.fullName} />
          <AvatarFallback className="bg-muted text-sm font-medium">
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.fullName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </div>

      <Separator className="mb-2" />

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <ProfileSidebarItem
            key={item.key}
            href={item.href}
            icon={item.icon}
            label={SIDEBAR_MAP[item.key] || item.key}
            end={item.end}
            onClick={onClose}
          />
        ))}

        <Separator className="my-2" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {"Đăng xuất"}
        </button>
      </nav>
    </div>
  );
}
