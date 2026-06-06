import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin global options contract", () => {
  it("normalizes legacy object options and array option payloads", () => {
    const source = read("src/store/api/globalOptionsApi.js");

    assert.match(source, /const LEGACY_OPTION_TYPES/);
    assert.match(source, /colors: "COLOR"/);
    assert.match(source, /storages: "STORAGE"/);
    assert.match(source, /const normalizeOptions/);
    assert.match(source, /Array\.isArray\(data\)/);
    assert.match(source, /options\.filter\(\(option\) => option\.type === type\)/);
    assert.match(source, /option\?\._id \|\| option\?\.id/);
  });

  it("keeps admin options page accessible and id-safe", () => {
    const source = read("src/pages/admin/AdminGlobalOptionsPage.jsx");

    assert.match(source, /const getOptionId/);
    assert.match(source, /const \{ data: options = \[\], isLoading, isFetching \} = useGetGlobalOptionsQuery\(activeTab\)/);
    assert.match(source, /name="admin-option-value"/);
    assert.match(source, /name="admin-options-search"/);
    assert.match(source, /autoComplete="off"/);
    assert.match(source, /isLoading \|\| isFetching/);
    assert.match(source, /const optionId = getOptionId\(option\)/);
    assert.match(source, /<Plus[^>]+aria-hidden="true"/);
    assert.match(source, /<Search[^>]+aria-hidden="true"/);
    assert.match(source, /<Eye[^>]+aria-hidden="true"/);
    assert.match(source, /<EyeOff[^>]+aria-hidden="true"/);
    assert.match(source, /<Trash2[^>]+aria-hidden="true"/);
  });

  it("mocks list, create, update, and delete global option routes", () => {
    const mocks = read("tests/utils/route-mocks.ts");
    const data = read("tests/utils/mock-data.ts");

    assert.match(data, /export const globalOptions =/);
    assert.match(data, /export const globalOptionsList =/);
    assert.match(mocks, /globalOptionsList/);
    assert.match(mocks, /method === "POST"/);
    assert.match(mocks, /url\.searchParams\.get\("type"\)/);
    assert.match(mocks, /\^\\\/admin\\\/global-options\\\/\[\^\/\]\+\$/);
    assert.match(mocks, /method === "PUT"/);
    assert.match(mocks, /method === "DELETE"/);
  });
});
