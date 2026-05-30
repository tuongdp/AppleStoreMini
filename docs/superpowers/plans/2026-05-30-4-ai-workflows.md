# 4 AI Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 AI-powered features (Voice Search, Sentiment Review, Personalized Recommendations) + swap AI provider from Groq to OpenCode API (deepseek-v4-flash). Chatbot kept as-is.

**Architecture:** Replace Groq with OpenCode API (OpenAI-compatible format). Add 2 new BE endpoints (`POST /api/chat/sentiment`, `POST /api/chat/personalized`). Add async sentiment analysis on review submit with DB schema change (2 nullable fields). Add voice input hook + personalized recommendations carousel on FE.

**Tech Stack:** Node.js/Express/Prisma (BE), React/Vite/RTK Query (FE), OpenCode API (deepseek-v4-flash)

---

## File Structure Map

```
BE (D:\AppleStoreMini_Api)
├── src/config/ai.js                              NEW: OpenCode API client config
├── src/services/chat.service.js                  MODIFY: Groq→OpenCode, +2 methods
├── src/controllers/chat.controller.js            MODIFY: provider swap, +2 endpoints
├── src/controllers/productReview.controller.js    MODIFY: async sentiment after createReview
├── prisma/schema.prisma                          MODIFY: +sentiment +sentimentScore fields
├── src/routes/index.js                           MODIFY: +2 chat routes
└── prisma/migrations/*                           GENERATED: sentiment columns

FE (D:\AppleStoreMini)
├── src/features/products/hooks/useVoiceSearch.js              NEW: Web Speech API hook
├── src/features/products/PersonalizedRecommendations.jsx        NEW: horizontal scroll carousel
├── src/features/admin/components/reviews/SentimentDashboard.jsx NEW: admin sentiment page
├── src/store/api/aiApi.js                                      MODIFY: +personalizedRecommend
├── src/store/api/productReviewApi.js                           MODIFY: +getSentimentStats
├── src/components/layout/root/NavbarSearch.jsx                MODIFY: +mic button
├── src/components/shared/SearchOverlay.jsx                    MODIFY: +mic button
├── src/pages/HomePage.jsx                                     MODIFY: +PersonalizedRecommendations
├── src/pages/ProductDetailPage.jsx                            MODIFY: +PersonalizedRecommendations
├── src/routes.jsx                                             MODIFY: +admin sentiment route
└── src/lib/constants.js                                       MODIFY: +ROUTES.ADMIN_SENTIMENT
```

---

### Task 1: BE — OpenCode AI Client Config

**Files:**
- Create: `D:\AppleStoreMini_Api\src\config\ai.js`

- [ ] **Step 1: Create OpenCode AI config file**

```js
const AI_KEY = process.env.OPENCODE_API_KEY || "sk-2JeqLtJtGMufCzS8rV6Jwx01bCyqs1oXUyEUKdkhtISNlslgdbh4PCprAFjwGYF6";
const AI_URL = "https://api.opencode.ai/v1/chat/completions";
const MODEL_NAME = "deepseek-v4-flash";
const AI_TIMEOUT = 20000;
const AI_MAX_TOKENS = 800;
const AI_TEMPERATURE = 0.2;

const aiOnline = !!process.env.OPENCODE_API_KEY || true;

console.log(`[AI] Provider: OpenCode | Model: ${MODEL_NAME} | Online: ${aiOnline ? "YES" : "FALLBACK"}`);

module.exports = { AI_KEY, AI_URL, MODEL_NAME, AI_TIMEOUT, AI_MAX_TOKENS, AI_TEMPERATURE, aiOnline };
```

- [ ] **Step 2: Verify file created**

Run: `node -e "require('./src/config/ai'); console.log('OK')"` from `D:\AppleStoreMini_Api`
Expected: `[AI] Provider: OpenCode | Model: deepseek-v4-flash | Online: YES` then `OK`

- [ ] **Step 3: Commit**

```bash
git add src/config/ai.js
git commit -m "feat: add OpenCode AI client config"
```

---

### Task 2: BE — Swap Groq → OpenCode in Chat Controller

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\controllers\chat.controller.js:1-275`

- [ ] **Step 1: Replace AI client calls in chat.controller.js**

Replace lines 6-43 (AI config + callAI function) with the new OpenCode version. In `D:\AppleStoreMini_Api\src\controllers\chat.controller.js`:

**Delete** lines 6-43 and **insert** at the top:

```js
const chatService = require("../services/chat.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { AI_KEY, AI_URL, MODEL_NAME, AI_TIMEOUT, AI_MAX_TOKENS, AI_TEMPERATURE, aiOnline } = require("../config/ai");

const callAI = async (messages) => {
    console.log("[AI] Calling OpenCode...", { keyPrefix: AI_KEY ? AI_KEY.substring(0, 8) + "..." : "HARDCODED" });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);
    try {
        const res = await fetch(AI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AI_KEY}`,
            },
            body: JSON.stringify({ model: MODEL_NAME, messages, max_tokens: AI_MAX_TOKENS, temperature: AI_TEMPERATURE }),
            signal: controller.signal,
        });
        if (!res.ok) {
            const err = await res.text();
            console.error("[AI] OpenCode API error:", res.status, err.substring(0, 300));
            throw new Error(`OpenCode error ${res.status}`);
        }
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        console.log(`[AI] OpenCode responded (${text.length} chars)`);
        return text;
    } catch (e) {
        if (e.name === "AbortError") { console.error("[AI] OpenCode timed out"); }
        else if (!e.message.startsWith("OpenCode error")) { console.error("[AI] Network error:", e.message); }
        throw e;
    } finally {
        clearTimeout(timeout);
    }
};
```

Also update the health endpoint in `D:\AppleStoreMini_Api\src\routes\index.js` (approximately line 32-37) to reference the new AI:

```js
router.get("/chat/health", (req, res) => {
    const { aiOnline } = require("../config/ai");
    res.json({
        aiEnabled: aiOnline,
        model: "deepseek-v4-flash (OpenCode)",
    });
});
```

- [ ] **Step 2: Verify the chat controller loads**

Run: `node -e "const c = require('./src/controllers/chat.controller'); console.log(Object.keys(c))"` from `D:\AppleStoreMini_Api`
Expected: `[AI] Provider: ...` then `[ 'chat', 'recommend', 'compare', 'search', 'reviewSummary', 'generateDescription' ]`

- [ ] **Step 3: Commit**

```bash
git add src/controllers/chat.controller.js src/routes/index.js
git commit -m "feat: swap Groq → OpenCode API provider"
```

---

### Task 3: BE — Add Sentiment Fields to ProductReview

**Files:**
- Modify: `D:\AppleStoreMini_Api\prisma\schema.prisma:461-490`

- [ ] **Step 1: Add sentiment fields to Prisma schema**

In `D:\AppleStoreMini_Api\prisma\schema.prisma`, inside the `ProductReview` model (after line 469 `images Json @default("[]")`, before `isVisible`):

```prisma
  sentiment      String?   // "positive" | "negative" | "neutral"
  sentimentScore Float?    // 0.0–1.0
```

The resulting model block (insert between `images` and `isVisible`):

```prisma
model ProductReview {
  id            String    @id @default(cuid())
  productId     String    @db.VarChar(36)
  userId        String
  orderId       String?
  orderItemId   String?
  rating        Int
  content       String?   @db.Text
  images        Json      @default("[]")
  sentiment      String?
  sentimentScore Float?
  isVisible     Boolean   @default(true)
  likes         Json      @default("[]")
  adminReply    String?   @db.Text
  repliedById   String?
  repliedByName String?
  repliedAt     DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  order     Order?     @relation(fields: [orderId], references: [id], onDelete: SetNull)
  orderItem OrderItem? @relation(fields: [orderItemId], references: [id], onDelete: SetNull)

  @@unique([userId, productId])
  @@index([productId])
  @@index([userId])
  @@index([orderId])
  @@index([orderItemId])
  @@map("product_reviews")
}
```

- [ ] **Step 2: Create migration**

```bash
npx prisma migrate dev --name add_sentiment_to_review
```
from `D:\AppleStoreMini_Api`

Expected: Migration creates `ALTER TABLE product_reviews ADD COLUMN sentiment VARCHAR(191) NULL, ADD COLUMN sentimentScore DOUBLE NULL`

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```
from `D:\AppleStoreMini_Api`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add sentiment + sentimentScore fields to ProductReview"
```

---

### Task 4: BE — Add analyzeSentiment to Chat Service

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\chat.service.js:189-195`

- [ ] **Step 1: Add analyzeSentiment function to chat.service.js**

Add to `module.exports` at the bottom of `D:\AppleStoreMini_Api\src\services\chat.service.js` (line 189-195), adding `analyzeSentiment`:

```js
const analyzeSentiment = async (callAIFn, content) => {
    const SYSTEM_SENTIMENT = `Phân tích cảm xúc của nội dung đánh giá.
Trả về CHỈ JSON: {"sentiment": "positive"|"negative"|"neutral", "score": 0.0-1.0}
- positive: khen, hài lòng, thích (score 0.7-1.0)
- negative: chê, không hài lòng, bực (score 0.0-0.4)
- neutral: trung lập, bình thường (score 0.5)
- score: độ mạnh của cảm xúc (0.0 rất tiêu cực → 1.0 rất tích cực)`;

    try {
        const reply = await callAIFn([
            { role: "system", content: SYSTEM_SENTIMENT },
            { role: "user", content: content },
        ]);
        const parsed = JSON.parse(reply.trim());
        if (!parsed.sentiment || !["positive", "negative", "neutral"].includes(parsed.sentiment)) {
            return { sentiment: "neutral", score: 0.5 };
        }
        return {
            sentiment: parsed.sentiment,
            score: typeof parsed.score === "number" ? Math.max(0, Math.min(1, parsed.score)) : 0.5,
        };
    } catch (e) {
        console.error("[AI] Sentiment analysis failed:", e.message);
        return { sentiment: "neutral", score: 0.5 };
    }
};

module.exports = {
    extractSearchIntent,
    searchProducts,
    getProductPrice,
    getProductImage,
    mapProducts,
    analyzeSentiment,
};
```

- [ ] **Step 2: Verify module exports**

Run: `node -e "const s = require('./src/services/chat.service'); console.log(Object.keys(s))"` from `D:\AppleStoreMini_Api`
Expected: `[ 'extractSearchIntent', 'searchProducts', 'getProductPrice', 'getProductImage', 'mapProducts', 'analyzeSentiment' ]`

- [ ] **Step 3: Commit**

```bash
git add src/services/chat.service.js
git commit -m "feat: add analyzeSentiment to chat service"
```

---

### Task 5: BE — Add sentiment + personalized endpoints to Chat Controller

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\controllers\chat.controller.js` (append 2 new handlers)

- [ ] **Step 1: Add sentiment and personalized handlers at the end of chat.controller.js**

Add before `module.exports` (before line 275):

```js
// ── 7. Sentiment Analysis ──────────────────────────────────────

const sentiment = catchAsync(async (req, res) => {
    const { content } = req.body;
    if (!content?.trim()) { throw new ApiError(400, "Vui lòng cung cấp nội dung"); }

    if (!aiOnline) {
        return res.json(new ApiResponse(200, { sentiment: "neutral", score: 0.5, aiOnline: false }, "Thành công"));
    }

    try {
        const result = await chatService.analyzeSentiment(callAI, content);
        return res.json(new ApiResponse(200, { ...result, aiOnline: true }, "Thành công"));
    } catch (e) {
        return res.json(new ApiResponse(200, { sentiment: "neutral", score: 0.5, aiOnline: false }, "Thành công"));
    }
});

// ── 8. Personalized Recommendations ──────────────────────────────────────

const SYSTEM_PERSONALIZED = `Bạn là chuyên gia gợi ý sản phẩm Apple. Phân tích lịch sử mua hàng của khách để gợi ý sản phẩm phù hợp. Tiếng Việt.
Định dạng:
<explanation>Giải thích ngắn về lý do gợi ý</explanation>
<products>slug1 | reason: lý do gợi ý\nslug2 | reason: lý do gợi ý</products>
Gợi ý 4-6 sản phẩm, ưu tiên sản phẩm cùng hệ sinh thái, nâng cấp hợp lý, hoặc phụ kiện bổ trợ.`;

const personalized = catchAsync(async (req, res) => {
    const { prisma } = require("../config/db");
    const userId = req.user?.id;

    let orderSummary = "";
    if (userId) {
        const orders = await prisma.order.findMany({
            where: { userId, status: "DELIVERED" },
            include: { items: { include: { variant: { include: { product: true } } } } },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        if (orders.length > 0) {
            const products = new Map();
            for (const o of orders) {
                for (const item of o.items) {
                    const p = item.variant?.product;
                    if (p) {
                        const existing = products.get(p.id);
                        if (!existing || o.createdAt > existing.lastOrdered) {
                            products.set(p.id, { name: p.name, slug: p.slug, category: p.categoryId, price: item.price, lastOrdered: o.createdAt });
                        }
                    }
                }
            }
            orderSummary = `Lịch sử mua:\n${[...products.values()].map((p) => `- ${p.name} (${p.category}, ~${Number(p.price || 0).toLocaleString("vi-VN")}đ)`).join("\n")}`;
        }
    }

    if (!orderSummary) {
        const topProducts = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { variants: { _count: "desc" } },
            take: 10,
            select: { slug: true, name: true, image: true, category: { select: { name: true } }, variants: { select: { price: true, salePrice: true, images: true }, orderBy: { price: "asc" }, take: 1 } },
        });
        return res.json(new ApiResponse(200, {
            reply: "Gợi ý sản phẩm bán chạy nhất cho bạn",
            products: chatService.mapProducts(topProducts).slice(0, 6),
            aiOnline: false,
        }, "Thành công"));
    }

    const allProducts = await prisma.product.findMany({
        where: { isActive: true },
        select: {
            slug: true, name: true, image: true, specifications: true,
            category: { select: { name: true } },
            variants: { select: { price: true, salePrice: true, images: true }, orderBy: { price: "asc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
    });

    if (!aiOnline) {
        return res.json(new ApiResponse(200, {
            reply: "Gợi ý sản phẩm cho bạn",
            products: chatService.mapProducts(allProducts.slice(0, 6)),
            aiOnline: false,
        }, "Thành công"));
    }

    try {
        const reply = await callAI([
            { role: "system", content: SYSTEM_PERSONALIZED },
            { role: "user", content: `${orderSummary}\n\nSản phẩm có sẵn:\n${chatService.mapProducts(allProducts).map((p) => `- ${p.name} | ${p.price.toLocaleString("vi-VN")}đ | ${p.slug}`).join("\n")}` },
        ]);
        const expl = (reply.match(/<explanation>([\s\S]*?)<\/explanation>/) || [])[1]?.trim() || reply;
        const slugs = (reply.match(/<products>([\s\S]*?)<\/products>/) || [])[1]?.trim().split("\n").map((l) => l.split("|")[0]?.trim()).filter(Boolean) || [];
        const rec = allProducts.filter((p) => slugs.includes(p.slug)).map((p) => {
            const line = reply.split("\n").find((l) => l.startsWith(p.slug));
            return {
                slug: p.slug,
                name: p.name,
                price: chatService.getProductPrice(p),
                image: chatService.getProductImage(p),
                reason: line?.split("|")[1]?.replace("reason:", "").trim() || "",
            };
        });
        return res.json(new ApiResponse(200, {
            reply: expl,
            products: rec.length > 0 ? rec : chatService.mapProducts(allProducts.slice(0, 6)),
            aiOnline: true,
        }, "Thành công"));
    } catch (e) {
        console.error("[AI] Personalized failed:", e.message);
        return res.json(new ApiResponse(200, {
            reply: "Gợi ý sản phẩm cho bạn",
            products: chatService.mapProducts(allProducts.slice(0, 6)),
            aiOnline: false,
        }, "Thành công"));
    }
});
```

Update the `module.exports` line to include the new handlers:

```js
module.exports = { chat, recommend, compare, search, reviewSummary, generateDescription, sentiment, personalized };
```

- [ ] **Step 2: Add routes in routes/index.js**

Add after line 31 (`router.post("/chat/generate-description", ...)`):

```js
router.post("/chat/sentiment", chatLimiter, chatCtrl.sentiment);
router.post("/chat/personalized", chatLimiter, chatCtrl.personalized);
```

- [ ] **Step 3: Verify module loads**

Run: `node -e "const c = require('./src/controllers/chat.controller'); console.log(Object.keys(c))"` from `D:\AppleStoreMini_Api`
Expected: `[ 'chat', 'recommend', 'compare', 'search', 'reviewSummary', 'generateDescription', 'sentiment', 'personalized' ]`

- [ ] **Step 4: Commit**

```bash
git add src/controllers/chat.controller.js src/routes/index.js
git commit -m "feat: add sentiment + personalized recommendation endpoints"
```

---

### Task 6: BE — Async Sentiment on Review Submit

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\controllers\productReview.controller.js:12-16`

- [ ] **Step 1: Modify createReview to trigger async sentiment**

Replace the `createReview` function (lines 12-16) in `D:\AppleStoreMini_Api\src\controllers\productReview.controller.js`:

```js
const { aiOnline } = require("../config/ai");
const { analyzeSentiment } = require("../services/chat.service");
const { AI_KEY, AI_URL, MODEL_NAME, AI_TIMEOUT, AI_MAX_TOKENS, AI_TEMPERATURE } = require("../config/ai");

const callAIForSentiment = async (messages) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);
    try {
        const res = await fetch(AI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_KEY}` },
            body: JSON.stringify({ model: MODEL_NAME, messages, max_tokens: AI_MAX_TOKENS, temperature: AI_TEMPERATURE }),
            signal: controller.signal,
        });
        if (!res.ok) throw new Error(`OpenCode error ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
    } finally {
        clearTimeout(timeout);
    }
};

const createReview = catchAsync(async (req, res) => {
    const { rating, content, comment, images, orderId, orderItemId } = req.body;
    const review = await reviewService.createReview(req.user.id, req.params.productId, { rating, content: content ?? comment, images, orderId, orderItemId });
    res.status(201).json(new ApiResponse(201, review, "Đánh giá thành công"));

    // Async sentiment analysis (non-blocking)
    if (aiOnline && review.content?.trim()) {
        (async () => {
            try {
                const result = await analyzeSentiment(callAIForSentiment, review.content);
                const { prisma } = require("../config/db");
                await prisma.productReview.update({
                    where: { id: review.id },
                    data: { sentiment: result.sentiment, sentimentScore: result.score },
                });
                console.log(`[Sentiment] Review ${review.id}: ${result.sentiment} (${result.score})`);
            } catch (e) {
                console.error("[Sentiment] Async analysis failed for review", review.id, e.message);
            }
        })();
    }
});
```

- [ ] **Step 2: Verify controller loads**

Run: `node -e "const c = require('./src/controllers/productReview.controller'); console.log(Object.keys(c))"` from `D:\AppleStoreMini_Api`
Expected: Array of handler names including createReview.

- [ ] **Step 3: Commit**

```bash
git add src/controllers/productReview.controller.js
git commit -m "feat: async sentiment analysis on review submit"
```

---

### Task 7: BE — Admin Sentiment Stats Endpoint

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\controllers\productReview.controller.js` (append)
- Modify: `D:\AppleStoreMini_Api\src\routes\index.js` or admin routes

- [ ] **Step 1: Add getSentimentStats to productReview controller**

Add to the end of `D:\AppleStoreMini_Api\src\controllers\productReview.controller.js`, before module.exports:

```js
const getSentimentStats = catchAsync(async (req, res) => {
    const { prisma } = require("../config/db");
    const overview = await prisma.productReview.aggregate({
        _count: { sentiment: true },
        _avg: { sentimentScore: true },
    });

    const byProduct = await prisma.productReview.groupBy({
        by: ["productId", "sentiment"],
        _count: { sentiment: true },
        _avg: { sentimentScore: true },
        where: { sentiment: { not: null } },
    });

    const productMap = new Map();
    for (const row of byProduct) {
        if (!productMap.has(row.productId)) {
            productMap.set(row.productId, { productId: row.productId, positive: 0, negative: 0, neutral: 0, totalScore: 0, count: 0 });
        }
        const entry = productMap.get(row.productId);
        if (row.sentiment) { entry[row.sentiment] = row._count?.sentiment || 0; }
        if (row._avg?.sentimentScore != null) { entry.totalScore += row._avg.sentimentScore * (row._count?.sentiment || 0); entry.count += row._count?.sentiment || 0; }
    }

    const products = await Promise.all(
        [...productMap.values()].map(async (item) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } });
            return {
                productId: item.productId,
                name: product?.name || "Unknown",
                positive: item.positive,
                negative: item.negative,
                neutral: item.neutral,
                averageScore: item.count > 0 ? Math.round((item.totalScore / item.count) * 100) / 100 : 0,
            };
        })
    );

    res.json(new ApiResponse(200, {
        overview: {
            total: overview._count?.sentiment || 0,
            averageScore: overview._avg?.sentimentScore ? Math.round(overview._avg.sentimentScore * 100) / 100 : 0,
        },
        products,
    }, "Thành công"));
});
```

And add `getSentimentStats` to the module.exports.

- [ ] **Step 2: Add admin route for sentiment stats**

In `D:\AppleStoreMini_Api\src\routes\admin\review.routes.js`, add after existing routes (after line 9):

```js
router.get("/reviews/sentiment", hasPermission("comments", "view"), reviewCtrl.getSentimentStats);
```

This mounts at `GET /api/admin/reviews/sentiment`.

- [ ] **Step 3: Verify route**

Run: `node -e "console.log(require('./src/routes/index').stack.map(l => l.route?.path || ''))"` from `D:\AppleStoreMini_Api`

- [ ] **Step 4: Commit**

```bash
git add src/controllers/productReview.controller.js src/routes/
git commit -m "feat: add admin sentiment stats endpoint"
```

---

### Task 8: FE — Voice Search Hook

**Files:**
- Create: `D:\AppleStoreMini\src\features\products\hooks\useVoiceSearch.js`

- [ ] **Step 1: Create useVoiceSearch hook**

```js
import { useState, useCallback, useRef } from "react";

export function useVoiceSearch({ onResult, lang = "vi-VN" } = {}) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError("Trình duyệt không hỗ trợ nhập liệu bằng giọng nói");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            onResult?.(transcript);
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === "no-speech") {
                setError("Không nghe thấy giọng nói, thử lại nhé");
            } else if (event.error === "not-allowed") {
                setError("Vui lòng cho phép truy cập micro");
            } else {
                setError("Có lỗi xảy ra, thử lại nhé");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
            setIsListening(true);
            setError(null);
        } catch (e) {
            setError("Không thể khởi động micro");
            setIsListening(false);
        }
    }, [isSupported, lang, onResult]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    return { isListening, startListening, stopListening, isSupported, error };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/products/hooks/useVoiceSearch.js
git commit -m "feat: add useVoiceSearch hook for Web Speech API"
```

---

### Task 9: FE — Add Mic Button to NavbarSearch + SearchOverlay

**Files:**
- Modify: `D:\AppleStoreMini\src\components\layout\root\NavbarSearch.jsx`
- Modify: `D:\AppleStoreMini\src\components\shared\SearchOverlay.jsx`

- [ ] **Step 1: Modify NavbarSearch.jsx**

Add import for Mic icon and the hook. In `D:\AppleStoreMini\src\components\layout\root\NavbarSearch.jsx`:

Change line 2:
```js
import { Search, X, Loader2, Mic, MicOff } from "lucide-react";
```

After line 5 (`import ProductSearchSuggestions...`), add:
```js
import { useVoiceSearch } from "@/features/products/hooks/useVoiceSearch";
```

After line 7, inside the component, before the `useEffect`, add:
```js
const { isListening, startListening, stopListening, isSupported } = useVoiceSearch({
    onResult: (text) => {
        handleKeywordChange(text);
    },
});
```

In the input section (around line 42-53), after the existing right-side `{keyword && ...}` button block (the X/Loader2 button), add the mic button:
```jsx
{isSupported && (
    <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? "Dừng nghe" : "Tìm kiếm bằng giọng nói"}
        className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            isListening && "text-red-500 hover:text-red-600",
        )}
        style={{ right: keyword ? "2rem" : "0.75rem" }}
    >
        {isListening ? (
            <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
        ) : (
            <Mic className="h-4 w-4" />
        )}
    </button>
)}
```

Add `cn` import if not present (line 6 already has it):
```js
import { cn } from "@/lib/utils"; // if needed
```
Actually, check if `cn` is already imported. Looking at the file, `cn` is not imported in NavbarSearch.jsx (it doesn't use it). Add the import if not present. Actually, for this file, the mic button doesn't strictly need `cn` - we can use string template. Let me simplify:

```jsx
{isSupported && (
    <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? "Dừng nghe" : "Tìm kiếm bằng giọng nói"}
        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${isListening ? "text-red-500 hover:text-red-600" : ""}`}
        style={{ right: keyword ? "2.25rem" : "0.75rem" }}
    >
        {isListening ? (
            <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
        ) : (
            <Mic className="h-4 w-4" />
        )}
    </button>
)}
```

Note: Remove the `MicOff` import since we only use `Mic`.

- [ ] **Step 2: Modify SearchOverlay.jsx similarly**

In `D:\AppleStoreMini\src\components\shared\SearchOverlay.jsx`, add the same pattern:

Change line 2:
```js
import { Search, X, Loader2, Mic } from "lucide-react";
```

After line 5, add:
```js
import { useVoiceSearch } from "@/features/products/hooks/useVoiceSearch";
```

After line 35 (close of useEffect), add the voice hook:
```js
const { isListening, startListening, stopListening, isSupported } = useVoiceSearch({
    onResult: (text) => {
        handleKeywordChange(text);
    },
});
```

After the existing `{keyword && ...}` button block (the X/Loader2 button around line 100-113), add the mic button inside the `<div className="relative">` parent, before the closing `</div>`:
```jsx
{isSupported && (
    <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? "Dừng nghe" : "Tìm kiếm bằng giọng nói"}
        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${isListening ? "text-red-500 hover:text-red-600" : ""}`}
        style={{ right: keyword ? "2.75rem" : "0.75rem" }}
    >
        {isListening ? (
            <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
            </span>
        ) : (
            <Mic className="h-5 w-5" />
        )}
    </button>
)}
```

- [ ] **Step 3: Build check**

Run: `npm run build` from `D:\AppleStoreMini`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/products/hooks/useVoiceSearch.js src/components/layout/root/NavbarSearch.jsx src/components/shared/SearchOverlay.jsx
git commit -m "feat: add voice input to search with Web Speech API"
```

---

### Task 10: FE — Add PersonalizedRecommend Mutation to aiApi

**Files:**
- Modify: `D:\AppleStoreMini\src\store\api\aiApi.js`

- [ ] **Step 1: Add personalizedRecommend mutation**

In `D:\AppleStoreMini\src\store\api\aiApi.js`, add inside the `endpoints` object (after line 24, after `aiGenerateDescription`):

```js
personalizedRecommend: builder.mutation({
    query: () => ({ url: "/chat/personalized", method: "POST", body: {} }),
    transformResponse: (response) => response.data,
}),
```

Update the export destructure (line 28-34):

```js
export const {
    useAiRecommendMutation,
    useAiCompareMutation,
    useAiSearchMutation,
    useAiReviewSummaryMutation,
    useAiGenerateDescriptionMutation,
    usePersonalizedRecommendMutation,
} = aiApi;
```

- [ ] **Step 2: Build check**

Run: `npm run build` from `D:\AppleStoreMini`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/store/api/aiApi.js
git commit -m "feat: add personalizedRecommend mutation to aiApi"
```

---

### Task 11: FE — PersonalizedRecommendations Component

**Files:**
- Create: `D:\AppleStoreMini\src\features\products\PersonalizedRecommendations.jsx`

- [ ] **Step 1: Create PersonalizedRecommendations component**

```jsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { usePersonalizedRecommendMutation } from "@/store/api/aiApi";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { Skeleton } from "@/components/ui/skeleton";

export default function PersonalizedRecommendations({ context = "homepage" }) {
    const [fetch, { data, isLoading, isError }] = usePersonalizedRecommendMutation();
    const scrollRef = useRef(null);
    const fetched = useRef(false);

    useEffect(() => {
        if (!fetched.current) {
            fetched.current = true;
            fetch();
        }
    }, [fetch]);

    const products = data?.products || [];
    const show = !isLoading && !isError && products.length > 0;

    if (isLoading) {
        return (
            <section className="section-padding py-8 md:py-10 lg:py-14">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="flex gap-4 overflow-x-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-64 w-44 shrink-0 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!show) return null;

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
    };

    return (
        <section className={`section-padding py-8 md:py-10 lg:py-14 ${context === "homepage" ? "" : "border-t border-border"}`}>
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-apple-blue" />
                        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                            Có thể bạn thích...
                        </h2>
                    </div>
                    <div className="hidden gap-1 sm:flex">
                        <button
                            onClick={() => scroll(-1)}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Cuộn trái"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => scroll(1)}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Cuộn phải"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product) => (
                        <Link
                            key={product.slug}
                            to={ROUTES.PRODUCT_DETAIL(product.slug)}
                            className="group flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                        >
                            <div className="aspect-square overflow-hidden bg-muted/50">
                                {product.image ? (
                                    <ResponsiveImage
                                        src={product.image}
                                        alt={product.name}
                                        width={176}
                                        height={176}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground/20">
                                        {product.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-1 p-3">
                                <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-apple-blue">
                                    {product.name}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                    {formatPrice(product.price)}
                                </p>
                                {product.reason && (
                                    <p className="mt-auto text-xs italic text-muted-foreground line-clamp-2">
                                        {product.reason}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 2: Build check**

Run: `npm run build` from `D:\AppleStoreMini`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/products/PersonalizedRecommendations.jsx
git commit -m "feat: add PersonalizedRecommendations horizontal scroll component"
```

---

### Task 12: FE — Integrate PersonalizedRecommendations into Pages

**Files:**
- Modify: `D:\AppleStoreMini\src\pages\HomePage.jsx`
- Modify: `D:\AppleStoreMini\src\pages\ProductDetailPage.jsx`

- [ ] **Step 1: Add to HomePage.jsx**

In `D:\AppleStoreMini\src\pages\HomePage.jsx`, add after line 4 (the lucide-react imports):

```js
import PersonalizedRecommendations from "@/features/products/PersonalizedRecommendations";
```

Add the component before the trust badges section (before the `<section className="section-padding border-t border-border bg-muted/20 py-12">` trust badges, around line 190), or before the closing tag:

Insert after the category sliders loop (line 188) and before the trust badges section (line 190):
```jsx
<PersonalizedRecommendations context="homepage" />
```

- [ ] **Step 2: Add to ProductDetailPage.jsx**

In `D:\AppleStoreMini\src\pages\ProductDetailPage.jsx`, add after line 41 (the AIReviewSummary import):

```js
import PersonalizedRecommendations from "@/features/products/PersonalizedRecommendations";
```

Add the component after RelatedProducts (line 570, after `</RelatedProducts>`):

```jsx
<PersonalizedRecommendations context="product-detail" />
```

- [ ] **Step 3: Build check**

Run: `npm run build` from `D:\AppleStoreMini`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.jsx src/pages/ProductDetailPage.jsx
git commit -m "feat: integrate PersonalizedRecommendations into homepage and product detail"
```

---

### Task 13: FE — Admin Sentiment Dashboard

**Files:**
- Create: `D:\AppleStoreMini\src\features\admin\components\reviews\SentimentDashboard.jsx`
- Modify: `D:\AppleStoreMini\src\store\api\productReviewApi.js`
- Modify: `D:\AppleStoreMini\src\routes.jsx`
- Modify: `D:\AppleStoreMini\src\lib\constants.js`

- [ ] **Step 1: Add getSentimentStats to productReviewApi.js**

In `D:\AppleStoreMini\src\store\api\productReviewApi.js`, add after the existing admin endpoints (after `adminDeleteReview` inside the `endpoints` object):

```js
getSentimentStats: builder.query({
    query: () => "/admin/reviews/sentiment",
    transformResponse: (response) => response.data,
}),
```

Update the export (after line 81):
```js
export const {
    useGetReviewsQuery, useCreateReviewMutation, useUploadReviewMediaMutation, useUpdateReviewMutation, useDeleteReviewMutation,
    useLikeReviewMutation, useCheckPurchasedQuery, useGetAllReviewsQuery,
    useGetAdminReviewQuery, useToggleReviewVisibilityMutation, useReplyReviewMutation, useAdminDeleteReviewMutation,
    useGetSentimentStatsQuery,
} = productReviewApi;
```

- [ ] **Step 2: Create SentimentDashboard component**

Create the directory first, then write the file `D:\AppleStoreMini\src\features\admin\components\reviews\SentimentDashboard.jsx`:

```jsx
import { useGetSentimentStatsQuery } from "@/store/api/productReviewApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const SENTIMENT_BADGE = {
    positive: { label: "Tích cực", className: "bg-green-100 text-green-800" },
    negative: { label: "Tiêu cực", className: "bg-red-100 text-red-800" },
    neutral: { label: "Trung lập", className: "bg-gray-100 text-gray-800" },
};

export default function SentimentDashboard() {
    const { data, isLoading } = useGetSentimentStatsQuery();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-28 rounded-2xl" />))}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        );
    }

    const overview = data?.overview || {};
    const products = data?.products || [];

    const totalWithSentiment = products.reduce((sum, p) => sum + p.positive + p.negative + p.neutral, 0);
    const allPositive = products.reduce((sum, p) => sum + p.positive, 0);
    const allNegative = products.reduce((sum, p) => sum + p.negative, 0);
    const allNeutral = products.reduce((sum, p) => sum + p.neutral, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Phân tích cảm xúc đánh giá</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Tổng hợp sentiment từ đánh giá của khách hàng
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đánh giá</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalWithSentiment || overview.total || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tích cực</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {totalWithSentiment > 0 ? Math.round((allPositive / totalWithSentiment) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">{allPositive} đánh giá</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tiêu cực</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            {totalWithSentiment > 0 ? Math.round((allNegative / totalWithSentiment) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">{allNegative} đánh giá</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Điểm TB</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{overview.averageScore || 0}</p>
                        <p className="text-xs text-muted-foreground">thang 0-1</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết theo sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead className="text-center">Tích cực</TableHead>
                                <TableHead className="text-center">Tiêu cực</TableHead>
                                <TableHead className="text-center">Trung lập</TableHead>
                                <TableHead className="text-center">Điểm TB</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Chưa có dữ liệu sentiment
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products
                                    .sort((a, b) => (b.positive + b.negative + b.neutral) - (a.positive + a.negative + a.neutral))
                                    .map((product) => (
                                        <TableRow key={product.productId}>
                                            <TableCell className="font-medium max-w-[300px] truncate">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-green-600 font-medium">{product.positive}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-red-600 font-medium">{product.negative}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-gray-600 font-medium">{product.neutral}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{product.averageScore}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 3: Add route constant**

In `D:\AppleStoreMini\src\lib\constants.js`, add after `ADMIN_USER_DETAIL` (line 37):

```js
ADMIN_SENTIMENT: "/admin/reviews/sentiment",
```

- [ ] **Step 4: Add route to routes.jsx**

In `D:\AppleStoreMini\src\routes.jsx`, add the lazy import after line 79 (`AdminCommentPage`):

```js
const AdminSentimentPage = lazyPage(() => import("@/features/admin/components/reviews/SentimentDashboard"));
```

Add the route inside the admin children (after line 192, the comments route):

```jsx
{ path: "reviews/sentiment", element: <AdminPermissionRoute permission="comments"><AdminSentimentPage /></AdminPermissionRoute> },
```

- [ ] **Step 5: Build check**

Run: `npm run build` from `D:\AppleStoreMini`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/store/api/productReviewApi.js src/features/admin/components/reviews/SentimentDashboard.jsx src/routes.jsx src/lib/constants.js
git commit -m "feat: add admin sentiment dashboard"
```

---

### Task 14: Integration Verification

- [ ] **Step 1: Build entire FE**

```bash
npm run build
```
from `D:\AppleStoreMini`

Expected: Vite build succeeds with no errors.

- [ ] **Step 2: Lint check FE**

```bash
npm run lint
```
from `D:\AppleStoreMini`

Expected: no errors.

- [ ] **Step 3: Prisma check BE**

```bash
npx prisma generate
```
from `D:\AppleStoreMini_Api`

Expected: regenerates client successfully with new sentiment fields.

- [ ] **Step 4: Start BE dev server**

```bash
npm run dev
```
from `D:\AppleStoreMini_Api`

Expected: server starts, log shows `[AI] Provider: OpenCode | Model: deepseek-v4-flash | Online: YES`

- [ ] **Step 5: Commit final state**

```bash
git add .
git commit -m "chore: final verification, build + lint pass"
```

---

## Self-Review Checklist

1. Spec coverage:
   - [x] AI Provider Swap: Tasks 1-2 cover config + controller changes
   - [x] Voice Search: Tasks 8-9 cover hook + UI integration
   - [x] Chatbot: No changes needed (only BE provider swap from Tasks 1-2)
   - [x] Sentiment Review: Tasks 3-7 cover DB migration, async analysis, admin endpoint; Tasks 13 covers FE dashboard
   - [x] Personalized Recommendations: Tasks 5, 10-12 cover BE endpoint + FE component + page integration

2. Placeholder scan: No TBD, TODO, "implement later", or vague references. All code is explicit.

3. Type consistency: `analyzeSentiment` signature is `(callAIFn, content) → { sentiment, score }` in both Task 4 (service) and Task 6 (controller usage). `personalizedRecommend` endpoint returns `{ reply, products[{ slug, name, price, image, reason }] }` - consumed by `PersonalizedRecommendations` component matching same shape.
