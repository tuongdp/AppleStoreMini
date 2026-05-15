# AI Features — Design Spec

**Date:** 2026-05-15  
**Branch:** main  
**Status:** Design approved — awaiting implementation plan

---

## Overview

Add frontend UI components for 3 AI sub-projects that call backend chat endpoints. All AI logic is on the backend; frontend handles UI, loading/error states, and data display.

---

## Architecture

```
src/
├── store/api/
│   └── aiApi.js                            # NEW: RTK Query endpoints
├── features/ai/                            # NEW: AI feature components
│   ├── AIRecommendation.jsx                 # A1: Product recommendation form+result
│   ├── AIComparePanel.jsx                   # A2: Product comparison UI
│   ├── AISearchToggle.jsx                   # A3: AI search toggle
│   └── AIReviewSummary.jsx                  # C1: Review sentiment summary
├── features/admin/components/products/
│   └── AIDescriptionButton.jsx              # B1: AI generate description button
├── components/shared/
│   └── ChatWidget.jsx                       # MODIFY: add voice input button
└── pages/
    ├── ProductListPage.jsx                  # MODIFY: add AIRecommendation section
    ├── SearchPage.jsx                       # MODIFY: add AISearchToggle
    ├── ProductDetailPage.jsx                # MODIFY: add AIComparePanel + AIReviewSummary
    └── admin/AdminProductCreate.jsx         # MODIFY: add AIDescriptionButton
    └── admin/AdminProductEdit.jsx           # MODIFY: add AIDescriptionButton
```

**Data flow:** Component → RTK Query mutation → POST to endpoint → render response. All endpoints return `{ reply, products[], ...other }` format.

---

## Sub-project A: AI Shopping Assistant

### A1. AIRecommendation.jsx

**Location:** `src/features/ai/AIRecommendation.jsx`  
**Rendered in:** `ProductListPage.jsx` (below filters) + optionally HomePage

**UI:**
- Form with: persona dropdown (Sinh viên/Designer/Developer/Content Creator/Gaming), budget input (VND), usage textarea
- "Tư vấn AI" submit button → calls API
- Result card: AI reply text + grid of recommended products with name, price, image, reason badge

**API:**
```
POST /chat/recommend
Body: { persona: string, budget: number, usage: string }
Response: { reply: string, products: [{ slug, name, price, image, score, reason }] }
```

**States:** Empty (form shown), Loading (skeleton), Result (products grid), Error (toast)

### A2. AIComparePanel.jsx

**Location:** `src/features/ai/AIComparePanel.jsx`  
**Rendered in:** `ProductDetailPage.jsx` (below specs, as accordion section)

**UI:**
- Product selector: current product + "Chọn sản phẩm để so sánh" search input
- "So sánh AI" button
- Result: comparison table (feature differences), pros/cons per product, verdict text

**API:**
```
POST /chat/compare
Body: { products: [{ name, specs: string }] }
Response: { reply: string, comparison: { differences: [], advantages: string, disadvantages: string, verdict: string } }
```

### A3. AISearchToggle.jsx

**Location:** `src/features/ai/AISearchToggle.jsx`  
**Rendered in:** `SearchPage.jsx` (inline with search bar)

**UI:**
- Toggle switch "AI Search" next to search input
- When ON: search input becomes natural language style (placeholder: "VD: iPhone pin trâu chụp đẹp dưới 20 triệu")
- Submit sends to `/chat/search` instead of regular product search
- Results shown via regular product listing

**API:**
```
POST /chat/search
Body: { query: string }
Response: { reply: string, products: [{ slug, name, price, image }] }
```

### A4. Voice Input (ChatWidget.jsx modification)

**Location:** `src/components/shared/ChatWidget.jsx`

**UI:**
- Microphone button next to send button
- Uses Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- On start: button turns red/pulsing, text shows "Đang nghe..."
- On result: fills input text, sends message
- Fallback if browser doesn't support: hide button, no error

---

## Sub-project B: AI Admin Tools

### B1. AIDescriptionButton.jsx

**Location:** `src/features/admin/components/products/AIDescriptionButton.jsx`  
**Rendered in:** `AdminProductForm.jsx` (next to description textarea in both create and edit)

**UI:**
- Button "Tạo mô tả AI" with sparkle icon
- Click → dropdown select style: "Chuẩn SEO" / "Ngắn gọn" / "Apple style"
- Calls API → fills description textarea
- Loading spinner in button while generating

**Props:** `{ productName: string, specs: string, onDescriptionGenerated: (text: string) => void }`

**API:**
```
POST /chat/generate-description
Body: { productName: string, specs: string, style: "seo" | "short" | "apple" }
Response: { description: string }
```

---

## Sub-project C: AI Review Insights

### C1. AIReviewSummary.jsx

**Location:** `src/features/ai/AIReviewSummary.jsx`  
**Rendered in:** `ProductDetailPage.jsx` (below reviews section)

**UI:**
- Card with title "AI Tổng hợp đánh giá"
- Sentiment bar: green (positive %) / gray (neutral %) / red (negative %)
- Summary text
- Highlights list (bullet points)

**Props:** `{ productSlug: string, reviews: [{ rating, comment, createdAt }] }`

**API:**
```
POST /chat/review-summary
Body: { productSlug: string, reviews: [{ rating: number, comment: string, createdAt: string }] }
Response: { summary: string, sentiment: { positive: number, neutral: number, negative: number }, highlights: [string] }
```

---

## Shared: aiApi.js

**Location:** `src/store/api/aiApi.js`

RTK Query API slice injecting into `baseApi`:

```js
endpoints: (builder) => ({
  aiRecommend: builder.mutation({ query: (body) => ({ url: "/chat/recommend", method: "POST", body }) }),
  aiCompare: builder.mutation({ query: (body) => ({ url: "/chat/compare", method: "POST", body }) }),
  aiSearch: builder.mutation({ query: (body) => ({ url: "/chat/search", method: "POST", body }) }),
  aiReviewSummary: builder.mutation({ query: (body) => ({ url: "/chat/review-summary", method: "POST", body }) }),
  aiGenerateDescription: builder.mutation({ query: (body) => ({ url: "/chat/generate-description", method: "POST", body }) }),
})
```

All mutations return raw response (no `transformResponse` — backend returns `{ reply, ... }` directly).

---

## Error Handling

- All mutations: try/catch in component → `toast.error("Không thể kết nối AI, vui lòng thử lại")`
- Loading state: Skeleton or spinner per component
- Empty response (no products): "Không tìm thấy sản phẩm phù hợp"
- Network error: same error toast as ChatWidget

---

## Implementation Order

1. `src/store/api/aiApi.js` — RTK Query endpoints
2. `src/features/ai/AIRecommendation.jsx` — Product recommendation
3. `src/features/ai/AIComparePanel.jsx` — Product comparison
4. `src/features/ai/AISearchToggle.jsx` — AI search
5. `src/features/ai/AIReviewSummary.jsx` — Review summary
6. `src/features/admin/components/products/AIDescriptionButton.jsx` — Admin description gen
7. `src/components/shared/ChatWidget.jsx` — Voice input
8. Page integrations (ProductListPage, SearchPage, ProductDetailPage, AdminProductForm)

---

## Out of Scope

- Backend chat endpoint implementation
- AI model selection/prompt engineering
- OCR hóa đơn
- AI banner generation
- AI cá nhân hóa (personalization)
