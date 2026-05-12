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

const lazyPage = (importFn) => {
    const LazyComponent = lazy(importFn);
    return function PageWrapper(props) {
        return (
            <Suspense fallback={<LoadingScreen />}>
                <LazyComponent {...props} />
            </Suspense>
        );
    };
};

// Pages — public
const HomePage = lazyPage(() => import("@/pages/HomePage"));
const ProductListPage = lazyPage(() => import("@/pages/ProductListPage"));
const ProductDetailPage = lazyPage(() => import("@/pages/ProductDetailPage"));
const CartPage = lazyPage(() => import("@/pages/CartPage"));
const SearchPage = lazyPage(() => import("@/pages/SearchPage"));
const WishlistPage = lazyPage(() => import("@/pages/WishlistPage"));
const AboutPage = lazyPage(() => import("@/pages/AboutPage"));
const ContactPage = lazyPage(() => import("@/pages/ContactPage"));
const WarrantyPage = lazyPage(() => import("@/pages/WarrantyPage"));
const ReturnPolicyPage = lazyPage(() => import("@/pages/ReturnPolicyPage"));
const PrivacyPage = lazyPage(() => import("@/pages/PrivacyPage"));
const TermsPage = lazyPage(() => import("@/pages/TermsPage"));
const AppleCarePage = lazyPage(() => import("@/pages/AppleCarePage"));
const NewsPage = lazyPage(() => import("@/pages/NewsPage"));
const NewsDetailPage = lazyPage(() => import("@/pages/NewsDetailPage"));

// Pages — auth
const LoginPage = lazyPage(() => import("@/pages/LoginPage"));
const RegisterPage = lazyPage(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazyPage(() => import("@/pages/ForgotPasswordPage"));
const ChangePasswordPage = lazyPage(() => import("@/pages/ChangePasswordPage"));
const ResetPasswordPage = lazyPage(() => import("@/pages/ResetPasswordPage"));
const VerifyEmailPage = lazyPage(() => import("@/pages/VerifyEmailPage"));

// Pages — checkout
const CheckoutPage = lazyPage(() => import("@/pages/CheckoutPage"));

// Pages — profile
const ProfilePage = lazyPage(() => import("@/pages/ProfilePage"));
const OrderHistoryPage = lazyPage(() => import("@/pages/OrderHistoryPage"));
const OrderDetailPage = lazyPage(() => import("@/pages/OrderDetailPage"));
const PointsPage = lazyPage(() => import("@/pages/PointsPage"));
const MyCouponsPage = lazyPage(() => import("@/pages/MyCouponsPage"));
const PaymentResult = lazyPage(() => import("@/pages/PaymentResult"));

// Pages — admin
const AdminLoginPage = lazyPage(() => import("@/pages/admin/AdminLoginPage"));
const AdminDashboard = lazyPage(() => import("@/pages/admin/AdminDashboard"));
const AdminProductList = lazyPage(() => import("@/pages/admin/AdminProductList"));
const AdminProductCreate = lazyPage(() => import("@/pages/admin/AdminProductCreate"));
const AdminProductEdit = lazyPage(() => import("@/pages/admin/AdminProductEdit"));
const AdminOrderList = lazyPage(() => import("@/pages/admin/AdminOrderList"));
const AdminOrderDetail = lazyPage(() => import("@/pages/admin/AdminOrderDetail"));
const AdminUserList = lazyPage(() => import("@/pages/admin/AdminUserList"));
const AdminUserDetail = lazyPage(() => import("@/pages/admin/AdminUserDetail"));
const AdminCommentPage = lazyPage(() => import("@/pages/admin/AdminCommentPage"));
const AdminNewsCommentPage = lazyPage(() => import("@/pages/admin/AdminNewsCommentPage"));
const AdminCouponPage = lazyPage(() => import("@/pages/admin/AdminCouponPage"));
const AdminCategoryPage = lazyPage(() => import("@/pages/admin/AdminCategoryPage"));
const AdminNewsPage = lazyPage(() => import("@/pages/admin/AdminNewsPage"));
const AdminNewsCreate = lazyPage(() => import("@/pages/admin/AdminNewsCreate"));
const AdminNewsEdit = lazyPage(() => import("@/pages/admin/AdminNewsEdit"));
const AdminBannerPage = lazyPage(() => import("@/pages/admin/AdminBannerPage"));
const AdminFlashSalePage = lazyPage(() => import("@/pages/admin/AdminFlashSalePage"));
const AdminGlobalOptionsPage = lazyPage(() => import("@/pages/admin/AdminGlobalOptionsPage"));

// eslint-disable-next-line react-refresh/only-export-components
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
                    { path: "my-coupons", element: <MyCouponsPage /> },
                ],
            },
        ],
    },

    {
        element: <AuthLayout />,
        errorElement: <ErrorPage />,
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
        errorElement: <ErrorPage />,
        children: [{ path: "checkout", element: <CheckoutPage /> }],
    },

    {
        path: "admin/login",
        element: <AdminLoginPage />,
        errorElement: <ErrorPage />,
    },

    {
        path: "admin",
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        errorElement: <ErrorPage />,
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
