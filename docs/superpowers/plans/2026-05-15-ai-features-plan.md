# AI Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 frontend AI components (recommendation, compare, search, review summary, admin description gen, voice input) calling new `/chat/*` backend endpoints.

**Architecture:** All components use RTK Query mutations via `aiApi.js`, follow existing shadcn/ui patterns. Each component is self-contained with loading/empty/error states. Voice input uses browser Web Speech API.

**Tech Stack:** React, Redux Toolkit Query, shadcn/ui, Web Speech API, sonner toast

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/store/api/aiApi.js` | Create | RTK Query mutations for all 5 AI endpoints |
| `src/features/ai/AIRecommendation.jsx` | Create | Product recommendation form + results |
| `src/features/ai/AIComparePanel.jsx` | Create | Product comparison UI |
| `src/features/ai/AISearchToggle.jsx` | Create | AI semantic search toggle |
| `src/features/ai/AIReviewSummary.jsx` | Create | Review sentiment summary card |
| `src/features/admin/components/products/AIDescriptionButton.jsx` | Create | Admin: generate description button |
| `src/components/shared/ChatWidget.jsx` | Modify | Add voice microphone button |
| `src/pages/ProductListPage.jsx` | Modify | Add AIRecommendation section |
| `src/pages/SearchPage.jsx` | Modify | Add AISearchToggle |
| `src/pages/ProductDetailPage.jsx` | Modify | Add AIComparePanel + AIReviewSummary |
| `src/pages/admin/AdminProductCreate.jsx` | Modify | Add AIDescriptionButton |
| `src/pages/admin/AdminProductEdit.jsx` | Modify | Add AIDescriptionButton |

---

### Task 1: Create aiApi.js — RTK Query AI Endpoints

**Files:**
- Create: `src/store/api/aiApi.js`

- [ ] **Step 1: Write aiApi.js**

```js
import { baseApi } from "./baseApi";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiRecommend: builder.mutation({
      query: (body) => ({ url: "/chat/recommend", method: "POST", body }),
    }),
    aiCompare: builder.mutation({
      query: (body) => ({ url: "/chat/compare", method: "POST", body }),
    }),
    aiSearch: builder.mutation({
      query: (body) => ({ url: "/chat/search", method: "POST", body }),
    }),
    aiReviewSummary: builder.mutation({
      query: (body) => ({ url: "/chat/review-summary", method: "POST", body }),
    }),
    aiGenerateDescription: builder.mutation({
      query: (body) => ({ url: "/chat/generate-description", method: "POST", body }),
    }),
  }),
});

export const {
  useAiRecommendMutation,
  useAiCompareMutation,
  useAiSearchMutation,
  useAiReviewSummaryMutation,
  useAiGenerateDescriptionMutation,
} = aiApi;
```

- [ ] **Step 2: Verify**

Run: `Test-Path -LiteralPath "src\store\api\aiApi.js"`

- [ ] **Step 3: Commit**

```bash
git add src/store/api/aiApi.js && git commit -m "feat: add aiApi RTK Query endpoints"
```

---

### Task 2: Create AIRecommendation.jsx — Product Recommendation

**Files:**
- Create: `src/features/ai/AIRecommendation.jsx`

- [ ] **Step 1: Create directory and write file**

First: `New-Item -ItemType Directory -Path "src\features\ai" -Force`

```jsx
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAiRecommendMutation } from "@/store/api/aiApi";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const PERSONAS = [
  { value: "student", label: "Sinh viên" },
  { value: "designer", label: "Designer" },
  { value: "developer", label: "Developer" },
  { value: "creator", label: "Content Creator" },
  { value: "gaming", label: "Gaming" },
  { value: "business", label: "Doanh nhân" },
  { value: "general", label: "Phổ thông" },
];

export default function AIRecommendation() {
  const [persona, setPersona] = useState("");
  const [budget, setBudget] = useState("");
  const [usage, setUsage] = useState("");
  const [result, setResult] = useState(null);

  const [recommend, { isLoading }] = useAiRecommendMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!persona && !usage.trim()) {
      toast.error("Vui lòng chọn đối tượng hoặc mô tả nhu cầu");
      return;
    }
    try {
      const res = await recommend({
        persona: persona || undefined,
        budget: budget ? Number(budget) : undefined,
        usage: usage.trim() || undefined,
      }).unwrap();
      setResult(res);
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-apple-blue" />
          AI Tư vấn sản phẩm
        </CardTitle>
        <CardDescription>
          Mô tả nhu cầu của bạn, AI sẽ gợi ý sản phẩm phù hợp nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Đối tượng</Label>
              <Select value={persona} onValueChange={setPersona}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngân sách (VNĐ)</Label>
              <Input
                type="number"
                placeholder="VD: 25000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả nhu cầu</Label>
            <Textarea
              placeholder="VD: Cần máy để lập trình web, edit video nhẹ, pin trâu..."
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tư vấn...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Tư vấn ngay
              </>
            )}
          </Button>
        </form>

        {isLoading && (
          <div className="mt-6 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-6 space-y-4">
            {result.reply && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.reply}</p>
              </div>
            )}
            {result.products && result.products.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.products.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/products/${p.slug}`}
                    className="rounded-xl border border-border p-4 transition-colors hover:border-apple-blue/50 hover:bg-muted/50"
                  >
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="mb-3 h-32 w-full rounded-lg object-contain"
                      />
                    )}
                    <h4 className="text-sm font-medium text-foreground">{p.name}</h4>
                    <p className="mt-1 text-sm font-semibold text-apple-blue">
                      {p.price ? formatPrice(p.price) : "Liên hệ"}
                    </p>
                    {p.reason && (
                      <p className="mt-1 text-xs text-muted-foreground">{p.reason}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/ai/AIRecommendation.jsx && git commit -m "feat: add AI product recommendation component"
```

---

### Task 3: Create AIComparePanel.jsx — Product Comparison

**Files:**
- Create: `src/features/ai/AIComparePanel.jsx`

- [ ] **Step 1: Write file**

```jsx
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAiCompareMutation } from "@/store/api/aiApi";
import { toast } from "sonner";

export default function AIComparePanel({ currentProduct, products }) {
  const [compareSlug, setCompareSlug] = useState("");
  const [result, setResult] = useState(null);

  const [compare, { isLoading }] = useAiCompareMutation();

  const allProducts = products || [];

  const handleCompare = async () => {
    const targetProduct = allProducts.find((p) => p.slug === compareSlug);
    if (!targetProduct) {
      toast.error("Không tìm thấy sản phẩm để so sánh");
      return;
    }
    if (compareSlug === currentProduct?.slug) {
      toast.error("Vui lòng chọn sản phẩm khác để so sánh");
      return;
    }
    try {
      const res = await compare({
        products: [
          { name: currentProduct?.name || "", specs: JSON.stringify(currentProduct?.specifications || {}) },
          { name: targetProduct.name || "", specs: JSON.stringify(targetProduct.specifications || {}) },
        ],
      }).unwrap();
      setResult(res);
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-apple-blue" />
          AI So sánh sản phẩm
        </CardTitle>
        <CardDescription>
          Chọn sản phẩm để AI phân tích ưu nhược điểm và đưa ra gợi ý
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Sản phẩm hiện tại</p>
            <Input value={currentProduct?.name || ""} disabled className="bg-muted" />
          </div>
          <div className="hidden sm:block self-end pb-0.5 text-muted-foreground">
            VS
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Sản phẩm so sánh</p>
            <Input
              placeholder="Nhập tên sản phẩm..."
              value={compareSlug}
              onChange={(e) => setCompareSlug(e.target.value)}
              list="compare-products"
            />
            <datalist id="compare-products">
              {allProducts
                .filter((p) => p.slug !== currentProduct?.slug)
                .map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
            </datalist>
          </div>
          <Button onClick={handleCompare} disabled={isLoading || !compareSlug} className="rounded-full shrink-0">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isLoading ? "Đang so sánh..." : "So sánh"}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            {result.reply && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.reply}</p>
              </div>
            )}
            {result.comparison && (
              <div className="space-y-4">
                {result.comparison.advantages && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                    <p className="mb-2 flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> Ưu điểm
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                      {result.comparison.advantages}
                    </p>
                  </div>
                )}
                {result.comparison.disadvantages && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                    <p className="mb-2 flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400">
                      <XCircle className="h-4 w-4" /> Nhược điểm
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap">
                      {result.comparison.disadvantages}
                    </p>
                  </div>
                )}
                {result.comparison.verdict && (
                  <div className="rounded-xl border border-apple-blue/30 bg-apple-blue/5 p-4">
                    <p className="mb-1 text-sm font-medium text-apple-blue">Kết luận</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {result.comparison.verdict}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/ai/AIComparePanel.jsx && git commit -m "feat: add AI product comparison component"
```

---

### Task 4: Create AISearchToggle.jsx — Semantic Search

**Files:**
- Create: `src/features/ai/AISearchToggle.jsx`

- [ ] **Step 1: Write file**

```jsx
import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AISearchToggle({ onSearch, isLoading }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id="ai-search"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <Label htmlFor="ai-search" className="flex items-center gap-1 text-sm cursor-pointer">
          <Sparkles className="h-3.5 w-3.5 text-apple-blue" />
          AI Search
        </Label>
      </div>
      {enabled && (
        <span className="text-xs text-muted-foreground">
          Tìm kiếm bằng ngôn ngữ tự nhiên
        </span>
      )}
    </div>
  );
}

export { AISearchToggle };
```

But this component is not just a toggle — it's supposed to be integrated into SearchPage to intercept the search submit. The actual logic goes into SearchPage. Let me create the component as a simple toggle indicator, and the SearchPage modification handles the API call.

Actually, a simpler approach: AISearchToggle just renders the toggle UI and exposes its state via `onToggle`. The parent (SearchPage) handles the API call.

- [ ] **Step 1: Write AISearchToggle.jsx (simplified)**

```jsx
import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AISearchToggle({ enabled, onToggle, disabled }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id="ai-search"
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
        <Label htmlFor="ai-search" className="flex items-center gap-1 text-sm cursor-pointer">
          <Sparkles className="h-3.5 w-3.5 text-apple-blue" />
          Tìm kiếm AI
        </Label>
      </div>
      {enabled && (
        <span className="text-xs text-muted-foreground">
          Gõ mô tả tự nhiên, AI sẽ tìm sản phẩm phù hợp
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/ai/AISearchToggle.jsx && git commit -m "feat: add AI semantic search toggle component"
```

---

### Task 5: Create AIReviewSummary.jsx — Review Insights

**Files:**
- Create: `src/features/ai/AIReviewSummary.jsx`

- [ ] **Step 1: Write file**

```jsx
import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiReviewSummaryMutation } from "@/store/api/aiApi";
import { toast } from "sonner";

export default function AIReviewSummary({ productSlug, reviews }) {
  const [result, setResult] = useState(null);
  const [summarize, { isLoading }] = useAiReviewSummaryMutation();

  const hasReviews = reviews && reviews.length > 0;

  const handleSummarize = async () => {
    try {
      const res = await summarize({
        productSlug,
        reviews: reviews.map((r) => ({
          rating: r.rating,
          comment: r.comment || r.content || "",
          createdAt: r.createdAt,
        })),
      }).unwrap();
      setResult(res);
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  };

  useEffect(() => { setResult(null); }, [productSlug]);

  if (!hasReviews) return null;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-apple-blue" />
          AI Tổng hợp đánh giá
        </CardTitle>
        <CardDescription>
          AI phân tích và tóm tắt cảm nhận của khách hàng về sản phẩm này
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <Button
            onClick={handleSummarize}
            disabled={isLoading}
            variant="outline"
            className="rounded-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Phân tích đánh giá
              </>
            )}
          </Button>
        )}

        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.sentiment && (
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg bg-green-100 p-3 text-center dark:bg-green-950/30">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {Math.round(result.sentiment.positive)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Tích cực</p>
                </div>
                <div className="flex-1 rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-bold text-muted-foreground">
                    {Math.round(result.sentiment.neutral)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Trung tính</p>
                </div>
                <div className="flex-1 rounded-lg bg-red-100 p-3 text-center dark:bg-red-950/30">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {Math.round(result.sentiment.negative)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Tiêu cực</p>
                </div>
              </div>
            )}
            {result.summary && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.summary}</p>
              </div>
            )}
            {result.highlights && result.highlights.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Điểm nổi bật</p>
                <ul className="space-y-1">
                  {result.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-apple-blue" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/ai/AIReviewSummary.jsx && git commit -m "feat: add AI review summary component"
```

---

### Task 6: Create AIDescriptionButton.jsx — Admin Description Generator

**Files:**
- Create: `src/features/admin/components/products/AIDescriptionButton.jsx`

- [ ] **Step 1: Write file**

```jsx
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAiGenerateDescriptionMutation } from "@/store/api/aiApi";
import { toast } from "sonner";

const STYLES = [
  { value: "seo", label: "Chuẩn SEO" },
  { value: "short", label: "Ngắn gọn" },
  { value: "apple", label: "Apple Style" },
];

export default function AIDescriptionButton({ productName, specs, onDescriptionGenerated }) {
  const [generate, { isLoading }] = useAiGenerateDescriptionMutation();

  const handleGenerate = async (style) => {
    try {
      const res = await generate({
        productName: productName || "",
        specs: specs || "",
        style,
      }).unwrap();
      if (res.description) {
        onDescriptionGenerated(res.description);
        toast.success("Đã tạo mô tả");
      }
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={isLoading || !productName}
        >
          {isLoading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 h-4 w-4" />
          )}
          {isLoading ? "Đang tạo..." : "Tạo mô tả AI"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STYLES.map((s) => (
          <DropdownMenuItem key={s.value} onClick={() => handleGenerate(s.value)}>
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/components/products/AIDescriptionButton.jsx && git commit -m "feat: add AI description generator button for admin"
```

---

### Task 7: Add Voice Input to ChatWidget.jsx

**Files:**
- Modify: `src/components/shared/ChatWidget.jsx`

- [ ] **Step 1: Add voice input**

Read the file. Add after the existing send button (inside the form, before the textarea/submit area), add a microphone button:

Add import: `import { Mic, MicOff } from "lucide-react";`

Add state after existing states:
```js
const [isListening, setIsListening] = useState(false);
const [recognition, setRecognition] = useState(null);
```

Add init/cleanup:
```js
useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const rec = new SpeechRecognition();
    rec.lang = "vi-VN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setValue(transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    setRecognition(rec);
  }
}, []);
```

Add toggle function:
```js
const toggleVoice = () => {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
    setIsListening(false);
  } else {
    recognition.start();
    setIsListening(true);
  }
};
```

Add microphone button in the JSX (inside the form, after the Textarea, next to the send button):
```jsx
{recognition && (
  <button
    type="button"
    onClick={toggleVoice}
    className={cn(
      "shrink-0 rounded-full p-2 transition-colors",
      isListening ? "bg-red-500 text-white animate-pulse" : "text-muted-foreground hover:text-foreground",
    )}
  >
    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
  </button>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/ChatWidget.jsx && git commit -m "feat: add voice input to AI chat widget"
```

---

### Task 8: Page Integrations

**Files:**
- Modify: `src/pages/ProductListPage.jsx` — add AIRecommendation
- Modify: `src/pages/SearchPage.jsx` — add AISearchToggle + AI search logic
- Modify: `src/pages/ProductDetailPage.jsx` — add AIComparePanel + AIReviewSummary
- Modify: `src/pages/admin/AdminProductCreate.jsx` — add AIDescriptionButton
- Modify: `src/pages/admin/AdminProductEdit.jsx` — add AIDescriptionButton

- [ ] **Step 1: ProductListPage — add AIRecommendation**

Add import at top:
```js
import AIRecommendation from "@/features/ai/AIRecommendation";
```

Add before the product grid section (before `{products.length === 0 && !isLoading ? (...)`), add:
```jsx
<AIRecommendation />
```

- [ ] **Step 2: SearchPage — add AI search**

Add imports:
```js
import { useState } from "react";
import AISearchToggle from "@/features/ai/AISearchToggle";
import { useAiSearchMutation } from "@/store/api/aiApi";
```

Add state:
```js
const [aiMode, setAiMode] = useState(false);
const [aiSearch, { isLoading: isAiLoading }] = useAiSearchMutation();
const [aiProducts, setAiProducts] = useState(null);
```

Modify `handleSearch`:
```js
const handleSearch = async (e) => {
  e.preventDefault();
  if (aiMode && inputValue.trim()) {
    try {
      const res = await aiSearch({ query: inputValue.trim() }).unwrap();
      setAiProducts(res.products || []);
      const params = new URLSearchParams();
      params.set("q", inputValue.trim());
      setSearchParams(params);
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  } else {
    setAiProducts(null);
    const params = new URLSearchParams();
    if (inputValue.trim()) params.set("q", inputValue.trim());
    setSearchParams(params);
  }
  setPage(1);
};
```

Add `AISearchToggle` after the search form:
```jsx
<AISearchToggle enabled={aiMode} onToggle={setAiMode} disabled={isAiLoading} />
```

When `aiMode` is on and there are `aiProducts`, show those products instead of the regular search results. Replace `products` usage: `const products = aiMode && aiProducts ? aiProducts : data?.products || [];`

Add toast import if not present: `import { toast } from "sonner";`

- [ ] **Step 3: ProductDetailPage — add AIComparePanel + AIReviewSummary**

Add imports:
```js
import AIComparePanel from "@/features/ai/AIComparePanel";
import AIReviewSummary from "@/features/ai/AIReviewSummary";
import { useGetProductsQuery } from "@/store/api/productsApi";
```

Fetch all products for compare search (add after existing hooks):
```js
const { data: allProductsData } = useGetProductsQuery({ limit: 100, sort: "featured" });
const allProducts = allProductsData?.products || [];
```

Add after `ProductComments` (before RelatedProducts):
```jsx
<Separator className="my-12" />
<AIComparePanel currentProduct={product} products={allProducts} />
<AIReviewSummary productSlug={slug} reviews={product.comments || product.reviews || []} />
```

- [ ] **Step 4: AdminProductCreate + AdminProductEdit — add AIDescriptionButton**

Read both files to find description textarea, add import and button next to it.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProductListPage.jsx src/pages/SearchPage.jsx src/pages/ProductDetailPage.jsx src/pages/admin/AdminProductCreate.jsx src/pages/admin/AdminProductEdit.jsx && git commit -m "feat: integrate AI components into pages"
```

---

### Task 9: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Check lint**

```bash
npm run lint
```
