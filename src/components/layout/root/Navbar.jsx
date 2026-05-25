import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
import ResponsiveImage from "@/components/shared/ResponsiveImage";

const SearchOverlay = lazy(() => import("@/components/shared/SearchOverlay"));

export default function Navbar() {
    const dispatch = useDispatch();
    const mobileOpen = useSelector(selectMobileMenuOpen);
    const searchOpen = useSelector(selectSearchOpen);
    const isScrolled = useScrolled(10);
    const SIMPLE_NAV_LINKS = [
        { label: "AppleCare", href: "/apple-care", icon: null },
        { label: "Tin tức", href: "/news", icon: null },
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
                "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-200",
                isScrolled
                    ? "border-border bg-background/90 backdrop-blur-md"
                    : "border-transparent bg-background/60 backdrop-blur-sm",
            )}
        >
            <div className="section-padding">
                <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link
                            to={ROUTES.HOME}
                            aria-label="Trang chủ Apple Store"
                            className="flex shrink-0 items-center transition-opacity hover:opacity-70"
                        >
                            <ResponsiveImage
                                src={appleLogo}
                                alt="Apple"
                                width={24}
                                height={24}
                                loading="eager"
                                fetchPriority="high"
                                className="h-6 w-6 dark:invert"
                            />
                        </Link>

                        <nav className="hidden items-center gap-1 lg:flex">
                            {CATEGORIES.map((cat) => (
                                <MegaMenu key={cat.value} category={cat} />
                            ))}

                            <div className="mx-1 h-4 w-px bg-border" />

                            {SIMPLE_NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.href}
                                    to={link.href}
                                    onMouseEnter={link.href === "/news" ? prefetchNewsList : undefined}
                                    onFocus={link.href === "/news" ? prefetchNewsList : undefined}
                                    className={({ isActive }) =>
                                        cn(
                                            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )
                                    }
                                >
                                    {link.icon && <link.icon className="h-3.5 w-3.5" />}
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <TooltipProvider>
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="default"
                            className="h-9 rounded-full px-2.5 md:gap-2 md:px-3"
                            aria-label="Tìm kiếm (Ctrl K)"
                            aria-keyshortcuts="Control+K Meta+K"
                            title="Tìm kiếm (Ctrl+K / Cmd+K)"
                            onClick={() => {
                                dispatch(toggleSearch(true));
                                dispatch(toggleMobileMenu(false));
                            }}
                        >
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Tìm kiếm</span>
                            <kbd
                                aria-hidden="true"
                                className="hidden h-5 items-center gap-1 rounded-md border border-border bg-background px-1.5 font-sans text-[11px] font-medium text-muted-foreground shadow-sm md:inline-flex"
                            >
                                Ctrl K
                            </kbd>
                        </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {"Tìm kiếm"}
                            </TooltipContent>
                        </Tooltip>

                        <NavbarActions />

                        <Sheet
                            open={mobileOpen}
                            onOpenChange={(open) =>
                                dispatch(toggleMobileMenu(open))
                            }
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>
                                    {"Menu"}
                                </TooltipContent>
                            </Tooltip>
                            <SheetContent side="right" className="w-72 p-0">
                                <NavbarMobile />
                            </SheetContent>
                        </Sheet>
                    </div>
                    </TooltipProvider>
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
