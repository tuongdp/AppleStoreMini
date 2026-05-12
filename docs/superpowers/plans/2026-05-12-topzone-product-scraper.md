# TopZone Product Scraper — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép admin paste URL sản phẩm TopZone.vn, tự động scrape dữ liệu và pre-fill form tạo sản phẩm.

**Architecture:** Backend API endpoint `/api/admin/scrape/product` dùng cheerio parse HTML TopZone, trả về JSON structured data. Frontend `AdminProductCreate` gọi API, tạo global options mới nếu cần, truyền vào `AdminProductForm` qua prop `initialData` để pre-fill toàn bộ form.

**Tech Stack:** Backend: Node.js/Express, cheerio, axios. Frontend: React, RTK Query, react-hook-form.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `D:\AppleStoreMini_api\src\services\scraper.service.js` | Create | Core scraping logic — parse HTML, extract structured data |
| `D:\AppleStoreMini_api\src\controllers\admin\scraper.controller.js` | Create | HTTP handler cho scrape endpoint |
| `D:\AppleStoreMini_api\src\controllers\admin\upload.controller.js` | Create | HTTP handler cho remote image upload |
| `D:\AppleStoreMini_api\src\routes\admin.routes.js` | Modify | Thêm route scraper và remote-image |
| `D:\AppleStoreMini_api\package.json` | Modify | Install cheerio, axios |
| `D:\AppleStoreMini\src\features\admin\components\products\ProductScraper.jsx` | Create | UI component: URL input + scrape trigger |
| `D:\AppleStoreMini\src\pages\admin\AdminProductCreate.jsx` | Modify | Add scraper panel, call API, wire data to form |
| `D:\AppleStoreMini\src\features\admin\components\products\AdminProductForm.jsx` | Modify | Add `initialData` prop — pre-fill form on mount |

---

### Task 1: Install backend dependencies

**Files:**
- Modify: `D:\AppleStoreMini_api\package.json`

- [ ] **Step 1: Install cheerio and axios**

Run: `npm install cheerio axios`
Expected: both packages added to package.json and node_modules.

- [ ] **Step 2: Verify installation**

Run: `node -e "const cheerio = require('cheerio'); const axios = require('axios'); console.log('OK')"`
Expected: prints "OK"

---

### Task 2: Create scraper service

**Files:**
- Create: `D:\AppleStoreMini_api\src\services\scraper.service.js`

- [ ] **Step 1: Create the service file**

```js
const axios = require("axios");
const cheerio = require("cheerio");
const ApiError = require("../utils/ApiError");
const { prisma } = require("../config/db");

/**
 * Validate URL is a TopZone product page.
 * Accepts: topzone.vn/iphone/iphone-16-plus or topzone.vn/* /iphone-*-*
 * (slash-space pattern is just for avoiding */ in comments)
 */
const isValidTopZoneUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.hostname.includes("topzone.vn") && parsed.pathname.split("/").length >= 3;
    } catch {
        return false;
    }
};

/**
 * Extract product name from the page.
 * Tries: og:title meta, h1, then title tag.
 */
const extractName = ($) => {
    const ogTitle = $('meta[property="og:title"]').attr("content");
    if (ogTitle) return ogTitle.trim();

    const h1 = $("h1").first().text();
    if (h1) return h1.trim();

    return $("title").text().trim();
};

/**
 * Detect category from URL path.
 * e.g. "/iphone/iphone-16-plus" → "iphone"
 */
const extractCategory = (url) => {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] || "";
};

/**
 * Extract description (HTML content from product description section).
 * Tries: find article/div with description class, or fallback to meta description.
 */
const extractDescription = ($) => {
    const descMeta = $('meta[property="og:description"]').attr("content");
    if (descMeta) return `<p>${descMeta}</p>`;

    const descEl = $(".product-description, .detail-content, .box-content, article.article").first();
    if (descEl.length) return descEl.html().trim();

    return "";
};

/**
 * Extract specifications from the technical specs table.
 * TopZone uses grouped tables with section headers.
 * Returns: [{ key: string, value: string }]
 */
const extractSpecifications = ($) => {
    const specs = [];

    // TopZone specs are in a table with class "tsTable" or similar
    // Each row: td.label / td.value, grouped under section headers
    $("table.spec-table tr, .tsTable tr, .parameter-table tr, .technical-content tr").each((_, row) => {
        const $row = $(row);
        const cols = $row.find("td, th");
        if (cols.length >= 2) {
            const key = $(cols[0]).text().trim();
            const value = $(cols[1]).text().trim();
            if (key && value && !key.includes("Thông số") && !key.includes("Tiêu chí")) {
                specs.push({ key, value });
            }
        }
    });

    // Fallback: look for parameter list items
    if (specs.length === 0) {
        $(".parameter-item, .spec-item, .charactestic-item, ul.list-tskt li").each((_, el) => {
            const $el = $(el);
            const label = $el.find("label, span, .label, .name, .charactestic-name").first().text().trim();
            const val = $el.find("span, div, .value, .charactestic-value").last().text().trim();
            if (label && val) specs.push({ key: label, value: val });
        });
    }

    return specs;
};

/**
 * Extract color options from the page.
 * TopZone renders color swatches with labels and hex codes (from style or data attributes).
 */
const extractColorOptions = ($) => {
    const colors = [];
    const seen = new Set();

    // Look for color option buttons/swatches
    $(".color-item, .option-color .item, .box-color a, .color-selector button, .variant-color .option").each((_, el) => {
        const $el = $(el);
        const name = $el.attr("title") || $el.attr("aria-label") || $el.find("span, .name, .color-name").text().trim() || $el.text().trim();
        const style = $el.attr("style") || "";
        const hexMatch = style.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|background(?:-color)?:\s*(#[0-9a-fA-F]{6})/i);
        let hex = hexMatch ? hexMatch[1] || hexMatch[0] : null;

        if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            colors.push({ value: name, hex: hex });
        }
    });

    // Fallback: look for img alt text with color name
    if (colors.length === 0) {
        $(".box-color img, .color-image img, .option-color img").each((_, el) => {
            const name = $(el).attr("alt") || $(el).attr("title");
            if (name && !seen.has(name.toLowerCase())) {
                seen.add(name.toLowerCase());
                colors.push({ value: name, hex: null });
            }
        });
    }

    return colors;
};

/**
 * Extract storage options from the page.
 */
const extractStorageOptions = ($) => {
    const storages = [];
    const seen = new Set();

    // Storage selection buttons
    $(".storage-item, .option-storage .item, .box-storage a, .variant-storage .option, .ram-rom-item").each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, " ");
        const match = text.match(/(\d+\s*(GB|TB|MB))/i);
        if (match && !seen.has(match[1].toLowerCase())) {
            seen.add(match[1].toLowerCase());
            storages.push({ value: match[1] });
        }
    });

    return storages;
};

/**
 * Extract prices.
 * TopZone shows sale price prominently, and original price crossed out.
 */
const extractPrices = ($) => {
    let price = 0;
    let salePrice = null;

    // Try to find prices in meta tags first
    const priceMeta = $('meta[property="product:price:amount"]').attr("content");
    if (priceMeta) {
        salePrice = Number(priceMeta);
    }

    // Look for sale price element
    const salePriceText = $(".price, .special-price, .box-price-present .price, .product-price, .price-box .special-price .price")
        .first().text().replace(/[^\d]/g, "");
    if (salePriceText) {
        salePrice = Number(salePriceText);
    }

    // Look for original/old price
    const origPriceText = $(".old-price, .original-price, .box-price-present .old-price, .price-box .old-price .price, .regular-price")
        .first().text().replace(/[^\d]/g, "");
    if (origPriceText) {
        price = Number(origPriceText);
    }

    // If salePrice found but no original, set original slightly higher
    if (salePrice && !price) {
        price = salePrice;
        salePrice = null;
    }

    // Ensure salePrice < price
    if (salePrice && price && salePrice >= price) {
        [price, salePrice] = [salePrice, price];
    }

    return { price, salePrice };
};

/**
 * Extract product images (gallery — not variant-specific).
 */
const extractImages = ($) => {
    const images = [];
    const seen = new Set();

    // Gallery images
    $(".gallery img, .product-images img, .swiper-slide img, .carousel img, .slide img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-original");
        if (src && !seen.has(src) && !src.includes("placeholder") && !src.includes("spacer")) {
            seen.add(src);
            images.push(src);
        }
    });

    // Fallback: og:image
    if (images.length === 0) {
        const ogImage = $('meta[property="og:image"]').attr("content");
        if (ogImage) images.push(ogImage);
    }

    return images;
};

/**
 * Build variant combinations from colors × storages.
 * Each variant gets the same price/salePrice from the page.
 * Images from the scraper are shared across variants; color-specific
 * images are hard to map without the JS interactivity, so we share
 * the gallery images.
 */
const buildVariants = (colors, storages, price, salePrice, images) => {
    const variants = [];

    if (colors.length === 0) colors.push({ value: "" });
    if (storages.length === 0) storages.push({ value: "" });

    for (const color of colors) {
        for (const storage of storages) {
            variants.push({
                color: color.value,
                storage: storage.value,
                ram: "",
                edition: "",
                price: price || 0,
                salePrice: salePrice || null,
                stock: 0,
                images: [...images],
            });
        }
    }

    return variants;
};

/**
 * Detect global options that don't exist in the database yet.
 */
const detectNewGlobalOptions = async (colors, storages) => {
    const newOptions = [];

    for (const color of colors) {
        const exists = await prisma.globalOption.findUnique({
            where: { type_value: { type: "COLOR", value: color.value } },
        });
        if (!exists) {
            newOptions.push({ type: "COLOR", value: color.value, hex: color.hex });
        }
    }

    for (const storage of storages) {
        const exists = await prisma.globalOption.findUnique({
            where: { type_value: { type: "STORAGE", value: storage.value } },
        });
        if (!exists) {
            newOptions.push({ type: "STORAGE", value: storage.value, hex: null });
        }
    }

    return newOptions;
};

/**
 * Main scrape function.
 */
const scrapeProduct = async (url) => {
    if (!isValidTopZoneUrl(url)) {
        throw new ApiError(400, "URL không hợp lệ. Vui lòng nhập URL sản phẩm từ TopZone.vn");
    }

    let html;
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "vi-VN,vi;q=0.9",
            },
            timeout: 15000,
        });
        html = response.data;
    } catch (err) {
        throw new ApiError(500, "Không thể tải trang. Vui lòng kiểm tra lại URL.");
    }

    const $ = cheerio.load(html);

    // Extract everything
    const name = extractName($);
    if (!name) throw new ApiError(500, "Không tìm thấy tên sản phẩm trên trang.");

    const category = extractCategory(url);
    const description = extractDescription($);
    const specifications = extractSpecifications($);
    const colorOptions = extractColorOptions($);
    const storageOptions = extractStorageOptions($);
    const { price, salePrice } = extractPrices($);
    const galleryImages = extractImages($);
    const variants = buildVariants(colorOptions, storageOptions, price, salePrice, galleryImages);
    const newGlobalOptions = await detectNewGlobalOptions(colorOptions, storageOptions);

    // Generate slug from name
    const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return {
        name,
        slug,
        category,
        description,
        specifications,
        colorOptions,
        storageOptions,
        price,
        salePrice,
        variants,
        newGlobalOptions,
        images: galleryImages,
    };
};

module.exports = { scrapeProduct };
```

---

### Task 3: Create scraper controller

**Files:**
- Create: `D:\AppleStoreMini_api\src\controllers\admin\scraper.controller.js`

- [ ] **Step 1: Create the controller file**

```js
const scraperService = require("../../services/scraper.service");
const ApiResponse = require("../../utils/ApiResponse");
const catchAsync = require("../../utils/catchAsync");

const scrapeProduct = catchAsync(async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json(new ApiResponse(400, null, "Vui lòng cung cấp URL sản phẩm"));
    }
    const data = await scraperService.scrapeProduct(url);
    res.json(new ApiResponse(200, data, "Lấy dữ liệu sản phẩm thành công"));
});

module.exports = { scrapeProduct };
```

---

### Task 4: Create remote image upload controller

**Files:**
- Create: `D:\AppleStoreMini_api\src\controllers\admin\upload.controller.js`

- [ ] **Step 1: Create the controller file**

```js
const axios = require("axios");
const uploadService = require("../../services/upload.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");

const uploadRemoteImage = catchAsync(async (req, res) => {
    const { url } = req.body;
    if (!url) {
        throw new ApiError(400, "Vui lòng cung cấp URL ảnh");
    }

    let buffer;
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: { "User-Agent": "Mozilla/5.0" },
        });
        buffer = Buffer.from(response.data);
    } catch {
        throw new ApiError(500, "Không thể tải ảnh từ URL");
    }

    try {
        const result = await uploadService.uploadImage(buffer, "apple-store/products");
        res.json(new ApiResponse(200, { url: result.url }, "Upload ảnh thành công"));
    } catch {
        throw new ApiError(500, "Upload ảnh lên Cloudinary thất bại");
    }
});

module.exports = { uploadRemoteImage };
```

---

### Task 5: Add routes to admin router

**Files:**
- Modify: `D:\AppleStoreMini_api\src\routes\admin.routes.js`

- [ ] **Step 1: Add imports and routes**

Add near the top of `src/routes/admin.routes.js`, after the existing `require` statements:

```js
const scraperCtrl = require("../controllers/admin/scraper.controller");
const uploadCtrl = require("../controllers/admin/upload.controller");
```

Add routes after the existing upload-image endpoint (before the orders section). Find the line `// ── Orders ──` and add before it:

```js
// ── Scraper ──
router.post("/scrape/product", hasPermission("products"), scraperCtrl.scrapeProduct);
// ── Remote image upload ──
router.post("/upload/remote-image", hasPermission("products"), uploadCtrl.uploadRemoteImage);
```

- [ ] **Step 2: Verify routes work**

Run the backend: `npm run dev` (from the backend directory)
Expected: no startup errors.

---

### Task 6: Create ProductScraper frontend component

**Files:**
- Create: `D:\AppleStoreMini\src\features\admin\components\products\ProductScraper.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { useState } from "react";
import { Loader2, Link2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCreateGlobalOptionMutation } from "@/store/api/globalOptionsApi";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function ProductScraper({ onDataReady, disabled }) {
    const [url, setUrl] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeResult, setScrapeResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCreatingOptions, setIsCreatingOptions] = useState(false);

    const [createGlobalOption] = useCreateGlobalOptionMutation();

    const handleScrape = async () => {
        if (!url.trim()) return;
        setIsScraping(true);
        setError(null);
        setScrapeResult(null);

        try {
            const token = JSON.parse(localStorage.getItem("persist:root") || "{}")?.auth
                ? JSON.parse(JSON.parse(localStorage.getItem("persist:root") || "{}").auth)?.accessToken
                : null;

            const res = await fetch(`${API_BASE}/admin/scrape/product`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ url: url.trim() }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Lỗi khi lấy dữ liệu");
            setScrapeResult(json.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsScraping(false);
        }
    };

    const handleApply = async () => {
        if (!scrapeResult) return;

        // Auto-create missing global options
        if (scrapeResult.newGlobalOptions?.length > 0) {
            setIsCreatingOptions(true);
            try {
                for (const opt of scrapeResult.newGlobalOptions) {
                    await createGlobalOption({ type: opt.type, value: opt.value, hex: opt.hex }).unwrap();
                }
                toast.success(`Đã tạo ${scrapeResult.newGlobalOptions.length} tùy chọn mới`);
            } catch {
                toast.warning("Một số tùy chọn không thể tạo tự động. Bạn có thể thêm thủ công sau.");
            }
            setIsCreatingOptions(false);
        }

        onDataReady({
            name: scrapeResult.name,
            slug: scrapeResult.slug,
            category: scrapeResult.category,
            description: scrapeResult.description,
            specifications: scrapeResult.specifications || [],
            variants: scrapeResult.variants || [],
        });

        setIsOpen(false);
        setScrapeResult(null);
    };

    const handleClear = () => {
        setScrapeResult(null);
        setError(null);
        setUrl("");
    };

    return (
        <div className="rounded-2xl border border-border bg-card">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
                <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">Nhập từ TopZone</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isOpen && (
                <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Dán URL sản phẩm TopZone..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isScraping || disabled}
                            className="h-9 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="rounded-full shrink-0"
                            onClick={handleScrape}
                            disabled={!url.trim() || isScraping || disabled}
                        >
                            {isScraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Lấy dữ liệu"}
                        </Button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1">{error}</div>
                            <button type="button" onClick={handleClear} className="shrink-0"><X className="h-3.5 w-3.5" /></button>
                        </div>
                    )}

                    {scrapeResult && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Đã tìm thấy sản phẩm
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="text-xs">{scrapeResult.name}</Badge>
                                {scrapeResult.colorOptions?.length > 0 && (
                                    <Badge variant="outline" className="text-xs">{scrapeResult.colorOptions.length} màu</Badge>
                                )}
                                {scrapeResult.storageOptions?.length > 0 && (
                                    <Badge variant="outline" className="text-xs">{scrapeResult.storageOptions.length} dung lượng</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{scrapeResult.variants?.length || 0} variants</Badge>
                                {scrapeResult.specifications?.length > 0 && (
                                    <Badge variant="outline" className="text-xs">{scrapeResult.specifications.length} thông số</Badge>
                                )}
                                {scrapeResult.newGlobalOptions?.length > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700">
                                        +{scrapeResult.newGlobalOptions.length} tùy chọn mới
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={handleApply}
                                    disabled={isCreatingOptions}
                                >
                                    {isCreatingOptions ? (
                                        <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Đang tạo...</>
                                    ) : (
                                        "Áp dụng vào form"
                                    )}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={handleClear}>
                                    Huỷ
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

---

### Task 7: Modify AdminProductCreate — wire scraper to form

**Files:**
- Modify: `D:\AppleStoreMini\src\pages\admin\AdminProductCreate.jsx`

- [ ] **Step 1: Add state and scraper panel**

Replace the entire file:

```jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useCreateProductMutation, useUpdateProductMutation, useUploadEditorImageMutation } from "@/store/api/productsApi";
import AdminProductForm from "@/features/admin/components/products/AdminProductForm";
import ProductScraper from "@/features/admin/components/products/ProductScraper";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { uploadBlobImages } from "@/lib/utils";

export default function AdminProductCreate() {
    const navigate = useNavigate();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [uploadImage] = useUploadEditorImageMutation();
    const [isSaving, setIsSaving] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const autoCreatedIdRef = useRef(null);

    const handleProductAutoCreated = (productId) => {
        autoCreatedIdRef.current = productId;
    };

    const handleScrapeData = (data) => {
        setInitialData(data);
        toast.success("Dữ liệu đã được nạp vào form. Vui lòng kiểm tra lại trước khi lưu.");
    };

    const handleSubmit = async (values) => {
        setIsSaving(true);
        try {
            const { productId, variants, specifications, ...productData } = values;
            const autoCreatedId = productId || autoCreatedIdRef.current;

            if (autoCreatedId) {
                await updateProduct({ id: autoCreatedId, ...productData, specifications }).unwrap();
                toast.success("Cập nhật sản phẩm thành công");
            } else {
                const processedVariants = await Promise.all(
                    (variants || []).map(async (v) => {
                        let images = v.images || [];
                        if (Array.isArray(images) && images.length > 0 && images.some((img) => typeof img === "string" && img.startsWith("blob:"))) {
                            images = await uploadBlobImages(images, (fd) => uploadImage(fd).unwrap());
                        }
                        return { ...v, images, price: Number(v.price) || 0, salePrice: v.salePrice ? Number(v.salePrice) : null, stock: Number(v.stock) || 0 };
                    })
                );

                await createProduct({
                    ...productData,
                    specifications,
                    variants: processedVariants,
                }).unwrap();

                toast.success("Tạo sản phẩm thành công");
            }
            navigate(ROUTES.ADMIN_PRODUCTS);
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_PRODUCTS}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {"Quản lý sản phẩm"}
                </Link>
            </Button>

            <ProductScraper onDataReady={handleScrapeData} disabled={isSaving} />

            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Tạo sản phẩm mới"}
                </h1>
            </div>

            <AdminProductForm
                key={initialData ? initialData.slug : "new"}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                onProductAutoCreated={handleProductAutoCreated}
                initialData={initialData}
            />
        </div>
    );
}
```

---

### Task 8: Modify AdminProductForm — handle `initialData` prop

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\products\AdminProductForm.jsx`

- [ ] **Step 1: Add `initialData` prop to component declaration**

Find line 41:
```jsx
export default function AdminProductForm({ product, onSubmit, isLoading, onProductAutoCreated }) {
```

Replace with:
```jsx
export default function AdminProductForm({ product, onSubmit, isLoading, onProductAutoCreated, initialData }) {
```

- [ ] **Step 2: Add useEffect to pre-fill form from initialData**

After the last `useState` line (after `showImportSpecs`), and before `const [deleteVariant]`, add:

```jsx
    useEffect(() => {
        if (!initialData) return;

        // Pre-fill form fields
        form.reset({
            name: initialData.name || "",
            slug: initialData.slug || "",
            category: initialData.category || "",
            description: initialData.description || "",
            isActive: true,
        });

        // Pre-fill specifications
        setSpecs(initialData.specifications || []);

        // Pre-fill variants
        if (initialData.variants?.length > 0) {
            setVariants(initialData.variants);
        }
    }, [initialData]); // eslint-disable-line react-hooks/exhaustive-deps
```

**IMPORTANT:** Make sure the `useEffect` import already exists at the top of the file (line 1):
```jsx
import { useEffect, useState, useRef } from "react";
```

This import already exists — no change needed.

---

### Task 9: Final verification

- [ ] **Step 1: Build frontend**

Run: `npm run build` in `D:\AppleStoreMini`
Expected: build succeeds, no errors.

- [ ] **Step 2: Start backend**

Run: `npm run dev` in `D:\AppleStoreMini_api`
Expected: server starts without errors.

- [ ] **Step 3: Test the scrape endpoint manually**

```bash
curl -X POST http://localhost:5000/api/admin/scrape/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"url": "https://www.topzone.vn/iphone/iphone-16-plus"}'
```

Expected: returns JSON with name, specs, variants, etc.

- [ ] **Step 4: Commit all changes**

```bash
cd D:\AppleStoreMini_api
git add .
git commit -m "feat: add TopZone product scraper (backend)"

cd D:\AppleStoreMini
git add .
git commit -m "feat: add TopZone product scraper (frontend)"
```
