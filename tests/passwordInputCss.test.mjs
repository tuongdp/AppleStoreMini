import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("custom password reveal buttons suppress Edge native reveal controls", () => {
  const css = readFileSync("src/index.css", "utf8");

  assert.match(css, /input\[type=["']password["']\]::-ms-reveal/);
  assert.match(css, /input\[type=["']password["']\]::-ms-clear/);
});
