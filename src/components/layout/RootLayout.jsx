import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./root/Navbar";
import Footer from "./root/Footer";
import TrustBadges from "@/components/shared/TrustBadges";
import CartDrawer from "@/features/cart/components/CartDrawer";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { closeAll } from "@/store/uiSlice";

export default function RootLayout() {
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(closeAll());
    }, [location.pathname, dispatch]);
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
        </div>
    );
}
