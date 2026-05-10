import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Separator } from "@/components/ui/separator";
import { selectIsAuthenticated, selectCurrentUser } from "@/store/authSlice";
import { toggleMobileMenu } from "@/store/uiSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import {
    User,
    ShoppingBag,
    Heart,
    LogIn,
    UserPlus,
    ChevronRight,
    Newspaper,
    ShieldCheck,
} from "lucide-react";

export default function NavbarMobile() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    const handleClose = () => dispatch(toggleMobileMenu(false));

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-14 items-center border-b border-border px-5">
                <span className="text-sm font-semibold text-foreground">
                    {"Apple Store"}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* User info — đã đăng nhập */}
                {isAuthenticated && user && (
                    <div className="border-b border-border p-4">
                        <Link
                            to={ROUTES.PROFILE}
                            onClick={handleClose}
                            className="flex items-center gap-3"
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.fullName}
                                />
                                <AvatarFallback className="text-sm">
                                    {user.fullName?.charAt(0)?.toUpperCase() ||
                                        "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {user.fullName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </div>
                )}

                {/* Categories */}
                <div className="p-3">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {"Sản phẩm"}
                    </p>
                    <div className="space-y-0.5">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.value}
                                to={cat.href}
                                onClick={handleClose}
                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                {cat.label}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        ))}
                        <Link
                            to={ROUTES.PRODUCTS}
                            onClick={handleClose}
                            className="flex items-center rounded-xl px-3 py-2.5 text-sm text-apple-blue transition-colors hover:bg-muted"
                        >
                            {"Xem tất cả"}
                        </Link>
                    </div>
                </div>

                <Separator />

                {/* ✅ Khám phá */}
                <div className="p-3">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {"Khám phá"}
                    </p>
                    <div className="space-y-0.5">
                        <Link
                            to="/apple-care"
                            onClick={handleClose}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            {"AppleCare"}
                        </Link>
                        <Link
                            to="/news"
                            onClick={handleClose}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Newspaper className="h-4 w-4" />
                            {"Tin tức"}
                        </Link>
                    </div>
                </div>

                <Separator />

                {/* Account links */}
                <div className="p-3">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {"Tài khoản"}
                    </p>
                    <div className="space-y-0.5">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={ROUTES.PROFILE}
                                    onClick={handleClose}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <User className="h-4 w-4" />
                                    {"Tài khoản"}
                                </Link>
                                <Link
                                    to={ROUTES.ORDERS}
                                    onClick={handleClose}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    {"Đơn hàng"}
                                </Link>
                                <Link
                                    to={ROUTES.WISHLIST}
                                    onClick={handleClose}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <Heart className="h-4 w-4" />
                                    {"Yêu thích"}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={ROUTES.LOGIN}
                                    onClick={handleClose}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <LogIn className="h-4 w-4" />
                                    {"Đăng nhập"}
                                </Link>
                                <Link
                                    to={ROUTES.REGISTER}
                                    onClick={handleClose}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {"Đăng ký"}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
