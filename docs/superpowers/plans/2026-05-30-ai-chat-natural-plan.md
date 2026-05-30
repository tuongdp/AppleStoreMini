# AI Chat Natural Conversation - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AI chat replies more natural and conversational by rewriting the system prompt, adding conversation history, and tuning temperature/tokens.

**Architecture:** Three file changes across two repos. BE: update AI config (temperature, tokens) and rewrite chat controller (system prompt + history handling). FE: send last 20 messages as history with each API call.

**Tech Stack:** Node.js/Express (BE), React (FE), Groq API (llama-3.3-70b-versatile)

---

### Task 1: BE - Update AI temperature and max tokens

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\config\ai.js:5-6`

- [ ] **Step 1: Update AI_MAX_TOKENS and AI_TEMPERATURE**

```js
const AI_MAX_TOKENS = 1200;
const AI_TEMPERATURE = 0.5;
```

- [ ] **Step 2: Verify the file parses**

Run: `node -e "const c = require('./src/config/ai'); console.log('tokens:', c.AI_MAX_TOKENS, 'temp:', c.AI_TEMPERATURE)"`
Workdir: `D:\AppleStoreMini_Api`
Expected: `tokens: 1200 temp: 0.5`

- [ ] **Step 3: Commit**

```powershell
git add src/config/ai.js
git commit -m "feat(ai): increase temperature to 0.5 and max_tokens to 1200"
```
Workdir: `D:\AppleStoreMini_Api`

---

### Task 2: BE - Rewrite system prompt + add conversation history

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\controllers\chat.controller.js:75-96` (prompt)
- Modify: `D:\AppleStoreMini_Api\src\controllers\chat.controller.js:98-123` (chat handler)

- [ ] **Step 1: Replace SYSTEM_CHAT_FOCUSED prompt (lines 75-96)**

Replace the entire block from `const SYSTEM_CHAT_FOCUSED = [` through `].join(" ");` with:

```js
const SYSTEM_CHAT_FOCUSED = [
    "Bạn là nhân viên tư vấn của Apple Store Mini tại Việt Nam.",
    "Xưng \"em\", gọi khách \"anh/chị\". Giọng thân thiện, tự nhiên, nhiệt tình.",
    "Trả lời ngắn gọn, vào thẳng nhu cầu khách. Không dùng emoji.",
    "Nếu khách mô tả chưa rõ, được phép hỏi lại để làm rõ nhu cầu.",

    "CÁCH TƯ VẤN:",
    "- Khách nói nhu cầu chung (vd: \"cần máy chụp ảnh đẹp\", \"máy nhẹ mang đi làm\"):",
    "  tự suy luận dòng sản phẩm phù hợp từ danh sách, gợi ý 2-3 sản phẩm kèm lý do.",
    "- Khách hỏi model cụ thể: giới thiệu model đó + 1-2 điểm nổi bật + giá.",
    "- Khách đưa ngân sách: gợi ý 2-3 sản phẩm phù hợp nhất tầm giá.",
    "- Nếu danh sách trống hoặc không có sản phẩm Apple liên quan:",
    "  \"Dạ hiện cửa hàng mình chưa có sản phẩm đó ạ. Anh/chị cần em tư vấn thêm gì không ạ?\"",

    "DỮ LIỆU:",
    "- Chỉ dùng giá, tồn kho, thông số từ danh sách sản phẩm được cung cấp.",
    "- Tuyệt đối không bịa giá hay thông số. Nói đúng dữ liệu thực tế.",
    "- Nếu có lịch sử hội thoại phía trên, dùng nó để hiểu ngữ cảnh, không hỏi lại điều đã biết.",
    "- Luôn trả lời bằng tiếng Việt.",
].join(" ");
```

- [ ] **Step 2: Replace chat handler to accept and insert history (lines 98-123)**

Replace the entire `chat` function body:

```js
const chat = catchAsync(async (req, res) => {
    const { message, history } = req.body;
    if (!message?.trim()) { throw new ApiError(400, "Vui lòng nhập tin nhắn"); }

    const products = await searchProducts(message);

    if (!aiOnline) {
        return res.json(new ApiResponse(200, { reply: buildReply(products, message), products: mapProducts(products), aiOnline: false }, "Thành công"));
    }

    if (!products.length) {
        return res.json(new ApiResponse(200, { reply: buildReply(products, message), products: [], aiOnline: false }, "Thành công"));
    }

    const msgs = [{ role: "system", content: SYSTEM_CHAT_FOCUSED }];

    if (Array.isArray(history)) {
        for (const item of history.slice(-20)) {
            if (item?.role && item?.content && typeof item.content === "string") {
                msgs.push({ role: item.role, content: item.content });
            }
        }
    }

    msgs.push({ role: "user", content: message });

    if (products.length > 0) {
        msgs.push({ role: "system", content: `Sản phẩm thực tế trong cửa hàng:\n${formatProductsForPrompt(products)}\n\nChỉ tư vấn dựa trên danh sách này.` });
    }
    try {
        const reply = await callAI(msgs);
        return res.json(new ApiResponse(200, { reply, products: mapProducts(products), aiOnline: true }, "Thành công"));
    } catch (e) {
        console.error("[AI] Chat failed:", e.message);
        return res.json(new ApiResponse(200, { reply: buildReply(products, message), products: mapProducts(products), aiOnline: false }, "Thành công"));
    }
});
```

- [ ] **Step 3: Verify syntax with Node**

Run: `node -e "require('./src/controllers/chat.controller')"`
Workdir: `D:\AppleStoreMini_Api`
Expected: No syntax errors (may fail on missing env vars, that's OK)

- [ ] **Step 4: Run existing tests**

Run: `npm test -- tests/chat.service.test.js`
Workdir: `D:\AppleStoreMini_Api`
Expected: All tests pass

- [ ] **Step 5: Commit**

```powershell
git add src/controllers/chat.controller.js
git commit -m "feat(ai): rewrite system prompt for natural conversation + add history support"
```
Workdir: `D:\AppleStoreMini_Api`

---

### Task 3: FE - Send conversation history from ChatWidget

**Files:**
- Modify: `D:\AppleStoreMini\src\components\shared\ChatWidget.jsx:34-68`

- [ ] **Step 1: Add history extraction before user message append (lines 34-43)**

Replace the `handleSend` function's first half:

```jsx
const handleSend = async (event) => {
    event?.preventDefault();
    const text = message.trim();
    if (!text || isLoading) return;

    setMessage("");

    const history = messages
        .filter((m) => m.content && !m.products)
        .slice(-20)
        .map((m) => ({
            role: m.senderType === "USER" ? "user" : "assistant",
            content: m.content,
        }));

    setMessages((prev) => [
        ...prev,
        { senderType: "USER", content: text, createdAt: new Date().toISOString() },
    ]);

    try {
        const result = await sendMessage({ message: text, history }).unwrap();
```

The rest of the function (lines 46-68) remains unchanged.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Workdir: `D:\AppleStoreMini`
Expected: Build succeeds

- [ ] **Step 3: Verify lint**

Run: `npm run lint`
Workdir: `D:\AppleStoreMini`
Expected: No new errors

- [ ] **Step 4: Commit**

```powershell
git add src/components/shared/ChatWidget.jsx
git commit -m "feat(chat): send last 20 messages as conversation history to AI"
```
Workdir: `D:\AppleStoreMini`
