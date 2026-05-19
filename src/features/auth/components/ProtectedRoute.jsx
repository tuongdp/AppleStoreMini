import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/authSlice";
import { ROUTES } from "@/lib/constants";

export default function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        // Lưu lại URL hiện tại để sau khi đăng nhập redirect về đúng chỗ
        return (
            <Navigate
                to={ROUTES.LOGIN}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    // Hỗ trợ cả 2 cách dùng:
    // 1. <ProtectedRoute><SomeLayout /></ProtectedRoute>
    // 2. element: <ProtectedRoute /> với children là Outlet
    return children ? children : <Outlet />;
}
