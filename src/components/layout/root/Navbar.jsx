import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import MegaMenu from "./MegaMenu";
import NavbarActions from "./NavbarActions";
import NavbarMobile from "./NavbarMobile";
import NavbarSearch from "./NavbarSearch";
import {
    toggleMobileMenu,
    selectMobileMenuOpen,
    toggleSearch,
    selectSearchOpen,
} from "@/store/uiSlice";
import { useScrolled } from "@/hooks/useScrollToTop";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import appleLogo from "@/assets/images/icons/apple.svg";
import { useCategories } from "@/hooks/useCategories";
// Link đơn giản không có dropdown
const SIMPLE_NAV_LINKS = [{ label: "Tin tức", href: "/news" }];

export default function Navbar() {
    const dispatch = useDispatch();
    const mobileOpen = useSelector(selectMobileMenuOpen);
    const searchOpen = useSelector(selectSearchOpen);
    const isScrolled = useScrolled(10);
    const { categories } = useCategories();
    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full border-b transition-all duration-200",
                isScrolled
                    ? "border-border bg-background/90 backdrop-blur-md"
                    : "border-transparent bg-background/60 backdrop-blur-sm",
            )}
        >
            <div className="section-padding">
                <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4">
                    {/* ── Left — Logo + Nav ── */}
                    <div
                        className={cn(
                            "flex items-center gap-6 transition-all duration-200",
                            searchOpen && "hidden md:flex",
                        )}
                    >
                        {/* Logo */}
                        <Link
                            to={ROUTES.HOME}
                            className="flex shrink-0 items-center transition-opacity hover:opacity-70"
                        >
                            <img
                                src={appleLogo}
                                alt="Apple"
                                className="h-6 w-6 dark:invert"
                            />
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-1 md:flex">
                            {/* Category mega menus */}
                            {categories.map((cat) => (
                                <MegaMenu key={cat.slug} category={cat} />
                            ))}

                            {/* Divider */}
                            <div className="mx-1 h-4 w-px bg-border" />

                            {/* Simple links */}
                            {SIMPLE_NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.href}
                                    to={link.href}
                                    className={({ isActive }) =>
                                        cn(
                                            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:text-foreground",
                                        )
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* ── Center — Search bar ── */}
                    {searchOpen && (
                        <div className="flex flex-1 items-center gap-2">
                            <NavbarSearch
                                onClose={() => dispatch(toggleSearch(false))}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 rounded-full"
                                aria-label="Đóng tìm kiếm"
                                onClick={() => dispatch(toggleSearch(false))}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* ── Right — Actions ── */}
                    <div
                        className={cn(
                            "flex items-center gap-0.5",
                            searchOpen && "hidden md:flex",
                        )}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            aria-label="Tìm kiếm"
                            onClick={() => {
                                dispatch(toggleSearch(true));
                                dispatch(toggleMobileMenu(false));
                            }}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        <NavbarActions />

                        <Sheet
                            open={mobileOpen}
                            onOpenChange={(open) =>
                                dispatch(toggleMobileMenu(open))
                            }
                        >
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full md:hidden"
                                    aria-label="Mở menu"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 p-0">
                                <NavbarMobile />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
