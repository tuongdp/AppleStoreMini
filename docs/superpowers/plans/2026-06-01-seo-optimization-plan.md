# SEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dynamic meta tags, robots.txt, sitemap, structured data (JSON-LD), and prerendering to the AppleStoreMini SPA for search engine optimization.

**Architecture:** Four independent workstreams -- (1) `@unhead/react` for per-page dynamic `<head>` tags, (2) static `robots.txt` + BE `/api/sitemap.xml` endpoint, (3) JSON-LD structured data components for products/organization/breadcrumbs/articles, (4) `vite-plugin-prerender` for SSG of key pages at build time.

**Tech Stack:** React 19, Vite 8, @unhead/react, vite-plugin-prerender, Express 5, Prisma

---

### Task 1: Install @unhead/react and set up HeadProvider

**Files:**
- Modify: `package.json` (install)
- Modify: `src/main.jsx`

- [ ] **Step 1: Install @unhead/react**

```bash
npm install @unhead/react
```

- [ ] **Step 2: Verify install**

```bash
npm ls @unhead/react
```
Expected: shows installed version.

- [ ] **Step 3: Add HeadProvider to src/main.jsx**

Replace the render tree in `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { HeadProvider } from "@unhead/react";
import { store, persistor } from "./store";
import AppProviders from "./providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import LoadingScreen from "./components/shared/LoadingScreen";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import NetworkStatusNotifier from "./components/shared/NetworkStatusNotifier";
import App from "./App.jsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";

registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <HeadProvider>
                <AppProviders>
                    <ErrorBoundary>
                        <App />
                    </ErrorBoundary>
                    <Toaster />
                    <NetworkStatusNotifier />
                </AppProviders>
            </HeadProvider>
        </PersistGate>
    </Provider>,
);
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/main.jsx
git commit -m "feat: install @unhead/react and add HeadProvider"
```

---

### Task 2: Create shared SEO components

**Files:**
- Create: `src/components/shared/SeoHead.jsx`
- Create: `src/components/shared/StructuredData.jsx`
- Create: `src/components/shared/ProductStructuredData.jsx`
- Create: `src/components/shared/BreadcrumbStructuredData.jsx`
- Create: `src/components/shared/ArticleStructuredData.jsx`

- [ ] **Step 1: Create src/components/shared/SeoHead.jsx**

```jsx
import { useHead } from "@unhead/react";

const SITE_NAME = "Apple Store";
const SITE_URL = "https://www.apple-store-mini.io.vn";
const DEFAULT_IMAGE = "https://www.apple-store-mini.io.vn/og-image.jpg";
const DEFAULT_DESCRIPTION = "Apple Store - Cửa hàng Apple chính hãng, iPhone, iPad, MacBook, Apple Watch, AirPods giá tốt nhất. Giao hàng toàn quốc, bảo hành chính hãng.";

export default function SeoHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = "website",
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Cửa hàng Apple chính hãng`;
  const resolvedUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const resolvedImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  useHead({
    title: fullTitle,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:image", content: resolvedImage },
      { property: "og:url", content: resolvedUrl },
      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: resolvedImage },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    link: [
      { rel: "canonical", href: resolvedUrl },
    ],
  });

  return null;
}
```

- [ ] **Step 2: Create src/components/shared/StructuredData.jsx (Organization + WebSite)**

```jsx
export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Apple Store",
        url: "https://www.apple-store-mini.io.vn",
        logo: "https://www.apple-store-mini.io.vn/favicon.svg",
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+84-000-000-000",
          contactType: "customer service",
          availableLanguage: ["Vietnamese"],
        },
      },
      {
        "@type": "WebSite",
        url: "https://www.apple-store-mini.io.vn",
        name: "Apple Store",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://www.apple-store-mini.io.vn/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

- [ ] **Step 3: Create src/components/shared/ProductStructuredData.jsx**

```jsx
export default function ProductStructuredData({ product, variant }) {
  if (!product) return null;

  const price = variant?.salePrice ?? variant?.price ?? 0;
  const availability = variant?.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  const images = Array.isArray(product.images) ? product.images : [];
  try { images.push(...(variant?.images ? JSON.parse(variant.images) : [])); } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, "").substring(0, 300) || product.name,
    image: images.length > 0 ? images : [product.image || ""],
    sku: variant?.id || product.id,
    brand: { "@type": "Brand", name: "Apple" },
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: "VND",
      availability,
      url: `https://www.apple-store-mini.io.vn/products/${product.slug}`,
    },
    ...(product.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(product.rating),
            reviewCount: product.reviewCount || 0,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

- [ ] **Step 4: Create src/components/shared/BreadcrumbStructuredData.jsx**

```jsx
export default function BreadcrumbStructuredData({ items }) {
  if (!items || items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://www.apple-store-mini.io.vn${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

- [ ] **Step 5: Create src/components/shared/ArticleStructuredData.jsx**

```jsx
export default function ArticleStructuredData({ article }) {
  if (!article) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.thumbnail || "",
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author || "Apple Store",
    },
    publisher: {
      "@type": "Organization",
      name: "Apple Store",
      logo: {
        "@type": "ImageObject",
        url: "https://www.apple-store-mini.io.vn/favicon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.apple-store-mini.io.vn/news/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/SeoHead.jsx src/components/shared/StructuredData.jsx src/components/shared/ProductStructuredData.jsx src/components/shared/BreadcrumbStructuredData.jsx src/components/shared/ArticleStructuredData.jsx
git commit -m "feat: add shared SEO components (head, structured data)"
```

---

### Task 3: Add SEO to HomePage

**Files:**
- Modify: `src/pages/HomePage.jsx`

- [ ] **Step 1: Add SEO imports and render in HomePage**

In `src/pages/HomePage.jsx`, add imports after existing imports:

```jsx
import SeoHead from "@/components/shared/SeoHead";
import StructuredData from "@/components/shared/StructuredData";
```

Then add both components at the top of the JSX return, right after the outer fragment/destructuring:

After the main function return, add:

```jsx
<SeoHead title="Trang chủ" />
<StructuredData />
```

The placement should be alongside the existing `<h1 className="sr-only">` element. Add right before or after that h1.

- [ ] **Step 2: Commit**

```bash
git add src/pages/HomePage.jsx
git commit -m "feat: add SEO head and structured data to HomePage"
```

---

### Task 4: Add SEO to ProductDetailPage

**Files:**
- Modify: `src/pages/ProductDetailPage.jsx`

- [ ] **Step 1: Add SEO to ProductDetailPage**

In `src/pages/ProductDetailPage.jsx`, add imports:

```jsx
import SeoHead from "@/components/shared/SeoHead";
import ProductStructuredData from "@/components/shared/ProductStructuredData";
import BreadcrumbStructuredData from "@/components/shared/BreadcrumbStructuredData";
```

Find where `product` is available (after the `useGetProductBySlugQuery` result), and add the SEO components inside the return JSX. The product's first image is typically `product?.images?.[0]` or `product?.image`. The page slug comes from `useParams()`.

In the JSX return, at the top of the page content, add:

```jsx
<SeoHead
  title={product?.name}
  description={product?.description?.replace(/<[^>]*>/g, "").substring(0, 160) || product?.name}
  image={product?.image || product?.images?.[0]}
  url={`/products/${product?.slug}`}
  type="product"
/>
<ProductStructuredData product={product} variant={selectedVariant} />
<BreadcrumbStructuredData
  items={[
    { name: "Trang chủ", url: "/" },
    { name: "Sản phẩm", url: "/products" },
    { name: product?.name || "", url: `/products/${product?.slug}` },
  ]}
/>
```

Note: The `selectedVariant` is computed in the component via `getSelectedVariant`. Find where it's defined and use that variable.

- [ ] **Step 2: Commit**

```bash
git add src/pages/ProductDetailPage.jsx
git commit -m "feat: add SEO head and product structured data to ProductDetailPage"
```

---

### Task 5: Add SEO to ProductListPage

**Files:**
- Modify: `src/pages/ProductListPage.jsx`

- [ ] **Step 1: Add SEO head to ProductListPage**

Add import:
```jsx
import SeoHead from "@/components/shared/SeoHead";
```

In the JSX return, add near the top:
```jsx
<SeoHead
  title="Sản phẩm"
  description="Khám phá tất cả sản phẩm Apple chính hãng - iPhone, iPad, MacBook, Apple Watch, AirPods, phụ kiện. Giá tốt, bảo hành chính hãng."
  url="/products"
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ProductListPage.jsx
git commit -m "feat: add SEO head to ProductListPage"
```

---

### Task 6: Add SEO to NewsPage + NewsDetailPage

**Files:**
- Modify: `src/pages/NewsPage.jsx`
- Modify: `src/pages/NewsDetailPage.jsx`

- [ ] **Step 1: Add SEO head to NewsPage**

Add import:
```jsx
import SeoHead from "@/components/shared/SeoHead";
```

Add in JSX return:
```jsx
<SeoHead
  title="Tin tức"
  description="Tin tức công nghệ, sản phẩm Apple mới nhất, đánh giá, thủ thuật và khuyến mãi."
  url="/news"
/>
```

- [ ] **Step 2: Add SEO head + structured data to NewsDetailPage**

Read `src/pages/NewsDetailPage.jsx` to find where `news` data is available (from `useGetNewsBySlugQuery`).

Add imports:
```jsx
import SeoHead from "@/components/shared/SeoHead";
import ArticleStructuredData from "@/components/shared/ArticleStructuredData";
import BreadcrumbStructuredData from "@/components/shared/BreadcrumbStructuredData";
```

Add in JSX return, after `news` data is available:
```jsx
<SeoHead
  title={news?.title}
  description={news?.excerpt?.substring(0, 160) || news?.title}
  image={news?.thumbnail}
  url={`/news/${news?.slug}`}
  type="article"
/>
<ArticleStructuredData article={news} />
<BreadcrumbStructuredData
  items={[
    { name: "Trang chủ", url: "/" },
    { name: "Tin tức", url: "/news" },
    { name: news?.title || "", url: `/news/${news?.slug}` },
  ]}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/NewsPage.jsx src/pages/NewsDetailPage.jsx
git commit -m "feat: add SEO head and article structured data to News pages"
```

---

### Task 7: Add SEO to remaining pages

**Files:**
- Modify: `src/pages/SearchPage.jsx`
- Modify: `src/pages/CartPage.jsx`
- Modify: `src/pages/CheckoutPage.jsx`
- Modify: `src/pages/AboutPage.jsx`
- Modify: `src/pages/ContactPage.jsx`
- Modify: `src/pages/PrivacyPage.jsx`
- Modify: `src/pages/TermsPage.jsx`
- Modify: `src/pages/WarrantyPage.jsx`
- Modify: `src/pages/ReturnPolicyPage.jsx`
- Modify: `src/pages/AppleCarePage.jsx`
- Modify: `src/pages/OrderLookupPage.jsx`

- [ ] **Step 1: Add SEO to all remaining pages in batch**

For each page, add `import SeoHead from "@/components/shared/SeoHead";` and the appropriate JSX. Below are the SeoHead props for each:

**SearchPage.jsx:**
```jsx
<SeoHead
  title="Tìm kiếm"
  description="Tìm kiếm sản phẩm Apple - iPhone, iPad, MacBook, Apple Watch, AirPods và phụ kiện chính hãng."
  url="/search"
/>
```

**CartPage.jsx:**
```jsx
<SeoHead
  title="Giỏ hàng"
  url="/cart"
  noindex
/>
```

**CheckoutPage.jsx:**
```jsx
<SeoHead
  title="Thanh toán"
  url="/checkout"
  noindex
/>
```

**AboutPage.jsx:**
```jsx
<SeoHead
  title="Giới thiệu"
  description="Apple Store - Cửa hàng Apple chính hãng, cung cấp iPhone, iPad, MacBook, Apple Watch, AirPods chính hãng với giá tốt nhất."
  url="/about"
/>
```

**ContactPage.jsx:**
```jsx
<SeoHead
  title="Liên hệ"
  description="Liên hệ Apple Store để được tư vấn sản phẩm Apple chính hãng. Hỗ trợ mua hàng, bảo hành, đổi trả."
  url="/contact"
/>
```

**PrivacyPage.jsx:**
```jsx
<SeoHead
  title="Chính sách bảo mật"
  url="/privacy"
  noindex
/>
```

**TermsPage.jsx:**
```jsx
<SeoHead
  title="Điều khoản sử dụng"
  url="/terms"
  noindex
/>
```

**WarrantyPage.jsx:**
```jsx
<SeoHead
  title="Chính sách bảo hành"
  description="Chính sách bảo hành sản phẩm Apple chính hãng tại Apple Store. Bảo hành 12 tháng, hỗ trợ đổi trả trong 30 ngày."
  url="/warranty"
/>
```

**ReturnPolicyPage.jsx:**
```jsx
<SeoHead
  title="Chính sách đổi trả"
  description="Chính sách đổi trả sản phẩm tại Apple Store. Đổi trả miễn phí trong 30 ngày, hoàn tiền 100% nếu sản phẩm lỗi."
  url="/return-policy"
/>
```

**AppleCarePage.jsx:**
```jsx
<SeoHead
  title="AppleCare & Dịch vụ sửa chữa"
  description="Dịch vụ AppleCare, sửa chữa iPhone, iPad, MacBook, Apple Watch chính hãng. Bảo hành mở rộng, thay pin, thay màn hình."
  url="/applecare"
/>
```

**OrderLookupPage.jsx:**
```jsx
<SeoHead
  title="Tra cứu đơn hàng"
  url="/order-lookup"
  noindex
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/SearchPage.jsx src/pages/CartPage.jsx src/pages/CheckoutPage.jsx src/pages/AboutPage.jsx src/pages/ContactPage.jsx src/pages/PrivacyPage.jsx src/pages/TermsPage.jsx src/pages/WarrantyPage.jsx src/pages/ReturnPolicyPage.jsx src/pages/AppleCarePage.jsx src/pages/OrderLookupPage.jsx
git commit -m "feat: add SEO head to all remaining pages"
```

---

### Task 8: Create robots.txt

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create public/robots.txt**

```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /cart
Disallow: /checkout
Disallow: /profile
Disallow: /payment/
Disallow: /order-lookup

Sitemap: https://www.apple-store-mini.io.vn/sitemap.xml
```

- [ ] **Step 2: Commit**

```bash
git add public/robots.txt
git commit -m "feat: add robots.txt"
```

---

### Task 9: Create BE sitemap.xml endpoint

**Files (in D:\AppleStoreMini_api):**
- Create: `src/services/sitemap.service.js`
- Create: `src/controllers/sitemap.controller.js`
- Create: `src/routes/sitemap.routes.js`
- Modify: `src/routes/index.js`

- [ ] **Step 1: Create src/services/sitemap.service.js**

```js
const { prisma } = require("../config/db");

const BASE_URL = process.env.CLIENT_URL || "https://www.apple-store-mini.io.vn";

const generateSitemap = async () => {
    const now = new Date().toISOString();

    const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });

    const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });

    const newsArticles = await prisma.news.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
    });

    const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/products", priority: "0.9", changefreq: "daily" },
        { url: "/news", priority: "0.8", changefreq: "daily" },
        { url: "/about", priority: "0.5", changefreq: "monthly" },
        { url: "/contact", priority: "0.5", changefreq: "monthly" },
        { url: "/warranty", priority: "0.4", changefreq: "monthly" },
        { url: "/return-policy", priority: "0.4", changefreq: "monthly" },
        { url: "/applecare", priority: "0.5", changefreq: "monthly" },
        { url: "/privacy", priority: "0.2", changefreq: "yearly" },
        { url: "/terms", priority: "0.2", changefreq: "yearly" },
        { url: "/search", priority: "0.3", changefreq: "weekly" },
    ];

    const urls = [];

    staticPages.forEach((page) => {
        urls.push(`  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    });

    products.forEach((p) => {
        urls.push(`  <url>
    <loc>${BASE_URL}/products/${p.slug}</loc>
    <lastmod>${p.updatedAt?.toISOString() || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    categories.forEach((c) => {
        urls.push(`  <url>
    <loc>${BASE_URL}/products?category=${c.slug}</loc>
    <lastmod>${c.updatedAt?.toISOString() || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });

    newsArticles.forEach((n) => {
        urls.push(`  <url>
    <loc>${BASE_URL}/news/${n.slug}</loc>
    <lastmod>${n.updatedAt?.toISOString() || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
};

module.exports = { generateSitemap };
```

- [ ] **Step 2: Create src/controllers/sitemap.controller.js**

```js
const sitemapService = require("../services/sitemap.service");
const catchAsync = require("../utils/catchAsync");

const getSitemap = catchAsync(async (req, res) => {
    const sitemap = await sitemapService.generateSitemap();
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
});

module.exports = { getSitemap };
```

- [ ] **Step 3: Create src/routes/sitemap.routes.js**

```js
const router = require("express").Router();
const { cacheMiddleware } = require("../middlewares/cache.middleware");
const { getSitemap } = require("../controllers/sitemap.controller");

router.get("/", cacheMiddleware(60 * 60 * 1000), getSitemap);

module.exports = router;
```

- [ ] **Step 4: Mount sitemap route in src/routes/index.js**

Add after the `router.use("/settings/return-window", ...)` line (before `module.exports`):

```js
router.use("/sitemap.xml", require("./sitemap.routes"));
```

- [ ] **Step 5: Update CSP in vercel.json (FE)**

Read `D:\AppleStoreMini\vercel.json`. The CSP needs to allow `connect-src` for the sitemap API endpoint. Since it already allows `https://applestoremini-api.onrender.com`, no change needed -- the sitemap is server-side XML, not fetched by the browser.

- [ ] **Step 6: Verify sitemap works locally**

Start the local BE server and test:
```bash
curl http://localhost:5000/api/sitemap.xml
```
Expected: XML sitemap with URLs.

- [ ] **Step 7: Commit (BE)**

```bash
git add src/services/sitemap.service.js src/controllers/sitemap.controller.js src/routes/sitemap.routes.js src/routes/index.js
git commit -m "feat: add dynamic sitemap.xml endpoint"
```

---

### Task 10: Add prerendering with Puppeteer post-build script

**Files:**
- Modify: `package.json` (install + scripts)
- Create: `scripts/prerender.cjs`
- Modify: `vercel.json` (optional rewrites)
- Modify: `index.html`

- [ ] **Step 1: Install puppeteer as dev dependency**

```bash
npm install -D puppeteer
```

- [ ] **Step 2: Create scripts/prerender.cjs**

Note: Use `.cjs` extension for CommonJS (Puppeteer works best this way).

```js
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "../dist");
const BASE_URL = "http://localhost:3000";

const ROUTES = [
  { path: "/", name: "Home" },
  { path: "/products", name: "Products" },
  { path: "/news", name: "News" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  { path: "/warranty", name: "Warranty" },
  { path: "/return-policy", name: "ReturnPolicy" },
  { path: "/applecare", name: "AppleCare" },
  { path: "/privacy", name: "Privacy" },
  { path: "/terms", name: "Terms" },
];

async function prerender() {
  console.log("[prerender] Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      console.log(`[prerender] Rendering ${route.name}: ${route.path}`);
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle2", timeout: 30000 });

      const html = await page.content();

      const outDir = route.path === "/" ? DIST : path.join(DIST, route.path);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      fs.writeFileSync(path.join(outDir, "index.html"), html);
      console.log(`[prerender] Saved ${route.name} -> ${path.join(outDir, "index.html")}`);
    } catch (err) {
      console.error(`[prerender] Failed ${route.name}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("[prerender] Done");
}

prerender();
```

- [ ] **Step 3: Update build script in package.json**

Read `package.json` and change the `"build"` script from `"vite build"` to include prerendering:

```json
"build": "vite build && node scripts/prerender.cjs"
```

This ensures Vercel runs prerendering automatically on deploy. (Vercel auto-detects Vite and runs the `build` script.)

- [ ] **Step 4: Run prerender after build and verify**

```bash
npm run build
npm run prerender
```

Check that `dist/index.html`, `dist/products/index.html`, etc. contain full HTML content with meta tags (not just `<div id="root"></div>`).

```bash
dir dist\index.html dist\products\index.html dist\news\index.html
```

- [ ] **Step 5: Update vercel.json to route prerendered HTML**

Vercel serves static files before applying rewrites. So `dist/products/index.html` will be served for `/products` automatically if the SPA rewrite doesn't intercept it first.

Read `vercel.json`. The current rewrite is:
```json
{ "source": "/((?!.*\\.).*)", "destination": "/index.html" }
```

This regex `(?!.*\\.)` means "if the path does NOT contain a dot". Since `/products`, `/news`, etc. don't contain dots, they WOULD be caught by this rewrite. To fix, add specific routes first:

```json
{
  "rewrites": [
    { "source": "/products", "destination": "/products/index.html" },
    { "source": "/news", "destination": "/news/index.html" },
    { "source": "/about", "destination": "/about/index.html" },
    { "source": "/contact", "destination": "/contact/index.html" },
    { "source": "/warranty", "destination": "/warranty/index.html" },
    { "source": "/return-policy", "destination": "/return-policy/index.html" },
    { "source": "/applecare", "destination": "/applecare/index.html" },
    { "source": "/privacy", "destination": "/privacy/index.html" },
    { "source": "/terms", "destination": "/terms/index.html" },
    { "source": "/((?!.*\\.).*)", "destination": "/index.html" }
  ]
}
```

The rewrite with exact path match comes first and takes priority.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/prerender.cjs vercel.json
git commit -m "feat: add prerendering with Puppeteer post-build script"
```

---

### Task 11: Final verification

- [ ] **Step 1: Build FE**

```bash
npm run build
```
Expected: no errors, prerendered HTML files exist in dist/.

- [ ] **Step 2: Lint BE**

```bash
npm run lint
```
Expected: 0 errors.

- [ ] **Step 3: Test sitemap on production**

```bash
curl https://applestoremini-api.onrender.com/api/sitemap.xml
```
Expected: XML sitemap with URLs.

- [ ] **Step 4: Test robots.txt**

```bash
curl https://www.apple-store-mini.io.vn/robots.txt
```
Expected: robots.txt content.

- [ ] **Step 5: Commit final changes and push**

```bash
git add -A
git commit -m "chore: final verification of SEO implementation"
git push origin main
```

