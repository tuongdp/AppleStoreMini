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
import { closeAll } from "@/store/uiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useGetServerCartQuery } from "@/store/api/cartApi";

export default function RootLayout() {
    let pathname = "/";
    try {
        const location = useLocation();
        pathname = location.pathname;
    } catch (e) {
        // ignore
    }
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    useGetServerCartQuery(undefined, {
        skip: !isAuthenticated,
        refetchOnMountOrArgChange: true,
    });

    useEffect(() => {
        dispatch(closeAll());
    }, [pathname, dispatch]);
    return (
        <div className="relative flex min-h-screen flex-col">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1">
                {/* Outlet là nơi React Router sẽ render các trang con (Home, Product,...) */}
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
