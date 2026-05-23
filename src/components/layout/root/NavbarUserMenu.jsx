import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Package, Heart, Settings, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectHasAdminAccess,
    logout,
} from "@/store/authSlice";
import { ROUTES } from "@/lib/constants";

export default function NavbarUserMenu() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const hasAdminAccess = useSelector(selectHasAdminAccess);

    const handleLogout = () => {
        dispatch(logout());
        navigate(ROUTES.HOME);
    };

    if (!isAuthenticated) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
            >
                <Link to={ROUTES.LOGIN}>
                    <LogIn className="h-5 w-5" />
                    <span className="sr-only">{"Đăng nhập"}</span>
                </Link>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Mở menu tài khoản">
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.avatar} alt={user?.fullName} />
                        <AvatarFallback className="text-xs">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
                {/* User info */}
                <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium text-foreground">
                        {user?.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user?.email}
                    </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link
                        to={ROUTES.PROFILE}
                        className="flex items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        {"Tài khoản"}
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        to={ROUTES.ORDERS}
                        className="flex items-center gap-2"
                    >
                        <Package className="h-4 w-4" />
                        {"Đơn hàng"}
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        to={ROUTES.WISHLIST}
                        className="flex items-center gap-2"
                    >
                        <Heart className="h-4 w-4" />
                        {"Yêu thích"}
                    </Link>
                </DropdownMenuItem>

                {hasAdminAccess && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                to={ROUTES.ADMIN_DASHBOARD}
                                className="flex items-center gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                {"Quản trị"}
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 text-red-500 focus:text-red-500"
                >
                    <LogOut className="h-4 w-4" />
                    {"Đăng xuất"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
