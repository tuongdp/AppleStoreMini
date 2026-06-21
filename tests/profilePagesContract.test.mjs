import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("profile layout marks private profile routes noindex", () => {
  const source = read("src/components/layout/ProfileLayout.jsx");

  assert.match(source, /<SeoHead title=\{currentLabel\} url=\{pathname\} noindex \/>/);
});

test("change password visibility buttons are keyboard accessible", () => {
  const source = read("src/features/profile/components/ChangePasswordForm.jsx");

  assert.match(source, /aria-label=\{show \? "Ẩn mật khẩu" : "Hiện mật khẩu"\}/);
  assert.doesNotMatch(source, /tabIndex=\{-1\}/);
});

test("profile pagination controls use lucide chevrons", () => {
  const orderHistory = read("src/pages/OrderHistoryPage.jsx");

  assert.match(orderHistory, /ChevronLeft/);
  assert.match(orderHistory, /ChevronRight/);
});
