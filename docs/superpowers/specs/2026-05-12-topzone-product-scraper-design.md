# TopZone Product Scraper — Design

**Date:** 2026-05-12  
**Status:** Approved

## Overview

Tool cho phép admin paste URL sản phẩm từ TopZone.vn, tự động scrape và pre-fill toàn bộ form tạo sản phẩm trong AppleStoreMini admin. Giảm thời gian nhập liệu thủ công từ ~15 phút xuống còn vài giây.

## Architecture

```
[AdminProductCreate]                  [BE: /api/admin/scrape/product]
       │                                          │
       │  POST { url }                            │
       ├─────────────────────────────────────────►│
       │                                          ├── fetch HTML (axios)
       │                                          ├── parse (cheerio)
       │                                          ├── extract structured data
       │                                          │
       │  { name, slug, category,                │
       │    description, specifications,          │
       │    variants[], newGlobalOptions[] }      │
       │◄────────────────────────────────────────┤
       │                                          │
       ├── create missing global options          │
       ├── pass data to AdminProductForm          │
       ├── user reviews / edits                   │
       └── submit normally                        │
```

## Backend

### New files

| File | Purpose |
|------|---------|
| `src/services/scraper.service.js` | Core scraping logic (Cheerio parser) |
| `src/controllers/admin/scraper.controller.js` | HTTP handler |
| `src/routes/admin/scraper.routes.js` | Route registration |

### New endpoint

`POST /api/admin/scrape/product`

- **Auth:** `protect` + `staffOrAdmin`
- **Body:** `{ url: string }`
- **Response:** structured product data (see schema below)
- **Error:** 400 if URL invalid/not a TopZone product page, 500 if scrape fails

### Scraper logic (`scraper.service.js`)

Sử dụng `cheerio` để parse HTML từ TopZone.vn. TopZone render SSR đầy đủ data trong HTML.

**Extract strategy:**

| Data | Selector / Strategy |
|------|-------------------|
| `name` | Product title element |
| `slug` | Auto-generate from name via `slugify()` |
| `category` | Detect from URL path (e.g., `/iphone/` → `"iphone"`). Map to existing category slug in DB. |
| `description` | Rich HTML from product description section |
| `specifications` | Parse spec table rows: each row has label + value. Group by section headers. |
| `colorOptions` | All color options with their hex codes (from color swatch data attributes) |
| `storageOptions` | Storage capacity list (128GB, 256GB, 512GB) |
| `variants` | For each color × storage combination, extract price, salePrice, and corresponding images |
| `price / salePrice` | From the pricing section of the default variant |
| `images` | Gallery image URLs from the product image carousel |

**Global options detection:**

After extracting colors and storages, compare against existing `GlobalOption` records in DB. Return `newGlobalOptions[]` for any values not yet in the system so the frontend can prompt creation.

The scraper does NOT modify the database — it's a read-only data extraction service. The frontend is responsible for calling existing APIs to create global options and products.

### Response schema

```json
{
  "name": "iPhone 16 Plus 128GB",
  "slug": "iphone-16-plus",
  "category": "iphone",
  "description": "<p>Rich HTML description...</p>",
  "specifications": [
    {"key": "Hệ điều hành", "value": "iOS 18"},
    {"key": "Chip xử lý (CPU)", "value": "Apple A18 Bionic 6 nhân"}
  ],
  "variants": [
    {
      "color": "Xanh Lưu Ly",
      "storage": "128GB",
      "price": 25990000,
      "salePrice": 25390000,
      "stock": 0,
      "images": ["https://cdnv2.tgdd.vn/...1.jpg", "https://cdnv2.tgdd.vn/...2.jpg"]
    }
  ],
  "newGlobalOptions": [
    {"type": "COLOR", "value": "Xanh Lưu Ly", "hex": "#4169E1"}
  ]
}
```

## Frontend

### Changes to `AdminProductCreate.jsx`

- Add state: `scrapedData`, `isScraping`, `scrapeError`
- Add collapsible panel "Nhập từ TopZone" at top of page
- On scrape success: auto-create missing global options via `useCreateGlobalOptionMutation`, then pass data to form

### Changes to `AdminProductForm.jsx`

- Add optional prop: `initialData` (same shape as scrape response)
- When `initialData` is provided on mount: pre-fill form fields, specs, and variants
- Disable the auto-create-on-first-variant behavior when `initialData` is present (since variants are pre-populated)

### New prop: `initialData`

```js
initialData: {
  name: string,
  slug: string,
  category: string,      // category slug
  description: string,
  specifications: [{key: string, value: string}],
  variants: [{color, storage, ram, edition, price, salePrice, stock, images: string[]}]
}
```

### Image handling flow

1. Scraper returns TopZone CDN image URLs
2. Frontend shows preview images in variant form using `<img src={url}>`
3. On final submit, remote URLs are detected and uploaded to Cloudinary via `POST /api/admin/upload/remote-image { url }`
4. Cloudinary URLs replace the original CDN URLs in the submitted variant data

### New endpoint for image proxying

`POST /api/admin/upload/remote-image`

- **Auth:** `protect` + `staffOrAdmin`
- **Body:** `{ url: string }`
- **Logic:** Download image from URL, upload to Cloudinary, return Cloudinary URL
- **Response:** `{ url: "https://res.cloudinary.com/..." }`

## Dependencies

**Backend (new):**
- `cheerio` — HTML parsing (~200KB)
- `axios` — already exists in project

**Frontend:**
- No new dependencies

## Error handling

| Scenario | Handling |
|----------|----------|
| Invalid URL / not TopZone | 400 error, show toast |
| Page structure changed (scrape fails) | 500 error, show toast with suggestion to enter manually |
| Category not found in DB | Warn user to create category first or select manually |
| Image download fails | Skip that image, continue with others |
| Global option creation fails | Warn but don't block — user can add manually |

## Scope and constraints

- **Scope:** Only TopZone.vn product detail pages initially. Extensible to other MWG sites (thegioididong.com, dienmayxanh.com) since they share the same HTML template.
- **Does NOT handle:** Product editing (scrape is for creation only), bulk scraping, scheduled scraping.
- **Rate limiting:** None initially. Frontend naturally rate-limits since it requires manual URL paste.
