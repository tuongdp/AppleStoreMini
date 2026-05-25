import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("navbar actions expose visible tooltip labels for icon-only buttons", () => {
  const navbar = readFileSync("src/components/layout/root/Navbar.jsx", "utf8");
  const userMenu = readFileSync("src/components/layout/root/NavbarUserMenu.jsx", "utf8");
  const cartButton = readFileSync("src/components/layout/root/NavbarCartButton.jsx", "utf8");
  const themeToggle = readFileSync("src/components/shared/ThemeToggle.jsx", "utf8");
  const tooltip = readFileSync("src/components/ui/tooltip.jsx", "utf8");

  assert.match(tooltip, /TooltipPrimitive/);
  assert.match(navbar, /TooltipProvider/);
  assert.match(navbar, /Tìm kiếm/);
  assert.match(userMenu, /Đăng nhập/);
  assert.match(userMenu, /Tài khoản/);
  assert.match(cartButton, /Giỏ hàng/);
  assert.match(themeToggle, /TooltipProvider/);
  assert.match(themeToggle, /Giao diện/);
});
