import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("AI availability contract", () => {
  it("exposes public AI feature availability from backend settings", () => {
    const routes = read("D:/AppleStoreMini_Api/src/routes/index.js");

    assert.match(routes, /router\.get\("\/chat\/health", async/);
    assert.match(routes, /appSettingService\.getAiSettings/);
    assert.match(routes, /aiEnabled: aiOnline && settings\.enabled/);
    assert.match(routes, /features: settings\.features/);
    assert.match(routes, /model: settings\.modelName/);
  });

  it("adds a shared AI health query for frontend feature gates", () => {
    const api = read("src/store/api/aiApi.js");
    const mocks = read("tests/utils/route-mocks.ts");

    assert.match(api, /aiHealth: builder\.query/);
    assert.match(api, /url: "\/chat\/health"/);
    assert.match(api, /useAiHealthQuery/);
    assert.match(mocks, /path === "\/chat\/health"/);
    assert.match(mocks, /adminAiSettings\.features/);
  });

  it("chatbox labels fallback support instead of AI when chat feature is unavailable", () => {
    const source = read("src/components/shared/ChatWidget.jsx");

    assert.match(source, /useAiHealthQuery/);
    assert.match(source, /chatAiAvailable/);
    assert.match(source, /features\?\.chat !== false/);
    assert.match(source, /Hỗ trợ tư vấn theo dữ liệu cửa hàng/);
    assert.match(source, /Trợ lý Apple Store/);
  });

  it("search page disables AI mode when the search feature is unavailable", () => {
    const searchPage = read("src/pages/SearchPage.jsx");
    const toggle = read("src/features/ai/AISearchToggle.jsx");

    assert.match(searchPage, /useAiHealthQuery/);
    assert.match(searchPage, /aiSearchAvailable/);
    assert.match(searchPage, /features\?\.search !== false/);
    assert.match(searchPage, /available=\{aiSearchAvailable\}/);
    assert.match(searchPage, /toast\.info\("Tìm kiếm AI đang tắt trong cấu hình admin"\)/);
    assert.match(toggle, /available = true/);
    assert.match(toggle, /Tìm kiếm AI đang tắt/);
  });
});
