import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./root/Navbar";
import Footer from "./root/Footer";
import TrustBadges from "@/components/shared/TrustBadges";
import CartDrawer from "@/features/cart/components/CartDrawer";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ChatWidget from "@/components/shared/ChatWidget";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { closeAll, toggleMobileMenu, toggleSearch } from "@/store/uiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useGetServerCartQuery } from "@/store/api/cartApi";

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
    useGetServerCartQuery(undefined, {
        skip: !isAuthenticated,
        refetchOnMountOrArgChange: true,
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
            <CartDrawer />
            <ChatWidget />
        </div>
    );
}
