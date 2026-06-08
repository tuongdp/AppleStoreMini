import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin AI operational insights contract", () => {
  it("adds a protected backend dashboard endpoint backed by an AI insights service", () => {
    const routes = read("D:/AppleStoreMini_Api/src/routes/admin/dashboard.routes.js");
    const controller = read("D:/AppleStoreMini_Api/src/controllers/admin/dashboard.controller.js");
    const service = read("D:/AppleStoreMini_Api/src/services/adminAiInsight.service.js");
    const settings = read("D:/AppleStoreMini_Api/src/services/appSetting.service.js");

    assert.match(routes, /router\.get\("\/dashboard\/ai-insights", hasPermission\("dashboard", "view"\), dashboardCtrl\.getAiInsights\)/);
    assert.match(controller, /adminAiInsightService/);
    assert.match(controller, /getAiInsights/);
    assert.match(service, /getAdminAiInsights/);
    assert.match(service, /buildRuleBasedInsights/);
    assert.match(service, /appSettingService\.getAiSettings/);
    assert.match(service, /createAiUsageLog/);
    assert.match(service, /AI_URL/);
    assert.match(service, /features\?\.adminInsights/);
    assert.match(settings, /adminInsights: "AI_FEATURE_ADMIN_INSIGHTS"/);
  });

  it("exposes the AI insights endpoint through RTK Query and dashboard UI", () => {
    const api = read("src/store/api/ordersApi.js");
    const dashboard = read("src/pages/admin/AdminDashboard.jsx");
    const widget = read("src/features/admin/components/dashboard/AdminAiInsights.jsx");
    const aiSettings = read("src/features/admin/components/ai/AdminAiSettings.jsx");

    assert.match(api, /getDashboardAiInsights/);
    assert.match(api, /\/admin\/dashboard\/ai-insights/);
    assert.match(api, /useGetDashboardAiInsightsQuery/);
    assert.match(dashboard, /AdminAiInsights/);
    assert.match(dashboard, /<AdminAiInsights \/>/);
    assert.match(widget, /useGetDashboardAiInsightsQuery/);
    assert.match(widget, /Gợi ý vận hành AI/);
    assert.match(widget, /Sparkles/);
    assert.match(widget, /Lightbulb/);
    assert.match(widget, /aiOnline/);
    assert.match(aiSettings, /adminInsights/);
    assert.match(aiSettings, /Gợi ý vận hành admin/);
  });

  it("mocks AI insights for dashboard e2e flows", () => {
    const mocks = read("tests/utils/route-mocks.ts");
    const data = read("tests/utils/mock-data.ts");

    assert.match(data, /dashboardAiInsights/);
    assert.match(data, /aiOnline: true/);
    assert.match(data, /Gợi ý vận hành AI/);
    assert.match(mocks, /dashboardAiInsights/);
    assert.match(mocks, /path === "\/admin\/dashboard\/ai-insights"/);
  });
});
