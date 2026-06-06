import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin user management contract", () => {
  it("keeps user stats as a stats object", () => {
    const source = read("src/store/api/usersApi.js");
    const statsBlock = source.slice(
      source.indexOf("getUserStats: builder.query"),
      source.indexOf("// GET /admin/users/:id"),
    );

    assert.match(statsBlock, /transformResponse:\s*\(response\)\s*=>\s*response\.data/);
    assert.doesNotMatch(statsBlock, /normalizeProfileUser\(response\.data\)/);
  });

  it("shows refetch loading and disables export during user list fetches", () => {
    const source = read("src/features/admin/components/users/AdminUserTable.jsx");

    assert.match(source, /isLoading,\s*isFetching/);
    assert.match(source, /disabled=\{isLoading \|\| isFetching\}/);
    assert.match(source, /isLoading \|\| isFetching/);
  });

  it("uses icon-only pagination buttons with accessible labels", () => {
    const source = read("src/features/admin/components/users/AdminUserTable.jsx");

    assert.match(source, /aria-label="Trang trước"/);
    assert.match(source, /aria-label="Trang sau"/);
    assert.match(source, /<ChevronLeft[^>]+aria-hidden="true"/);
    assert.match(source, /<ChevronRight[^>]+aria-hidden="true"/);
  });

  it("mocks user action endpoints before the user detail route", () => {
    const source = read("tests/utils/route-mocks.ts");
    const roleIndex = source.indexOf('/^\\/admin\\/users\\/[^/]+\\/role$/.test(path)');
    const permissionIndex = source.indexOf('/^\\/admin\\/users\\/[^/]+\\/permissions$/.test(path)');
    const toggleIndex = source.indexOf('/^\\/admin\\/users\\/[^/]+\\/toggle$/.test(path)');
    const resetIndex = source.indexOf('/^\\/admin\\/users\\/[^/]+\\/reset-password$/.test(path)');
    const detailIndex = source.indexOf('/^\\/admin\\/users\\/[^/]+$/.test(path)');

    assert.ok(roleIndex > -1);
    assert.ok(permissionIndex > -1);
    assert.ok(toggleIndex > -1);
    assert.ok(resetIndex > -1);
    assert.ok(detailIndex > roleIndex);
    assert.ok(detailIndex > permissionIndex);
    assert.ok(detailIndex > toggleIndex);
    assert.ok(detailIndex > resetIndex);
  });
});
