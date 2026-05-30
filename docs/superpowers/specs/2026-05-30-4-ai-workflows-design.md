# 4 AI Workflows — Design Spec

**Date:** 2026-05-30  
**Branch:** main  
**Status:** Design approved — awaiting implementation plan

---

## Overview

Add 4 AI-powered features to AppleStoreMini. Replace current Groq AI provider with OpenCode API (deepseek-v4-flash). All 4 features reuse existing infrastructure patterns where possible.

---

## Architecture

```
FRONTEND (D:\AppleStoreMini)
├── src/features/ai/
│   └── (existing: ChatWidget, AIRecommendation, AIComparePanel, AISearchToggle, AIReviewSummary)
├── src/features/products/
│   ├── hooks/useVoiceSearch.js           # NEW: Web Speech API hook
│   └── PersonalizedRecommendations.jsx    # NEW: horizontal scroll product cards
├── src/features/admin/components/reviews/
│   └── SentimentDashboard.jsx            # NEW: admin sentiment dashboard
├── src/store/api/
│   ├── aiApi.js                          # MODIFY: +2 endpoints
│   └── productReviewApi.js               # MODIFY: +sentiment endpoint
├── src/components/shared/
│   ├── SearchOverlay.jsx                 # MODIFY: +voice button
│   └── ChatWidget.jsx                    # KEEP AS-IS
├── src/components/layout/
│   └── NavbarSearch.jsx                  # MODIFY: +voice button
├── src/pages/
│   ├── HomePage.jsx                      # MODIFY: +PersonalizedRecommendations
│   └── ProductDetailPage.jsx             # MODIFY: +PersonalizedRecommendations
├── src/routes.jsx                        # MODIFY: +admin sentiment route
└── src/lib/constants.js                  # MODIFY: +ROUTES.ADMIN_SENTIMENT

BACKEND (D:\AppleStoreMini_Api)
├── prisma/schema.prisma                  # MODIFY: +sentiment fields on ProductReview
├── src/config/
│   └── ai.js                             # NEW: OpenCode API client config
├── src/services/
│   └── chat.service.js                   # MODIFY: swap Groq→OpenCode, +2 methods
├── src/controllers/
│   ├── chat.controller.js                # MODIFY: +personalized, +sentiment endpoints
│   └── productReview.controller.js       # MODIFY: async sentiment after submit
└── src/routes/
    └── index.js                          # MODIFY: +2 chat routes
```

**Data flow pattern:**
```
FE Component → RTK Query mutation → POST /api/chat/* → BE Controller
  → ChatService → OpenCode API (deepseek-v4-flash) → Response → FE renders
```

---

## Pre-requisite: Swap AI Provider (Groq → OpenCode)

### BE: `src/config/ai.js` (NEW)
```
OpenCode API config:
  Base URL: https://api.opencode.ai/v1/chat/completions
  API Key: sk-2JeqLtJtGMufCzS8rV6Jwx01bCyqs1oXUyEUKdkhtISNlslgdbh4PCprAFjwGYF6
  Model: deepseek-v4-flash (free tier)
  Default params: temperature=0.2, max_tokens=800, timeout=20s
```

### BE: `src/services/chat.service.js` (MODIFY)
- Replace all Groq API calls with OpenCode API calls
- Same OpenAI-compatible format (both use `/v1/chat/completions`)
- Keep existing method signatures: `chat()`, `recommend()`, `compare()`, `search()`, `reviewSummary()`, `generateDescription()`
- ADD 2 new methods: `analyzeSentiment()`, `personalizedRecommend()`
- Keep graceful fallback behavior for all endpoints

---

## Feature 1: Voice Search

### Purpose
User clicks microphone in search bar → speaks → text fills input → auto search.

### Frontend

**`src/features/products/hooks/useVoiceSearch.js`** (NEW)
```js
useVoiceSearch({ onResult: (text) => void, lang: 'vi-VN' })
  → Returns { isListening, startListening, stopListening, isSupported, error }
```
- Uses `window.SpeechRecognition` / `window.webkitSpeechRecognition`
- `lang='vi-VN'`, `continuous=false`, `interimResults=false`
- `onresult` → transcript → `onResult(transcript)`
- `onerror` → set error state
- `isSupported` check for graceful fallback

**NavbarSearch.jsx / SearchOverlay.jsx** (MODIFY)
- Add `<MicButton>` inside search input (right side)
- Icon: `Mic` (lucide-react) when idle, `MicOff` when not supported
- Listening state: pulsing red animation, tooltip "Đang nghe..."
- Click → `startListening()` / `stopListening()`
- On result → `setSearchQuery(text)` → triggers existing search flow
- Hide button when `!isSupported`

### Backend
No changes. Voice is input method only. Existing `/api/chat/search` and `/api/products/search` work as-is.

---

## Feature 2: Chatbot (Keep As-Is)

### Purpose
Fully functional chatbot already exists. Only change is backend provider swap (Groq → OpenCode).

### Frontend
No changes to `ChatWidget.jsx`, `chatProductFilter.js`, or any chat-related components.

### Backend
`POST /api/chat` — same logic, different AI provider. System prompt, product search, filtering all unchanged.

---

## Feature 3: Sentiment Review

### Purpose
After user submits a review, analyze sentiment asynchronously and store per-review sentiment data. Admin sees sentiment dashboard.

### Database

**`prisma/schema.prisma`** (MODIFY — ProductReview model)
```prisma
model ProductReview {
  // ... existing fields unchanged ...
  sentiment      String?   // "positive" | "negative" | "neutral"
  sentimentScore Float?    // 0.0 – 1.0
}
```
- Both nullable (backward compatible with existing reviews)
- Migration: `ALTER TABLE` adds columns with NULL default
- Existing reviews can be backfilled later via admin action or script

### Backend Flow

```
POST /api/reviews/:productId (user submits review)
  → Controller saves review to DB (existing logic)
  → Return 200 success immediately (NO WAIT for AI)
  ──
  → (async, non-blocking) ChatService.analyzeSentiment(review.content)
    → POST OpenCode API:
        System: "Analyze sentiment. Return JSON: {sentiment: 'positive'|'negative'|'neutral', score: float 0-1}"
        User: review content
    → Parse response → { sentiment, score }
    → Update ProductReview record: SET sentiment=?, sentimentScore=?
```

### New Endpoints

**`POST /api/chat/sentiment`** — Standalone sentiment analysis
```
Body: { content: string }
Response: { sentiment: string, score: number }
```
Use: batch processing, manual admin trigger

**`GET /api/admin/reviews/sentiment?productId=&from=&to=`** (or reuse admin review routes)
```
Response: {
  overview: { positive: n, negative: n, neutral: n, averageScore: float },
  products: [{ productId, name, positive, negative, neutral, averageScore }]
}
```

### Frontend - Admin Dashboard

**`src/features/admin/components/reviews/SentimentDashboard.jsx`** (NEW)

UI sections:
1. **Overview cards**: Total reviews, positive % (green), negative % (red), neutral % (gray), average score
2. **Pie chart** (Recharts): sentiment distribution
3. **Product table**: columns = Product Name | Positive | Negative | Neutral | Avg Score
   - Sortable by any column
   - Click product → filter to that product's reviews
4. **Time filter**: date range picker (optional)

Route: `/admin/reviews/sentiment`

**`src/store/api/productReviewApi.js`** (MODIFY)
```js
getSentimentStats: builder.query({
  query: (params) => ({ url: '/admin/reviews/sentiment', params })
})
```

### Frontend - Review Display (Optional Enhancement)
- On existing `ProductCommentItem.jsx`: show sentiment badge (✅ positive / ⚠️ negative / ➖ neutral) next to rating stars
- Only if `review.sentiment` is not null

---

## Feature 4: Personalized Recommendations

### Purpose
Show "Có thể bạn thích..." section with AI-recommended products based on user's purchase history. Horizontal scroll carousel on homepage and product detail page.

### Backend

**`POST /api/chat/personalized`** (NEW)
```
Input:
  Body: {} (userId extracted from JWT token, optional)
  
Flow:
  1. If authenticated user:
     - Fetch user's order history (products, categories, price ranges)
     - If no orders → fallback to top 10 best-selling products
  2. If anonymous:
     - Fetch top 10 best-selling products
  3. Send to OpenCode AI:
     System: "You are a product recommendation AI. Analyze purchase history and suggest
              relevant products from the catalog. Return JSON with products array.
              Each product: slug, reason (1 sentence in Vietnamese why recommend)."
     User: purchase history + available products catalog (ID, name, category, price)
  4. AI returns: { products: [{ slug, name, price, image, reason }] }
  5. Validate slugs exist in DB, attach full product info
  
Output:
  { products: [{ id, name, slug, price, salePrice, image, reason }] }
  (4-8 products)
```

**`src/services/chat.service.js`** — ADD `personalizedRecommend(userId)` method
**`src/controllers/chat.controller.js`** — ADD handler for `POST /api/chat/personalized`

### Frontend

**`src/features/products/PersonalizedRecommendations.jsx`** (NEW)
```jsx
<PersonalizedRecommendations context="homepage" />  // or "product-detail"
```
- Calls `usePersonalizedRecommendMutation()` on mount
- **Loading**: skeleton horizontal scroll (4 placeholder cards)
- **Empty**: "Chưa có gợi ý" hidden section
- **Error**: hidden section (fail silently)
- **Success**: 
  ```
  ┌─ "🎯 Có thể bạn thích..." ─────────────────────┐
  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     →→→   │
  │ │ img  │ │ img  │ │ img  │ │ img  │           │
  │ │ name │ │ name │ │ name │ │ name │           │
  │ │price │ │price │ │price │ │price │           │
  │ │reason│ │reason│ │reason│ │reason│           │
  │ └──────┘ └──────┘ └──────┘ └──────┘           │
  └────────────────────────────────────────────────┘
  ```
- Horizontal scroll with CSS `overflow-x: auto` + `scroll-snap-type: x mandatory`
- Each card: image, name, price, reason badge (italic, subtle), links to product detail
- Reuse `ProductCard` component style or simplified variant

**`src/store/api/aiApi.js`** (MODIFY)
```js
personalizedRecommend: builder.mutation({
  query: () => ({ url: '/chat/personalized', method: 'POST', body: {} })
})
```

### Placement

**HomePage.jsx** (MODIFY)
- Add `<PersonalizedRecommendations context="homepage" />` after existing product sliders

**ProductDetailPage.jsx** (MODIFY)
- Add `<PersonalizedRecommendations context="product-detail" />` after `<RelatedProducts />`

---

## Error Handling & States

| State | Voice Search | Chatbot | Sentiment | Recommendations |
|-------|-------------|---------|-----------|-----------------|
| **Loading** | Pulsing mic icon | Typing dots | N/A (async bg) | Skeleton carousel |
| **Success** | Text fills input | Chat bubble + cards | Sentiment stored | Product carousel |
| **Empty** | N/A | "Không tìm thấy SP" | N/A (no reviews) | Hidden section |
| **Error** | Toast + mic reset | Toast + retry | Silent fail (log) | Hidden section |
| **Not Supported** | Hide mic button | N/A | N/A | Fallback best-sellers |

---

## Files Changed Summary

### Backend (D:\AppleStoreMini_Api)

| File | Action | Change |
|------|--------|--------|
| `src/config/ai.js` | **NEW** | OpenCode API client config |
| `src/services/chat.service.js` | **MODIFY** | Groq→OpenCode, +analyzeSentiment(), +personalizedRecommend() |
| `src/controllers/chat.controller.js` | **MODIFY** | +personalized, +sentiment handlers |
| `src/controllers/productReview.controller.js` | **MODIFY** | Async sentiment after review create |
| `prisma/schema.prisma` | **MODIFY** | +sentiment, +sentimentScore on ProductReview |
| `src/routes/index.js` | **MODIFY** | +2 chat routes |
| Prisma migration | **NEW** | Add sentiment columns |

### Frontend (D:\AppleStoreMini)

| File | Action | Change |
|------|--------|--------|
| `src/features/products/hooks/useVoiceSearch.js` | **NEW** | Web Speech API hook |
| `src/features/products/PersonalizedRecommendations.jsx` | **NEW** | Recommendation carousel |
| `src/features/admin/components/reviews/SentimentDashboard.jsx` | **NEW** | Admin sentiment dashboard |
| `src/components/shared/SearchOverlay.jsx` | **MODIFY** | +mic button |
| `src/components/layout/NavbarSearch.jsx` | **MODIFY** | +mic button |
| `src/pages/HomePage.jsx` | **MODIFY** | +PersonalizedRecommendations |
| `src/pages/ProductDetailPage.jsx` | **MODIFY** | +PersonalizedRecommendations |
| `src/store/api/aiApi.js` | **MODIFY** | +personalizedRecommend mutation |
| `src/store/api/productReviewApi.js` | **MODIFY** | +getSentimentStats query |
| `src/routes.jsx` | **MODIFY** | +admin sentiment route |
| `src/lib/constants.js` | **MODIFY** | +ROUTES.ADMIN_SENTIMENT |

---

## Implementation Order

1. **BE: AI Provider Swap** — OpenCode config + chat.service.js refactor
2. **BE: Sentiment** — Prisma migration + async sentiment on review submit
3. **BE: Personalized** — `/api/chat/personalized` endpoint
4. **FE: Voice Search** — useVoiceSearch hook + NavbarSearch/SearchOverlay mic button
5. **FE: Personalized Recs** — PersonalizedRecommendations component + page placements
6. **FE: Sentiment Dashboard** — Admin dashboard + routes + API slice
7. **Integration testing** — End-to-end flow verification

---

## Out of Scope

- Voice input for ChatWidget (already exists per 2026-05-15 spec)
- Product view tracking / browsing history table (decided: use order history only)
- AI chatbot memory/conversation persistence
- Real-time sentiment processing queue (uses simple async fire-and-forget)
- Batch backfill sentiment for existing reviews
