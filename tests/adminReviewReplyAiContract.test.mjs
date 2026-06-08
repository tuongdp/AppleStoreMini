import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin review AI reply suggestion contract", () => {
  it("adds a protected backend endpoint before dynamic review detail routes", () => {
    const routes = read("D:/AppleStoreMini_Api/src/routes/admin/review.routes.js");
    const controller = read("D:/AppleStoreMini_Api/src/controllers/productReview.controller.js");
    const service = read("D:/AppleStoreMini_Api/src/services/productReview.service.js");
    const settings = read("D:/AppleStoreMini_Api/src/services/appSetting.service.js");

    const sentimentIndex = routes.indexOf('router.get("/reviews/sentiment"');
    const suggestionIndex = routes.indexOf('router.post("/reviews/:id/reply-suggestion"');
    const detailIndex = routes.indexOf('router.get("/reviews/:id"');

    assert.ok(sentimentIndex > -1);
    assert.ok(suggestionIndex > -1);
    assert.ok(detailIndex > suggestionIndex);
    assert.ok(detailIndex > sentimentIndex);
    assert.match(routes, /router\.post\("\/reviews\/:id\/reply-suggestion", hasPermission\("comments", "update"\), reviewCtrl\.suggestReplyAdmin\)/);
    assert.match(controller, /suggestReplyAdmin/);
    assert.match(service, /suggestReviewReply/);
    assert.match(service, /buildReviewReplyFallback/);
    assert.match(service, /appSettingService\.getAiSettings/);
    assert.match(service, /createAiUsageLog/);
    assert.match(service, /features\?\.reviewReply/);
    assert.match(settings, /reviewReply: "AI_FEATURE_REVIEW_REPLY"/);
  });

  it("exposes AI reply suggestion in RTK Query and admin comment dialog", () => {
    const api = read("src/store/api/productReviewApi.js");
    const page = read("src/features/admin/components/comments/AdminCommentList.jsx");
    const aiSettings = read("src/features/admin/components/ai/AdminAiSettings.jsx");

    assert.match(api, /suggestReviewReply/);
    assert.match(api, /\/admin\/reviews\/\$\{reviewId\}\/reply-suggestion/);
    assert.match(api, /useSuggestReviewReplyMutation/);
    assert.match(page, /useSuggestReviewReplyMutation/);
    assert.match(page, /handleSuggestReply/);
    assert.match(page, /Gợi ý AI/);
    assert.match(page, /Sparkles/);
    assert.match(aiSettings, /reviewReply/);
    assert.match(aiSettings, /Gợi ý phản hồi đánh giá/);
  });

  it("mocks admin review AI reply suggestion for e2e flows", () => {
    const mocks = read("tests/utils/route-mocks.ts");
    const data = read("tests/utils/mock-data.ts");

    assert.match(data, /adminReviewReplySuggestion/);
    assert.match(data, /Cảm ơn bạn đã chia sẻ đánh giá/);
    assert.match(data, /reviewReply: true/);
    assert.match(mocks, /adminReviewReplySuggestion/);
    assert.match(mocks, /\/\^\\\/admin\\\/reviews\\\/\[\^\/\]\+\\\/reply-suggestion\$\/\.test\(path\)/);
  });
});
