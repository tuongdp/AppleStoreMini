import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function getSourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) return getSourceFiles(path);
    return /\.(jsx?|tsx?)$/.test(entry) ? [path] : [];
  });
}

test("internal React Router links use SPA navigation", () => {
  const offenders = getSourceFiles("src").filter((file) =>
    /\breloadDocument\b/.test(readFileSync(file, "utf8")),
  );

  assert.deepEqual(offenders, []);
});
