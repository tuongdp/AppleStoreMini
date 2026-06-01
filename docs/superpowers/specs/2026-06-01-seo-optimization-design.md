# SEO Optimization for AppleStoreMini

Date: 2026-06-01
Status: Approved

## Overview

Optimize SEO for the AppleStoreMini SPA (React/Vite on Vercel). Currently the site has zero SEO -- static title "Apple Store" for all pages, no meta tags, no structured data, no sitemap, and Google bot sees only `<div id="root"></div>` due to pure CSR.

## Architecture

Four independent workstreams:

### 1. Dynamic Meta Tags via @unhead/react

- Install `@unhead/react` as the head management library (lightweight, ~3KB)
- Wrap app with `<HeadProvider>` in `src/main.jsx`
- Each page component sets its own SEO via `useHead()` or `<Head>`:
  - `title` - unique per page
  - `meta name="description"` - 150-160 char snippet
  - `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
  - `link rel="canonical"`
- Pages to update: HomePage, ProductDetailPage, ProductListPage, CategoryPage, NewsPage, NewsDetailPage, SearchPage, CartPage, CheckoutPage, static pages (About, Contact, Privacy, Terms, Warranty, ReturnPolicy)

### 2. robots.txt + Dynamic Sitemap

- **robots.txt**: Static file in `public/robots.txt`, allow all, point to sitemap
- **Sitemap**: New BE endpoint `GET /api/sitemap.xml` that dynamically generates XML from:
  - Products (slug-based URLs)
  - Categories (slug-based URLs) 
  - News articles (slug-based URLs)
  - Static pages (home, about, contact, etc.)
  - Each URL includes `<lastmod>` and `<priority>`

### 3. Structured Data (JSON-LD)

- `Organization` - site-wide, rendered in root layout
- `Product` + `Offer` - on ProductDetailPage, using product data
- `BreadcrumbList` - on product/category/news detail pages
- `NewsArticle` - on NewsDetailPage
- `WebSite` + `SearchAction` - on homepage for sitelinks searchbox

### 4. Prerendering via vite-plugin-prerender

- Install `vite-plugin-prerender` with Puppeteer
- Configure in `vite.config.js`:
  - Prerender: `/`, `/products`, `/news`, `/about`, `/contact`, `/privacy`, `/terms`
  - Dynamic routes: fetch product/category/news slugs from API at build time, prerender each
  - Output to `dist/` as static HTML files
- Vercel `vercel.json` already handles SPA rewrites, prerendered HTML takes priority

## Implementation Order

1. Install `@unhead/react`, add `HeadProvider`, create SEO utility hooks
2. Add meta tags to all pages (title + description minimum)
3. Create `public/robots.txt`
4. Create BE endpoint `GET /api/sitemap.xml`
5. Add structured data components (Organization, Product, Breadcrumb, Article)
6. Add `vite-plugin-prerender`, configure routes
7. Verify: build → check generated HTML → test with Google Rich Results Test

## Files to Create/Modify

### New Files
- `public/robots.txt`
- `src/components/shared/SeoHead.jsx` (reusable SEO component)
- `src/components/shared/StructuredData.jsx` (Organization schema)
- `src/components/shared/ProductStructuredData.jsx`
- `src/components/shared/BreadcrumbStructuredData.jsx`
- `src/components/shared/ArticleStructuredData.jsx`
- `D:\AppleStoreMini_api\src\routes\sitemap.routes.js`
- `D:\AppleStoreMini_api\src\controllers\sitemap.controller.js`
- `D:\AppleStoreMini_api\src\services\sitemap.service.js`

### Modified Files
- `src/main.jsx` - add HeadProvider
- `src/pages/HomePage.jsx` - add SEO head
- `src/pages/ProductDetailPage.jsx` - add SEO head + structured data
- `src/pages/ProductListPage.jsx` - add SEO head
- `src/pages/NewsPage.jsx` - add SEO head
- `src/pages/NewsDetailPage.jsx` - add SEO head + structured data
- `src/pages/CategoryPage.jsx` - add SEO head
- `src/pages/SearchPage.jsx` - add SEO head
- `src/pages/CartPage.jsx` - add SEO head
- `src/pages/CheckoutPage.jsx` - add SEO head
- `src/pages/AboutPage.jsx` - add SEO head
- `src/pages/ContactPage.jsx` - add SEO head
- `src/pages/PrivacyPage.jsx` - add SEO head
- `src/pages/TermsPage.jsx` - add SEO head
- `src/pages/WarrantyPage.jsx` - add SEO head
- `src/pages/ReturnPolicyPage.jsx` - add SEO head
- `vite.config.js` - add prerender plugin
- `D:\AppleStoreMini_api\src\routes\index.js` - mount sitemap route

## Risk: Prerendering Dynamic Data

Prerendered HTML may show stale data (prices, stock). Mitigation:
- Prerendering provides SEO baseline content (product name, description, image)
- Client-side hydration updates dynamic data (prices, stock) immediately
- Set reasonable `Cache-Control` headers on Vercel for prerendered pages
