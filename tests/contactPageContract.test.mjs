import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/pages/ContactPage.jsx", "utf8");

test("contact form sends through the contact API instead of mailto", () => {
  assert.match(source, /const CONTACT_EMAIL = "phuctuong123456@gmail\.com"/);
  assert.match(source, /useSendContactMessageMutation/);
  assert.match(source, /await sendContactMessage\(values\)\.unwrap\(\)/);
  assert.match(source, /toast\.success\("Gửi thành công!/);
  assert.doesNotMatch(source, /window\.location\.href = `mailto:/);
});

test("contact page tells users where their message goes", () => {
  assert.match(source, /Thông tin sẽ được gửi tự động tới email hỗ trợ/);
});
