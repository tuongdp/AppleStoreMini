import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const footerSource = readFileSync("src/components/layout/root/Footer.jsx", "utf8");
const hookSource = readFileSync("src/hooks/usePublicSettings.js", "utf8");
const apiSource = readFileSync("src/store/api/shopSettingsApi.js", "utf8");

test("footer product links reuse configured storefront categories", () => {
  assert.match(footerSource, /CATEGORIES\.map/);
  assert.doesNotMatch(footerSource, /category=airpods/);
});

test("footer does not expose personal fallback social profiles", () => {
  assert.doesNotMatch(footerSource, /facebook\.com\/Pseidon/i);
  assert.doesNotMatch(footerSource, /instagram\.com\/dotuong/i);
  assert.doesNotMatch(footerSource, /youtube\.com\/@phuctuongo44/i);
});

test("footer renders contact channels from shop settings when present", () => {
  assert.match(footerSource, /tel:/);
  assert.match(footerSource, /mailto:/);
  assert.match(footerSource, /formatPhone/);
});

test("footer social links render brand icons with labels", () => {
  assert.match(footerSource, /function FacebookIcon/);
  assert.match(footerSource, /function ZaloIcon/);
  assert.match(footerSource, /function TikTokIcon/);
  assert.match(footerSource, /function YouTubeIcon/);
  assert.match(footerSource, /<social\.icon/);
  assert.match(footerSource, /chưa được cấu hình/);
  assert.doesNotMatch(footerSource, /socialLinks\s*=\s*\[[^\]]*\]\.filter/s);
});

test("footer settings use the public settings endpoint", () => {
  assert.match(apiSource, /getPublicSettings/);
  assert.match(apiSource, /\/settings\/public/);
  assert.match(hookSource, /useGetPublicSettingsQuery/);
  assert.doesNotMatch(hookSource, /selectIsAdmin/);
});
