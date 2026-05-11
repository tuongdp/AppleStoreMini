import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectIsAuthenticated, selectHasAdminAccess } from "@/store/authSlice";
import { ROUTES } from "@/lib/constants";

export default function AdminRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const hasAdminAccess = useSelector(selectHasAdminAccess);

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.ADMIN_LOGIN}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    if (!hasAdminAccess) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return children ? children : <Outlet />;
}
