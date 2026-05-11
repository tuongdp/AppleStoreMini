import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import LoadingScreen from "@/components/shared/LoadingScreen";

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

// Eager-loaded pages (critical path)
import NotFoundPage from "@/pages/NotFoundPage";
import ErrorPage from "@/pages/ErrorPage";

const Lazy = (importFn) => {
    const Component = lazy(importFn);
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Component />
        </Suspense>
    );
};

// Pages — public (lazy)
const HomePage = () => Lazy(() => import("@/pages/HomePage"));
const ProductListPage = () => Lazy(() => import("@/pages/ProductListPage"));
const ProductDetailPage = () => Lazy(() => import("@/pages/ProductDetailPage"));
const CartPage = () => Lazy(() => import("@/pages/CartPage"));
const SearchPage = () => Lazy(() => import("@/pages/SearchPage"));
const WishlistPage = () => Lazy(() => import("@/pages/WishlistPage"));
const AboutPage = () => Lazy(() => import("@/pages/AboutPage"));
const ContactPage = () => Lazy(() => import("@/pages/ContactPage"));
const WarrantyPage = () => Lazy(() => import("@/pages/WarrantyPage"));
const ReturnPolicyPage = () => Lazy(() => import("@/pages/ReturnPolicyPage"));
const PrivacyPage = () => Lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = () => Lazy(() => import("@/pages/TermsPage"));
const AppleCarePage = () => Lazy(() => import("@/pages/AppleCarePage"));
const NewsPage = () => Lazy(() => import("@/pages/NewsPage"));
const NewsDetailPage = () => Lazy(() => import("@/pages/NewsDetailPage"));

// Pages — auth (lazy)
const LoginPage = () => Lazy(() => import("@/pages/LoginPage"));
const RegisterPage = () => Lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = () => Lazy(() => import("@/pages/ForgotPasswordPage"));
const ChangePasswordPage = () => Lazy(() => import("@/pages/ChangePasswordPage"));
const ResetPasswordPage = () => Lazy(() => import("@/pages/ResetPasswordPage"));
const VerifyEmailPage = () => Lazy(() => import("@/pages/VerifyEmailPage"));

// Pages — checkout (lazy)
const CheckoutPage = () => Lazy(() => import("@/pages/CheckoutPage"));

// Pages — profile (lazy)
const ProfilePage = () => Lazy(() => import("@/pages/ProfilePage"));
const OrderHistoryPage = () => Lazy(() => import("@/pages/OrderHistoryPage"));
const OrderDetailPage = () => Lazy(() => import("@/pages/OrderDetailPage"));
const PointsPage = () => Lazy(() => import("@/pages/PointsPage"));
const PaymentResult = ({ status }) => {
    const Component = lazy(() => import("@/pages/PaymentResult"));
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Component status={status} />
        </Suspense>
    );
};

// Pages — admin (lazy)
const AdminLoginPage = () => Lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminDashboard = () => Lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProductList = () => Lazy(() => import("@/pages/admin/AdminProductList"));
const AdminProductCreate = () => Lazy(() => import("@/pages/admin/AdminProductCreate"));
const AdminProductEdit = () => Lazy(() => import("@/pages/admin/AdminProductEdit"));
const AdminOrderList = () => Lazy(() => import("@/pages/admin/AdminOrderList"));
const AdminOrderDetail = () => Lazy(() => import("@/pages/admin/AdminOrderDetail"));
const AdminUserList = () => Lazy(() => import("@/pages/admin/AdminUserList"));
const AdminUserDetail = () => Lazy(() => import("@/pages/admin/AdminUserDetail"));
const AdminCommentPage = () => Lazy(() => import("@/pages/admin/AdminCommentPage"));
const AdminNewsCommentPage = () => Lazy(() => import("@/pages/admin/AdminNewsCommentPage"));
const AdminCouponPage = () => Lazy(() => import("@/pages/admin/AdminCouponPage"));
const AdminCategoryPage = () => Lazy(() => import("@/pages/admin/AdminCategoryPage"));
const AdminNewsPage = () => Lazy(() => import("@/pages/admin/AdminNewsPage"));
const AdminNewsCreate = () => Lazy(() => import("@/pages/admin/AdminNewsCreate"));
const AdminNewsEdit = () => Lazy(() => import("@/pages/admin/AdminNewsEdit"));
const AdminBannerPage = () => Lazy(() => import("@/pages/admin/AdminBannerPage"));
const AdminFlashSalePage = () => Lazy(() => import("@/pages/admin/AdminFlashSalePage"));
const AdminGlobalOptionsPage = () => Lazy(() => import("@/pages/admin/AdminGlobalOptionsPage"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
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
            { path: "apple-care", element: <AppleCarePage /> },
            { path: "news", element: <NewsPage /> },
            { path: "news/:slug", element: <NewsDetailPage /> },
            { path: "verify-email", element: <VerifyEmailPage /> },
            { path: "payment/success", element: <PaymentResult status="success" /> },
            { path: "payment/fail", element: <PaymentResult status="fail" /> },

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
                    { path: "change-password", element: <ChangePasswordPage /> },
                    { path: "points", element: <PointsPage /> },
                ],
            },
        ],
    },

    {
        element: <AuthLayout />,
        children: [
            {
                path: "login",
                element: <GuestRoute><LoginPage /></GuestRoute>,
            },
            {
                path: "register",
                element: <GuestRoute><RegisterPage /></GuestRoute>,
            },
            {
                path: "forgot-password",
                element: <GuestRoute><ForgotPasswordPage /></GuestRoute>,
            },
            {
                path: "reset-password/:token",
                element: <ResetPasswordPage />,
            },
        ],
    },

    {
        element: (
            <ProtectedRoute>
                <CheckoutLayout />
            </ProtectedRoute>
        ),
        children: [{ path: "checkout", element: <CheckoutPage /> }],
    },

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
            { path: "comments", element: <AdminCommentPage /> },
            { path: "news-comments", element: <AdminNewsCommentPage /> },
            { path: "coupons", element: <AdminCouponPage /> },
            { path: "categories", element: <AdminCategoryPage /> },
            { path: "news", element: <AdminNewsPage /> },
            { path: "news/create", element: <AdminNewsCreate /> },
            { path: "news/:slug/edit", element: <AdminNewsEdit /> },
            { path: "banners", element: <AdminBannerPage /> },
            { path: "flash-sales", element: <AdminFlashSalePage /> },
            { path: "options", element: <AdminGlobalOptionsPage /> },
        ],
    },

    { path: "*", element: <NotFoundPage /> },
]);
