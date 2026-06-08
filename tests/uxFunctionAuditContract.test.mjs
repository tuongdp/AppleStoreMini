import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("return deadline display uses configured return window", () => {
  const source = read("src/features/orders/components/OrderDetail.jsx");

  assert.match(source, /returnDeadline/);
  assert.match(source, /returnWindowDays \* 24 \* 60 \* 60 \* 1000/);
  assert.doesNotMatch(source, /\+ 7 \* 24 \* 60 \* 60 \* 1000/);
});

test("admin order status selector only exposes backend-valid transitions", () => {
  const source = read("src/features/admin/components/orders/AdminOrderStatusUpdate.jsx");

  assert.doesNotMatch(source, /ORDER_STATUS\.REFUNDING/);
  assert.match(source, /ORDER_STATUS\.CANCELLED/);
});

test("google login button is disabled when client id is missing", () => {
  const source = read("src/features/auth/components/SocialLoginButtons.jsx");

  assert.match(source, /!hasGoogleClientId \? "Chưa cấu hình Google"/);
  assert.match(source, /disabled=\{!hasGoogleClientId \|\| isGoogleLoginLoading \|\| !isGoogleReady\}/);
});

test("chat product recommendations use links for navigation", () => {
  const source = read("src/components/shared/ChatWidget.jsx");

  assert.match(source, /import \{ Link \} from "react-router-dom"/);
  assert.match(source, /to=\{`\/products\/\$\{product\.slug\}`\}/);
  assert.doesNotMatch(source, /onClick=\{\(\) => navigate\(`\/products\/\$\{product\.slug\}`\)\}/);
});

test("search page keeps pagination and AI mode in the URL", () => {
  const source = read("src/pages/SearchPage.jsx");

  assert.match(source, /const page = Number\(searchParams\.get\("page"\)\) \|\| 1/);
  assert.match(source, /const aiMode = searchParams\.get\("ai"\) === "1"/);
  assert.match(source, /const handleAiModeChange = \(enabled\) =>/);
  assert.match(source, /params\.set\("page", String\(nextPage\)\)/);
  assert.doesNotMatch(source, /const \[page, setPage\] = useState\(1\)/);
});
