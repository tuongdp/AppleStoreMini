import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import RootLayout from "@/components/layout/RootLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import CheckoutLayout from "@/components/layout/CheckoutLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";

// Guards
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import AdminRoute from "@/features/auth/components/AdminRoute";
import GuestRoute from "@/features/auth/components/GuestRoute";

// Pages — public
import HomePage from "@/pages/HomePage";
import ProductListPage from "@/pages/ProductListPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import SearchPage from "@/pages/SearchPage";
import WishlistPage from "@/pages/WishlistPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import WarrantyPage from "@/pages/WarrantyPage";
import ReturnPolicyPage from "@/pages/ReturnPolicyPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";

// Pages — auth
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";

// Pages — checkout
import CheckoutPage from "@/pages/CheckoutPage";

// Pages — profile
import ProfilePage from "@/pages/ProfilePage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import PointsPage from "@/pages/PointsPage";
import PaymentResult from "@/pages/PaymentResult";

// Pages — admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProductList from "@/pages/admin/AdminProductList";
import AdminProductCreate from "@/pages/admin/AdminProductCreate";
import AdminProductEdit from "@/pages/admin/AdminProductEdit";
import AdminOrderList from "@/pages/admin/AdminOrderList";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminUserList from "@/pages/admin/AdminUserList";
import AdminUserDetail from "@/pages/admin/AdminUserDetail";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminReviewPage from "./pages/admin/AdminReviewPage";
import AdminCouponPage from "@/pages/admin/AdminCouponPage";
import AdminCategoryPage from "@/pages/admin/AdminCategoryPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminNewsCreate from "./pages/admin/AdminNewsCreate";
import AdminNewsEdit from "./pages/admin/AdminNewsEdit";
import AdminBannerPage from "./pages/admin/AdminBannerPage";

export const router = createBrowserRouter([
    // ── Public ───────────────────────────────────────────
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "products", element: <ProductListPage /> },
            { path: "products/:slug", element: <ProductDetailPage /> },
            { path: "cart", element: <CartPage /> },
            { path: "search", element: <SearchPage /> },
            { path: "about", element: <AboutPage /> },
            { path: "contact", element: <ContactPage /> },
            { path: "warranty", element: <WarrantyPage /> },
            { path: "return", element: <ReturnPolicyPage /> },
            { path: "privacy", element: <PrivacyPage /> },
            { path: "terms", element: <TermsPage /> },
            { path: "news", element: <NewsPage /> },
            { path: "news/:slug", element: <NewsDetailPage /> },
            { path: "verify-email", element: <VerifyEmailPage /> },
            { path: "payment/success", element: <PaymentResult status="success" /> },
            { path: "payment/fail", element: <PaymentResult status="fail" /> },

            // ── Profile ──────────────────────────────────────────
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <ProfileLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <ProfilePage /> },
                    { path: "wishlist", element: <WishlistPage /> },
                    { path: "orders", element: <OrderHistoryPage /> },
                    { path: "orders/:id", element: <OrderDetailPage /> },
                    {
                        path: "change-password",
                        element: <ChangePasswordPage />,
                    },
                    {
                        path: "points",
                        element: <PointsPage />,
                    },
                ],
            },
        ],
    },

    // ── Auth ─────────────────────────────────────────────
    {
        element: <AuthLayout />,
        children: [
            {
                path: "login",
                element: (
                    <GuestRoute>
                        <LoginPage />
                    </GuestRoute>
                ),
            },
            {
                path: "register",
                element: (
                    <GuestRoute>
                        <RegisterPage />
                    </GuestRoute>
                ),
            },
            {
                path: "forgot-password",
                element: (
                    <GuestRoute>
                        <ForgotPasswordPage />
                    </GuestRoute>
                ),
            },
            {
                path: "reset-password/:token",
                element: <ResetPasswordPage />,
            },
        ],
    },

    // ── Checkout ─────────────────────────────────────────
    {
        element: (
            <ProtectedRoute>
                <CheckoutLayout />
            </ProtectedRoute>
        ),
        children: [{ path: "checkout", element: <CheckoutPage /> }],
    },

    // // ── Profile ──────────────────────────────────────────
    // {
    //     path: "profile",
    //     element: (
    //         <ProtectedRoute>
    //             <ProfileLayout />
    //         </ProtectedRoute>
    //     ),
    //     children: [
    //         { index: true, element: <ProfilePage /> },
    //         { path: "wishlist", element: <WishlistPage /> },
    //         { path: "orders", element: <OrderHistoryPage /> },
    //         { path: "orders/:id", element: <OrderDetailPage /> },
    //         { path: "addresses", element: <AddressBookPage /> },
    //         { path: "change-password", element: <ChangePasswordPage /> },
    //     ],
    // },

    // ── Admin ─────────────────────────────────────────────
    {
        path: "admin/login",
        element: <AdminLoginPage />,
    },

    {
        path: "admin",
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <AdminDashboard /> },
            { path: "products", element: <AdminProductList /> },
            { path: "products/create", element: <AdminProductCreate /> },
            { path: "products/:id/edit", element: <AdminProductEdit /> },
            { path: "orders", element: <AdminOrderList /> },
            { path: "orders/:id", element: <AdminOrderDetail /> },
            { path: "users", element: <AdminUserList /> },
            { path: "users/:id", element: <AdminUserDetail /> },
            { path: "reviews", element: <AdminReviewPage /> },
            { path: "coupons", element: <AdminCouponPage /> },
            { path: "categories", element: <AdminCategoryPage /> },
            { path: "news", element: <AdminNewsPage /> },
            { path: "news/create", element: <AdminNewsCreate /> },
            { path: "news/:id/edit", element: <AdminNewsEdit /> },
            { path: "banners", element: <AdminBannerPage /> },
        ],
    },

    // ── 404 ───────────────────────────────────────────────
    { path: "*", element: <NotFoundPage /> },
]);
