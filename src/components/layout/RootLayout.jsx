import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./root/Navbar";
import Footer from "./root/Footer";
import TrustBadges from "@/components/shared/TrustBadges";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
    closeAll,
    toggleCartDrawer,
    toggleMobileMenu,
    toggleSearch,
    selectCartDrawerOpen,
} from "@/store/uiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useGetServerCartQuery } from "@/store/api/cartApi";

const CartDrawer = lazy(() => import("@/features/cart/components/CartDrawer"));
const ChatWidget = lazy(() => import("@/components/shared/ChatWidget"));

function isTypingTarget(target) {
    if (!(target instanceof HTMLElement)) return false;

    const tagName = target.tagName.toLowerCase();
    return (
        target.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select"
    );
}

export default function RootLayout() {
    const { pathname } = useLocation();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isCartDrawerOpen = useSelector(selectCartDrawerOpen);
    const [chatMounted, setChatMounted] = useState(false);
    useGetServerCartQuery(undefined, {
        skip: !isAuthenticated,
        refetchOnMountOrArgChange: false,
    });

    useEffect(() => {
        dispatch(closeAll());
    }, [pathname, dispatch]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const isSearchShortcut =
                (event.ctrlKey || event.metaKey) &&
                !event.altKey &&
                event.key.toLowerCase() === "k";

            if (!isSearchShortcut || isTypingTarget(event.target)) return;

            event.preventDefault();
            dispatch(toggleMobileMenu(false));
            dispatch(toggleCartDrawer(false));
            dispatch(toggleSearch(true));
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dispatch]);

    return (
        <div className="relative flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">
                Bỏ qua đến nội dung chính
            </a>
            <ScrollToTop />
            <Navbar />
            <main id="main-content" className="flex-1" tabIndex={-1}>
                <Outlet />
            </main>
            <TrustBadges />
            <Footer />
            <ScrollToTopButton />
            {isCartDrawerOpen && (
                <Suspense fallback={null}>
                    <CartDrawer />
                </Suspense>
            )}
            {chatMounted ? (
                <Suspense fallback={null}>
                    <ChatWidget initialOpen />
                </Suspense>
            ) : (
                <button
                    type="button"
                    onClick={() => setChatMounted(true)}
                    aria-label="Má»Ÿ chat"
                    className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
                >
                    <MessageCircle className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
