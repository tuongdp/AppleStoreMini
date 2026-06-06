import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("React app entrypoint uses StrictMode", () => {
  const main = readFileSync("src/main.jsx", "utf8");

  assert.match(main, /<React\.StrictMode>/);
  assert.match(main, /<\/React\.StrictMode>/);
});

test("ImageLightbox tolerates missing image arrays", () => {
  const lightbox = readFileSync("src/components/shared/ImageLightbox.jsx", "utf8");

  assert.match(lightbox, /images\s*=\s*\[\]/);
});

test("Redux dev invariant middleware has a test-friendly warning threshold", () => {
  const store = readFileSync("src/store/index.js", "utf8");

  assert.match(store, /immutableCheck:\s*\{[\s\S]*warnAfter:\s*128/);
  assert.match(store, /serializableCheck:\s*\{[\s\S]*warnAfter:\s*128/);
});
