import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import MegaMenu from "./MegaMenu";
import NavbarActions from "./NavbarActions";
import NavbarMobile from "./NavbarMobile";
import { newsApi } from "@/store/api/newsApi";
import {
    toggleMobileMenu,
    selectMobileMenuOpen,
    toggleSearch,
    selectSearchOpen,
} from "@/store/uiSlice";
import { useScrolled } from "@/hooks/useScrollToTop";
import { CATEGORIES, PAGINATION, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { appleLogo } from "@/assets/images";

const SearchOverlay = lazy(() => import("@/components/shared/SearchOverlay"));

export default function Navbar() {
    const dispatch = useDispatch();
    const mobileOpen = useSelector(selectMobileMenuOpen);
    const searchOpen = useSelector(selectSearchOpen);
    const isScrolled = useScrolled(10);
    const SIMPLE_NAV_LINKS = [
        { label: "AppleCare", href: "/apple-care", icon: null },

        { label: "Tin tức", href: "/news", icon: null, reloadDocument: true },
    ];

    const prefetchNewsList = () => {
        dispatch(
            newsApi.util.prefetch(
                "getNews",
                { page: 1, limit: PAGINATION.DEFAULT_LIMIT },
                { ifOlderThan: 60 },
            ),
        );
    };

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
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link
                            to={ROUTES.HOME}
                            aria-label="Trang chủ Apple Store"
                            className="flex shrink-0 items-center transition-opacity hover:opacity-70"
                        >
                            <img
                                src={appleLogo}
                                alt="Apple"
                                className="h-6 w-6 dark:invert"
                            />
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-1 lg:flex">
                            {CATEGORIES.map((cat) => (
                                <MegaMenu key={cat.value} category={cat} />
                            ))}

                            <div className="mx-1 h-4 w-px bg-border" />

                            {SIMPLE_NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.href}
                                    to={link.href}
                                    reloadDocument={link.reloadDocument}
                                    onMouseEnter={link.href === "/news" ? prefetchNewsList : undefined}
                                    onFocus={link.href === "/news" ? prefetchNewsList : undefined}
                                    className={({ isActive }) =>
                                        cn(
                                            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:text-foreground",
                                        )
                                    }
                                >
                                    {link.icon && <link.icon className="h-3.5 w-3.5" />}
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* ── Right — Actions ── */}
                    <div className="flex items-center gap-0.5">
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
                                    className="rounded-full lg:hidden"
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

            {searchOpen && (
                <Suspense fallback={null}>
                    <SearchOverlay
                        open={searchOpen}
                        onClose={() => dispatch(toggleSearch(false))}
                    />
                </Suspense>
            )}
        </header>
    );
}
