import { useDispatch, useSelector } from "react-redux";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import AdminSidebar from "./AdminSidebar";
import { selectCurrentUser, logout } from "@/store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useState } from "react";
import { LogOut, Store, User } from "lucide-react";

export default function AdminTopBar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate(ROUTES.HOME);
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
            {/* Left — mobile menu + title */}
            <div className="flex items-center gap-3">
                {/* Mobile sidebar trigger */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <AdminSidebar onClose={() => setMobileOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Title — desktop */}
                <span className="hidden text-sm font-medium text-muted-foreground md:block">
                    {"Quản trị"}
                </span>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />

                {/* User dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1 rounded-full"
                        >
                            <Avatar className="h-7 w-7">
                                <AvatarImage
                                    src={user?.avatar}
                                    alt={user?.fullName}
                                />
                                <AvatarFallback className="text-xs">
                                    {user?.fullName?.charAt(0)?.toUpperCase() ||
                                        "A"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
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
                                to={ROUTES.HOME}
                                className="flex items-center gap-2"
                            >
                                <Store className="h-4 w-4" />
                                {"Về trang Store"}
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                to={ROUTES.PROFILE}
                                className="flex items-center gap-2"
                            >
                                <User className="h-4 w-4" />
                                {"Tài khoản"}
                            </Link>
                        </DropdownMenuItem>

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
            </div>
        </header>
    );
}
