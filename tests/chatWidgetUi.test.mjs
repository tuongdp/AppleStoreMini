import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chatWidget = readFileSync("src/components/shared/ChatWidget.jsx", "utf8");
const aiComponents = [
  "src/features/ai/AISearchToggle.jsx",
  "src/features/ai/AIComparePanel.jsx",
  "src/features/ai/AIReviewSummary.jsx",
  "src/features/ai/AIRecommendation.jsx",
  "src/features/admin/components/products/AIDescriptionButton.jsx",
].map((file) => [file, readFileSync(file, "utf8")]);

test("chat widget hides the floating trigger while the dialog is open", () => {
  assert.match(chatWidget, /!\s*open\s*&&\s*\(/);
  assert.match(chatWidget, /aria-label="Mở chat"/);
  assert.match(chatWidget, /aria-label="Đóng chat"/);
});

test("chat dialog stacks above other floating controls", () => {
  assert.match(chatWidget, /z-60/);
  assert.match(chatWidget, /sm:bottom-6/);
});

test("AI feature buttons use contextual icons instead of generic sparkles", () => {
  for (const [file, source] of aiComponents) {
    assert.doesNotMatch(source, /Sparkles/, file);
  }
});
