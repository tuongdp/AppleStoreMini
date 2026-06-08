import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin AI management contract", () => {
  it("adds an admin-only AI configuration route and sidebar item", () => {
    const routes = read("src/routes.jsx");
    const layout = read("src/components/layout/AdminLayout.jsx");
    const breadcrumb = read("src/components/layout/admin/AdminBreadcrumb.jsx");

    assert.match(routes, /AdminAiSettings/);
    assert.match(routes, /path: "ai"/);
    assert.match(routes, /<AdminPermissionRoute adminOnly><AdminAiSettings \/><\/AdminPermissionRoute>/);
    assert.match(layout, /Bot/);
    assert.match(layout, /key: "ai"/);
    assert.match(layout, /href: "\/admin\/ai"/);
    assert.match(layout, /ai: "Cấu hình AI"/);
    assert.match(breadcrumb, /ai: "Cấu hình AI"/);
  });

  it("uses RTK Query endpoints for AI settings and connection test", () => {
    const api = read("src/store/api/adminAiApi.js");
    const baseApi = read("src/store/api/baseApi.js");

    assert.match(baseApi, /"AdminAI"/);
    assert.match(api, /getAdminAiSettings/);
    assert.match(api, /updateAdminAiSettings/);
    assert.match(api, /testAdminAiConnection/);
    assert.match(api, /\/admin\/ai\/settings/);
    assert.match(api, /\/admin\/ai\/test/);
    assert.match(api, /providesTags: \["AdminAI"\]/);
    assert.match(api, /invalidatesTags: \["AdminAI", "AIHealth"\]/);
  });

  it("renders a simple feature configuration UI without AI API CRUD wording", () => {
    const page = read("src/features/admin/components/ai/AdminAiSettings.jsx");

    assert.match(page, /useGetAdminAiSettingsQuery/);
    assert.match(page, /useUpdateAdminAiSettingsMutation/);
    assert.match(page, /useTestAdminAiConnectionMutation/);
    assert.match(page, /FEATURES/);
    assert.match(page, /Cấu hình AI/);
    assert.match(page, /Không thực hiện thêm, sửa hoặc xóa API AI/);
    assert.match(page, /Thông tin kỹ thuật/);
    assert.match(page, /\.env của backend/);
    assert.match(page, /GROQ_API_KEY/);
    assert.doesNotMatch(page, /id="ai-model"/);
    assert.doesNotMatch(page, /id="ai-max-tokens"/);
    assert.doesNotMatch(page, /id="ai-temperature"/);
    assert.doesNotMatch(page, /id="ai-timeout"/);
    [
      "chat",
      "search",
      "recommend",
      "compare",
      "reviewSummary",
      "generateDescription",
      "sentiment",
      "personalized",
      "contentCheck",
    ].forEach((key) => assert.match(page, new RegExp(key)));
    assert.match(page, /aria-label="Lưu cấu hình AI"/);
    assert.match(page, /aria-label="Test kết nối AI"/);
  });

  it("mocks admin AI settings endpoints for e2e flows", () => {
    const mocks = read("tests/utils/route-mocks.ts");
    const data = read("tests/utils/mock-data.ts");

    assert.match(data, /adminAiSettings/);
    assert.match(data, /provider: "Groq"/);
    assert.match(data, /features: \{/);
    assert.match(mocks, /path === "\/admin\/ai\/settings"/);
    assert.match(mocks, /path === "\/admin\/ai\/test"/);
  });

  it("adds backend admin AI routes and read-only provider settings", () => {
    const adminRoutes = read("D:/AppleStoreMini_Api/src/routes/admin.routes.js");
    const aiRoutes = read("D:/AppleStoreMini_Api/src/routes/admin/ai.routes.js");
    const controller = read("D:/AppleStoreMini_Api/src/controllers/admin/ai.controller.js");
    const service = read("D:/AppleStoreMini_Api/src/services/appSetting.service.js");
    const chatController = read("D:/AppleStoreMini_Api/src/controllers/chat.controller.js");
    const aiConfig = read("D:/AppleStoreMini_Api/src/config/ai.js");

    assert.match(adminRoutes, /admin\/ai\.routes/);
    assert.match(aiRoutes, /router\.get\("\/ai\/settings", adminOnly, aiCtrl\.getSettings\)/);
    assert.match(aiRoutes, /router\.put\("\/ai\/settings", adminOnly, aiCtrl\.updateSettings\)/);
    assert.match(aiRoutes, /router\.post\("\/ai\/test", adminOnly, aiCtrl\.testConnection\)/);
    assert.match(controller, /getAiSettings/);
    assert.match(controller, /updateAiSettings/);
    assert.match(controller, /testAiConnection/);
    assert.match(service, /AI_SETTING_KEYS/);
    assert.match(service, /getAiSettings/);
    assert.match(service, /updateAiSettings/);
    assert.doesNotMatch(service, /setStringSetting\(AI_SETTING_KEYS\.modelName/);
    assert.doesNotMatch(service, /setNumberSetting\(AI_SETTING_KEYS\.maxTokens/);
    assert.doesNotMatch(service, /setDecimalSetting\(AI_SETTING_KEYS\.temperature/);
    assert.doesNotMatch(service, /setNumberSetting\(AI_SETTING_KEYS\.timeoutMs/);
    assert.match(aiConfig, /process\.env\.GROQ_API_KEY/);
    assert.match(aiConfig, /process\.env\.AI_MODEL_NAME/);
    assert.match(aiConfig, /AI_TIMEOUT_MS/);
    assert.match(aiConfig, /AI_MAX_TOKENS/);
    assert.match(aiConfig, /AI_TEMPERATURE/);
    assert.match(chatController, /appSettingService\.getAiSettings/);
    assert.match(chatController, /settings\.features\?\.\[featureKey\]/);
    assert.match(chatController, /callAI\([\s\S]*"recommend"\)/);
    assert.match(chatController, /callAI\([\s\S]*"contentCheck"\)/);
  });

  it("documents AI environment variables for setup and graduation report", () => {
    const readme = read("README.md");
    const envExample = read("D:/AppleStoreMini_Api/.env.example");

    [
      "GROQ_API_KEY",
      "AI_MODEL_NAME",
      "AI_MAX_TOKENS",
      "AI_TEMPERATURE",
      "AI_TIMEOUT_MS",
    ].forEach((key) => {
      assert.match(readme, new RegExp(key));
      assert.match(envExample, new RegExp(key));
    });

    assert.match(readme, /restart backend/);
    assert.match(readme, /Cấu hình AI/);
  });
});
