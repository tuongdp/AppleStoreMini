import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin AI logs contract", () => {
  it("defines a Prisma AI usage log model without storing prompt content", () => {
    const schema = read("D:/AppleStoreMini_Api/prisma/schema.prisma");

    assert.match(schema, /model AiUsageLog/);
    assert.match(schema, /feature\s+String/);
    assert.match(schema, /status\s+String/);
    assert.match(schema, /latencyMs\s+Int\?/);
    assert.match(schema, /modelName\s+String\?/);
    assert.match(schema, /errorMessage\s+String\?/);
    assert.match(schema, /userId\s+String\?/);
    assert.match(schema, /@@map\("ai_usage_logs"\)/);
    assert.doesNotMatch(schema, /prompt|messageContent|responseContent/);
  });

  it("adds backend AI log service and admin routes", () => {
    const service = read("D:/AppleStoreMini_Api/src/services/aiUsageLog.service.js");
    const controller = read("D:/AppleStoreMini_Api/src/controllers/admin/ai.controller.js");
    const routes = read("D:/AppleStoreMini_Api/src/routes/admin/ai.routes.js");
    const chatController = read("D:/AppleStoreMini_Api/src/controllers/chat.controller.js");

    assert.match(service, /createAiUsageLog/);
    assert.match(service, /listAiUsageLogs/);
    assert.match(service, /feature/);
    assert.match(service, /status/);
    assert.match(service, /take: safeLimit/);
    assert.match(controller, /getLogs/);
    assert.match(routes, /router\.get\("\/ai\/logs", adminOnly, aiCtrl\.getLogs\)/);
    assert.match(chatController, /aiUsageLogService\.createAiUsageLog/);
    assert.match(chatController, /status: "SUCCESS"/);
    assert.match(chatController, /status: "ERROR"/);
    assert.match(chatController, /status: "DISABLED"/);
  });

  it("adds RTK Query support and mocks for AI logs", () => {
    const api = read("src/store/api/adminAiApi.js");
    const baseApi = read("src/store/api/baseApi.js");
    const mocks = read("tests/utils/route-mocks.ts");
    const data = read("tests/utils/mock-data.ts");

    assert.match(baseApi, /"AdminAILogs"/);
    assert.match(api, /getAdminAiLogs/);
    assert.match(api, /\/admin\/ai\/logs/);
    assert.match(api, /providesTags: \["AdminAILogs"\]/);
    assert.match(data, /adminAiLogs/);
    assert.match(mocks, /path === "\/admin\/ai\/logs"/);
  });

  it("renders AI logs in the admin AI settings page", () => {
    const page = read("src/features/admin/components/ai/AdminAiSettings.jsx");

    assert.match(page, /useGetAdminAiLogsQuery/);
    assert.match(page, /Nhật ký AI/);
    assert.match(page, /Trạng thái/);
    assert.match(page, /Feature/);
    assert.match(page, /Latency/);
    assert.match(page, /ERROR/);
    assert.match(page, /DISABLED/);
  });
});
