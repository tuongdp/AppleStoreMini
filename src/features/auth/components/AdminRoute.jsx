import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectHasAdminAccess } from "@/store/authSlice";
import { ROUTES } from "@/lib/constants";

export default function AdminRoute({ children }) {
    let location;
    try {
        location = useLocation();
    } catch (e) {
        location = { pathname: "/", search: "" };
    }
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const hasAdminAccess = useSelector(selectHasAdminAccess);

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.ADMIN_LOGIN}
                state={{ from: location.pathname + location.search }}
                replace
            />
        );
    }

    if (!hasAdminAccess) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return children ? children : <Outlet />;
}
