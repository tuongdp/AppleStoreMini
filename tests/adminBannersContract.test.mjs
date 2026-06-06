import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin banners contract", () => {
  it("normalizes banner aliases and loading states", () => {
    const source = read("src/pages/admin/AdminBannerPage.jsx");

    assert.match(source, /function getBannerId/);
    assert.match(source, /banner\?\._id \|\| banner\?\.id/);
    assert.match(source, /function getBannerImage/);
    assert.match(source, /banner\?\.image \|\| banner\?\.imageUrl \|\| banner\?\.desktopImage/);
    assert.match(source, /function getBannerLink/);
    assert.match(source, /banner\?\.ctaLink \|\| banner\?\.link/);
    assert.match(source, /const \{ data, isLoading, isFetching \} = useGetAllBannersQuery\(\)/);
    assert.match(source, /Array\.isArray\(data\) \? data : data\?\.data \|\| \[\]/);
    assert.match(source, /isLoading \|\| isFetching/);
  });

  it("keeps update banner multipart and accessible controls", () => {
    const pageSource = read("src/pages/admin/AdminBannerPage.jsx");
    const apiSource = read("src/store/api/bannersApi.js");

    assert.match(pageSource, /body: formData/);
    assert.match(apiSource, /const payload = body \|\| rest/);
    assert.match(apiSource, /formData: payload instanceof FormData/);
    assert.match(pageSource, /aria-label=\{banner\.isActive !== false \? `Ẩn banner/);
    assert.match(pageSource, /<Plus[^>]+aria-hidden="true"/);
    assert.match(pageSource, /<ImagePlus[^>]+aria-hidden="true"/);
    assert.match(pageSource, /<Loader2[^>]+aria-hidden="true"/);
    assert.match(pageSource, /<Pencil[^>]+aria-hidden="true"/);
    assert.match(pageSource, /<Trash2[^>]+aria-hidden="true"/);
  });

  it("mocks create and toggle banner routes before detail routes", () => {
    const source = read("tests/utils/route-mocks.ts");
    const listIndex = source.indexOf('path === "/admin/banners"');
    const postIndex = source.indexOf('method === "POST"', listIndex);
    const toggleIndex = source.indexOf('/^\\/admin\\/banners\\/[^/]+\\/toggle$/.test(path)');
    const detailIndex = source.indexOf('/^\\/admin\\/banners\\/[^/]+$/.test(path)');

    assert.ok(listIndex > -1);
    assert.ok(postIndex > listIndex);
    assert.ok(toggleIndex > postIndex);
    assert.ok(detailIndex > toggleIndex);
  });
});
