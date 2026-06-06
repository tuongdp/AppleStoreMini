import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("prerender and canonical urls match registered public routes", () => {
  const prerender = read("scripts/prerender.cjs");
  const returnPage = read("src/pages/ReturnPolicyPage.jsx");
  const appleCarePage = read("src/pages/AppleCarePage.jsx");

  assert.match(prerender, /path:\s*"\/return"/);
  assert.match(prerender, /path:\s*"\/apple-care"/);
  assert.doesNotMatch(prerender, /\/return-policy/);
  assert.doesNotMatch(prerender, /\/applecare/);

  assert.match(returnPage, /url="\/return"/);
  assert.match(appleCarePage, /url="\/apple-care"/);
});

test("password complexity validation messages are readable Vietnamese", () => {
  const validations = read("src/lib/validations.js");

  assert.equal(
    validations.match(/Mật khẩu cần ít nhất 1 chữ hoa/g)?.length,
    3,
  );
  assert.equal(
    validations.match(/Mật khẩu cần ít nhất 1 ký tự đặc biệt/g)?.length,
    3,
  );
});

test("rich text editors disable StarterKit link when configuring Link separately", () => {
  const productEditor = read("src/components/ui/RichTextEditor.jsx");
  const newsEditor = read("src/components/shared/RichTextEditor.jsx");

  assert.match(productEditor, /StarterKit\.configure\(\{[\s\S]*link:\s*false/);
  assert.match(newsEditor, /StarterKit\.configure\(\{[\s\S]*link:\s*false/);
});

test("AppleCare page does not expose placeholder hash links", () => {
  const appleCarePage = read("src/pages/AppleCarePage.jsx");

  assert.doesNotMatch(appleCarePage, /href="#"/);
});

test("profile address book is not exposed without address API support", () => {
  const routes = read("src/routes.jsx");
  const constants = read("src/lib/constants.js");
  const profileLayout = read("src/components/layout/ProfileLayout.jsx");

  assert.doesNotMatch(routes, /AddressBookPage|profile\/addresses|path:\s*"addresses"/);
  assert.doesNotMatch(constants, /ADDRESSES/);
  assert.doesNotMatch(profileLayout, /\/profile\/addresses/);
});

test("CSP allows external image domains used by product content", () => {
  const index = read("index.html");

  assert.match(index, /connect-src[^"]*https:\/\/res\.cloudinary\.com/);
  assert.match(index, /connect-src[^"]*https:\/\/cdnv2\.tgdd\.vn/);
});

test("custom dialogs include accessible descriptions", () => {
  const commentModal = read("src/features/orders/components/CommentModal.jsx");
  const authModal = read("src/features/auth/components/AuthModal.jsx");
  const adminProductForm = read("src/features/admin/components/products/AdminProductForm.jsx");
  const imageGallery = read("src/components/shared/ImageGallery.jsx");

  assert.match(commentModal, /DialogDescription/);
  assert.match(authModal, /DialogDescription/);
  assert.match(adminProductForm, /DialogDescription/);
  assert.doesNotMatch(imageGallery, /aria-describedby=\{undefined\}/);
  assert.match(imageGallery, /DialogTitle/);
});
