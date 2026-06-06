import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("news listing keeps search filters in the URL and SEO canonical", () => {
  const source = read("src/pages/NewsPage.jsx");

  assert.match(source, /params\.set\("q", nextSearch\)/);
  assert.match(source, /params\.delete\("q"\)/);
  assert.match(source, /const canonicalPath = `\/news/);
  assert.match(source, /url=\{canonicalPath\}/);
});

test("news detail asks the API for popular sidebar posts", () => {
  const source = read("src/pages/NewsDetailPage.jsx");

  assert.match(source, /useGetNewsQuery\(\{ limit: 5, sort: "popular" \}\)/);
  assert.doesNotMatch(source, /\.sort\(\(a, b\) => \(b\.viewCount/);
  assert.match(source, /news\.author \|\| news\.authorUser\?\.fullName/);
});

test("news e2e mocks public detail route with the same path as the backend", () => {
  const source = read("tests/utils/route-mocks.ts");

  assert.match(source, /\^\\\/news\\\/\[\^\/\]\+\$/);
  assert.match(source, /api\\\/news\\\/\[\^\/\?\]\+\$/);
  assert.doesNotMatch(source, /\/news\\\/slug/);
});
