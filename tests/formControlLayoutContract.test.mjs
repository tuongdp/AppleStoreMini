import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("shared form controls shrink inside narrow flex and grid containers", () => {
  const input = read("src/components/ui/input.jsx");
  const textarea = read("src/components/ui/textarea.jsx");
  const select = read("src/components/ui/select.jsx");
  const searchableSelect = read("src/components/shared/SearchableSelect.jsx");

  assert.match(input, /w-full min-w-0/);
  assert.match(input, /max-w-full/);

  assert.match(textarea, /w-full min-w-0/);
  assert.match(textarea, /max-w-full/);
  assert.match(textarea, /resize-y/);
  assert.doesNotMatch(textarea, /field-sizing-content/);

  assert.match(select, /flex w-full min-w-0 max-w-full/);
  assert.match(select, /\*:data-\[slot=select-value\]:min-w-0/);

  assert.match(searchableSelect, /className=\{cn\("relative min-w-0 max-w-full"/);
  assert.match(searchableSelect, /className=\{cn\("min-w-0 flex-1 truncate/);
  assert.match(searchableSelect, /w-full min-w-0 max-w-full/);
});
