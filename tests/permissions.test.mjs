import assert from "node:assert/strict";
import test from "node:test";

import {
  hasPermissionAction,
  normalizePermissions,
} from "../src/store/authSlice.js";

test("legacy module permissions grant all CRUD actions in frontend selectors", () => {
  const permissions = normalizePermissions(["products"]);

  assert.equal(hasPermissionAction(permissions, "products", "view"), true);
  assert.equal(hasPermissionAction(permissions, "products", "create"), true);
  assert.equal(hasPermissionAction(permissions, "products", "update"), true);
  assert.equal(hasPermissionAction(permissions, "products", "delete"), true);
});

test("action permissions only grant exact action", () => {
  const permissions = normalizePermissions(["products:view", "products:update"]);

  assert.equal(hasPermissionAction(permissions, "products", "view"), true);
  assert.equal(hasPermissionAction(permissions, "products", "create"), false);
  assert.equal(hasPermissionAction(permissions, "orders", "view"), false);
});
