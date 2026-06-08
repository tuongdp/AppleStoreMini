import { Outlet } from "react-router-dom";

export default function AdminPermissionRoute({
    children,
}) {
    return children ? children : <Outlet />;
}
