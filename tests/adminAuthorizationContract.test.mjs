import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin authorization boundary", () => {
  it("keeps admin side menu complete and does not hide modules by frontend permissions", () => {
    const layout = read("src/components/layout/AdminLayout.jsx");

    assert.match(layout, /const visibleItems = NAV_ITEMS;/);
    assert.doesNotMatch(layout, /NAV_ITEMS\.filter/);
    assert.doesNotMatch(layout, /hasPermissionAction/);
    assert.doesNotMatch(layout, /selectUserPermissions/);
    assert.doesNotMatch(layout, /item\.adminOnly && !isAdmin/);
    assert.match(layout, /key: "settings"/);
    assert.match(layout, /key: "ai"/);
    assert.match(layout, /key: "options"/);
  });

  it("does not redirect admin pages by module permission on the frontend", () => {
    const guard = read("src/features/auth/components/AdminPermissionRoute.jsx");
    const routes = read("src/routes.jsx");

    assert.match(routes, /AdminPermissionRoute/);
    assert.match(guard, /<Outlet \/>/);
    assert.doesNotMatch(guard, /Navigate/);
    assert.doesNotMatch(guard, /selectHasPermission/);
    assert.doesNotMatch(guard, /selectIsAdmin/);
    assert.doesNotMatch(guard, /ROUTES\.ADMIN_DASHBOARD/);
  });

  it("enforces admin permissions at the backend API boundary", () => {
    const adminRoutes = read("D:/AppleStoreMini_Api/src/routes/admin.routes.js");
    const middleware = read("D:/AppleStoreMini_Api/src/middlewares/admin.middleware.js");
    const productRoutes = read("D:/AppleStoreMini_Api/src/routes/admin/product.routes.js");
    const orderRoutes = read("D:/AppleStoreMini_Api/src/routes/admin/order.routes.js");
    const dashboardRoutes = read("D:/AppleStoreMini_Api/src/routes/admin/dashboard.routes.js");
    const userRoutes = read("D:/AppleStoreMini_Api/src/routes/admin/user.routes.js");

    assert.match(adminRoutes, /router\.use\(protect, staffOrAdmin\)/);
    assert.match(middleware, /req\.user\?\.role !== "admin" && req\.user\?\.role !== "staff"/);
    assert.match(middleware, /new ApiError\(403, "Không có quyền truy cập"\)/);
    assert.match(middleware, /canAccessPermission\(role, permissions, permission, action\)/);
    assert.match(middleware, /new ApiError\(403, "Không có quyền truy cập tính năng này"\)/);

    assert.match(productRoutes, /hasPermission\("products", "view"\)/);
    assert.match(productRoutes, /hasPermission\("products", "create"\)/);
    assert.match(productRoutes, /hasPermission\("products", "update"\)/);
    assert.match(orderRoutes, /hasPermission\("orders", "view"\)/);
    assert.match(orderRoutes, /hasPermission\("returns", "view"\)/);
    assert.match(dashboardRoutes, /hasPermission\("dashboard", "view"\)/);
    assert.match(userRoutes, /hasPermission\("users", "view"\)/);
  });
});
