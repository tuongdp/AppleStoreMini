import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
    ChevronRight,
    ChevronDown,
    Store,
    MessageSquare,
    Tag,
    LayoutGrid,
    Newspaper,
    FileSliders,
    Loader2,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ThemeToggle from "@/components/shared/ThemeToggle";
import SeoHead from "@/components/shared/SeoHead";
import AdminBreadcrumb from "@/components/layout/admin/AdminBreadcrumb";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { logout, selectCurrentUser, selectIsAdmin } from "@/store/authSlice";
import { useUpdateProfileMutation, useUploadAvatarMutation } from "@/store/api/usersApi";
import { useChangePasswordMutation } from "@/store/api/authApi";

const SIDEBAR_MAP = {
    backToStore: "Về cửa hàng",
    banners: "Banner quảng cáo",
    categories: "Danh mục",
    coupons: "Khuyến mãi",
    dashboard: "Tổng quan",
    logout: "Đăng xuất",
    news: "Tin tức",
    orders: "Đơn hàng",
    products: "Sản phẩm",
    comments: "Bình luận sản phẩm",
    settings: "Cài đặt",
    ai: "Cấu hình AI",
    users: "Người dùng",
    systemGroup: "Hệ thống",
    contentGroup: "Nội dung",
    productGroup: "Sản phẩm",
};

const NAV_GROUPS = [
    {
        type: "item",
        key: "dashboard",
        href: ROUTES.ADMIN_DASHBOARD,
        icon: LayoutDashboard,
        end: true,
    },
    {
        type: "group",
        key: "productGroup",
        icon: Package,
        items: [
            { key: "products", href: ROUTES.ADMIN_PRODUCTS, icon: Package, permission: "products" },
            { key: "categories", href: "/admin/categories", icon: LayoutGrid, permission: "categories" },
            { key: "comments", href: "/admin/comments", icon: MessageSquare, permission: "comments" },
        ],
    },
    {
        type: "item",
        key: "orders",
        href: ROUTES.ADMIN_ORDERS,
        icon: ShoppingCart,
        permission: "orders",
    },
    {
        type: "item",
        key: "users",
        href: ROUTES.ADMIN_USERS,
        icon: Users,
        permission: "users",
    },
    {
        type: "item",
        key: "coupons",
        href: "/admin/coupons",
        icon: Tag,
        permission: "coupons",
    },
        {
            type: "group",
            key: "contentGroup",
            icon: Newspaper,
            items: [
                { key: "news", href: "/admin/news", icon: Newspaper, permission: "news" },
                { key: "banners", href: "/admin/banners", icon: FileSliders, permission: "banners" },
            ],
        },
    ];

const FLAT_NAV_ITEMS = NAV_GROUPS.flatMap((group) => (group.type === "item" ? [group] : group.items));

const getAdminPageTitle = (pathname) => {
    const item = [...FLAT_NAV_ITEMS]
        .sort((a, b) => b.href.length - a.href.length)
        .find((navItem) => pathname === navItem.href || pathname.startsWith(`${navItem.href}/`));

    if (pathname.includes("/create")) return "Tạo mới";
    if (pathname.includes("/edit")) return "Chỉnh sửa";
    if (pathname.split("/").length > 3) return "Chi tiết";

    return item ? SIDEBAR_MAP[item.key] : "Quản trị";
};

function SidebarContent({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const user = useSelector(selectCurrentUser);
    const isAdmin = useSelector(selectIsAdmin);
    const defaultAdminHref = ROUTES.ADMIN_DASHBOARD;

    const [collapsed, setCollapsed] = useState({});
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({ fullName: "", email: "", phone: "" });
    const avatarInputRef = useRef(null);

    const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
    const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
    const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation();

    const [showChangePw, setShowChangePw] = useState(false);
    const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Đã đăng xuất");
        navigate(ROUTES.ADMIN_LOGIN);
        onClose?.();
    };

    const toggleGroup = (key) => {
        setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isGroupActive = (group) => {
        if (group.type !== "group") return false;
        return group.items.some(
            (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`),
        );
    };

    const openProfile = () => {
        setProfileForm({
            fullName: user?.fullName || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });
        setShowChangePw(false);
        setPwForm({ current: "", newPw: "", confirm: "" });
        setProfileOpen(true);
    };

    const handleSaveProfile = async () => {
        try {
            await updateProfile(profileForm).unwrap();
            toast.success("Đã cập nhật thông tin");
            setProfileOpen(false);
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            await uploadAvatar(formData).unwrap();
            toast.success("Đã cập nhật ảnh đại diện");
        } catch {
            toast.error("Tải ảnh lên thất bại");
        }
    };

    const handleChangePassword = async () => {
        if (!pwForm.current || !pwForm.newPw) {
            toast.error("Vui lòng điền đầy đủ các trường");
            return;
        }
        if (pwForm.newPw.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }
        if (pwForm.newPw !== pwForm.confirm) {
            toast.error("Mật khẩu nhập lại không khớp");
            return;
        }
        try {
            await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw }).unwrap();
            toast.success("Đổi mật khẩu thành công");
            setShowChangePw(false);
            setPwForm({ current: "", newPw: "", confirm: "" });
        } catch (error) {
            toast.error(error?.data?.message || "Đổi mật khẩu thất bại");
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
                <Link
                    to={defaultAdminHref}
                    className="text-base font-semibold text-foreground"
                    onClick={onClose}
                >
                    {"Quản trị"}
                </Link>
            </div>

            <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3">
                {NAV_GROUPS.map((item) => {
                    if (item.type === "item") {
                        return (
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
                                    {SIDEBAR_MAP[item.key] || item.key}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                            </NavLink>
                        );
                    }

                    const active = isGroupActive(item);
                    const isOpen = collapsed[item.key] != null ? !collapsed[item.key] : active;
                    return (
                        <div key={item.key}>
                            <button
                                onClick={() => toggleGroup(item.key)}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <span className="flex items-center gap-3">
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    {SIDEBAR_MAP[item.key] || item.key}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "h-3.5 w-3.5 shrink-0 transition-transform",
                                        isOpen && "rotate-180",
                                    )}
                                />
                            </button>
                            {isOpen && (
                                <div className="ml-4 border-l border-border pl-3">
                                    {item.items.map((sub) => (
                                        <NavLink
                                            key={sub.key}
                                            to={sub.href}
                                            onClick={onClose}
                                            className={({ isActive }) =>
                                                cn(
                                                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                                                    isActive
                                                        ? "bg-accent font-medium text-foreground"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                )
                                            }
                                        >
                                            <span className="flex items-center gap-3">
                                                <sub.icon className="h-3.5 w-3.5 shrink-0" />
                                                {SIDEBAR_MAP[sub.key] || sub.key}
                                            </span>
                                            <ChevronRight className="h-3 w-3 opacity-40" />
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <Separator className="shrink-0" />

            <div className="shrink-0 space-y-0.5 p-3">
                <Link
                    to={ROUTES.HOME}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={onClose}
                >
                    <Store className="h-4 w-4 shrink-0" />
                    {"Về cửa hàng"}
                </Link>

                <button
                    type="button"
                    onClick={openProfile}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                    title="Cập nhật thông tin cá nhân"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.fullName} />
                        <AvatarFallback className="text-xs">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                            {user?.fullName || user?.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.email || user?.username}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {isAdmin ? "Quản trị viên" : "Nhân viên"}
                        </p>
                    </div>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {"Đăng xuất"}
                </button>
            </div>

            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Thông tin cá nhân</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin tài khoản của bạn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user?.avatar} alt={user?.fullName} />
                                <AvatarFallback className="text-xl">
                                    <User className="h-8 w-8" />
                                </AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <span className="text-xs leading-none">+</span>
                                )}
                            </button>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="w-full space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="profile-fullName">Họ và tên</Label>
                                <Input
                                    id="profile-fullName"
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="profile-email">Email</Label>
                                <Input
                                    id="profile-email"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="profile-phone">Số điện thoại</Label>
                                <Input
                                    id="profile-phone"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>

                            <Separator />

                            {!showChangePw ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-full"
                                    onClick={() => setShowChangePw(true)}
                                >
                                    Đổi mật khẩu
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="pw-current">Mật khẩu hiện tại</Label>
                                    <Input
                                        id="pw-current"
                                        type="password"
                                        placeholder="Nhập mật khẩu hiện tại"
                                        value={pwForm.current}
                                        onChange={(e) => setPwForm((prev) => ({ ...prev, current: e.target.value }))}
                                    />
                                    <Label htmlFor="pw-new">Mật khẩu mới</Label>
                                    <Input
                                        id="pw-new"
                                        type="password"
                                        placeholder="Ít nhất 6 ký tự"
                                        value={pwForm.newPw}
                                        onChange={(e) => setPwForm((prev) => ({ ...prev, newPw: e.target.value }))}
                                    />
                                    <Label htmlFor="pw-confirm">Nhập lại mật khẩu mới</Label>
                                    <Input
                                        id="pw-confirm"
                                        type="password"
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={pwForm.confirm}
                                        onChange={(e) => setPwForm((prev) => ({ ...prev, confirm: e.target.value }))}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="w-full rounded-full"
                                        onClick={handleChangePassword}
                                        disabled={isChangingPw}
                                    >
                                        {isChangingPw ? "Đang lưu..." : "Lưu mật khẩu mới"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setProfileOpen(false)}>
                            Hủy
                        </Button>
                        <Button className="rounded-full" onClick={handleSaveProfile} disabled={isSaving}>
                            {isSaving ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const pageTitle = getAdminPageTitle(location.pathname);

    return (
        <>
            <SeoHead title={pageTitle} url={location.pathname} noindex />
            <div className="flex min-h-screen bg-muted/40">
                <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:flex md:flex-col">
                    <SidebarContent />
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    aria-label="Mở menu quản trị"
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

                        <div className="hidden min-w-0 md:block">
                            <AdminBreadcrumb className="mb-1" />
                            <h2 className="truncate text-sm font-medium text-foreground">{pageTitle}</h2>
                        </div>

                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}
