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

test("heavy optional exporters are loaded dynamically", () => {
  const offenders = getSourceFiles("src").filter((file) =>
    /import\s+(?:\*\s+as\s+)?\w+\s+from\s+["']xlsx["']/.test(
      readFileSync(file, "utf8"),
    ),
  );

  assert.deepEqual(offenders, []);
});
