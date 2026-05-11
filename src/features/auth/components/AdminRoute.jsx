import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectHasAdminAccess } from "@/store/authSlice";
import { ROUTES } from "@/lib/constants";

export default function AdminRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const hasAdminAccess = useSelector(selectHasAdminAccess);

    // Chưa đăng nhập — về trang login
    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.ADMIN_LOGIN}
                state={{ from: ROUTES.ADMIN_DASHBOARD }}
                replace
            />
        );
    }

    // Đã đăng nhập nhưng không có quyền admin/staff — về trang chủ
    if (!hasAdminAccess) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return children ? children : <Outlet />;
}
