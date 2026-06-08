import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("AI feature gates contract", () => {
  it("centralizes AI feature availability checks", () => {
    const source = read("src/features/ai/useAiFeatureAvailable.js");

    assert.match(source, /useAiHealthQuery/);
    assert.match(source, /featureKey/);
    assert.match(source, /aiHealth\.features\?\.\[featureKey\] !== false/);
    assert.match(source, /available/);
  });

  it("hides product AI panels when their feature is disabled", () => {
    const compare = read("src/features/ai/AIComparePanel.jsx");
    const review = read("src/features/ai/AIReviewSummary.jsx");
    const recommend = read("src/features/ai/AIRecommendation.jsx");
    const personalized = read("src/features/products/PersonalizedRecommendations.jsx");

    assert.match(compare, /useAiFeatureAvailable\("compare"\)/);
    assert.match(compare, /if \(!aiAvailable\) return null/);
    assert.match(review, /useAiFeatureAvailable\("reviewSummary"\)/);
    assert.match(review, /if \(!aiAvailable\) return null/);
    assert.match(recommend, /useAiFeatureAvailable\("recommend"\)/);
    assert.match(recommend, /if \(!aiAvailable\) return null/);
    assert.match(personalized, /useAiFeatureAvailable\("personalized"\)/);
    assert.match(personalized, /enabled && aiAvailable/);
  });

  it("disables admin AI description generation when the feature is disabled", () => {
    const source = read("src/features/admin/components/products/AIDescriptionButton.jsx");

    assert.match(source, /useAiFeatureAvailable\("generateDescription"\)/);
    assert.match(source, /aiAvailable/);
    assert.match(source, /disabled=\{isLoading \|\| !productName \|\| !aiAvailable\}/);
    assert.match(source, /AI đang tắt/);
    assert.match(source, /Không thể tạo mô tả vì AI đang tắt trong cấu hình admin/);
  });
});
