import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectHasPermission, selectIsAdmin } from "@/store/authSlice";
import { ROUTES } from "@/lib/constants";

export default function AdminPermissionRoute({
    permission,
    action = "view",
    adminOnly = false,
    children,
}) {
    const isAdmin = useSelector(selectIsAdmin);
    const hasPermission = useSelector(
        permission ? selectHasPermission(permission, action) : () => true,
    );

    const allowed = adminOnly ? isAdmin : isAdmin || hasPermission;

    if (!allowed) {
        return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }

    return children ? children : <Outlet />;
}
