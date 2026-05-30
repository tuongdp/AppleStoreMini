# AI Chat Natural Conversation - Design Spec

**Date:** 2026-05-30
**Status:** Approved
**Scope:** Backend system prompt + conversation history + temperature tuning

## Problem

AI chat responses are rigid and unnatural:
- Users must provide exact product names
- No conversational memory (each message is stateless)
- Low temperature makes responses repetitive and mechanical
- AI cannot handle vague queries like "máy chụp ảnh đẹp"

## Solution

Three changes across backend (AppleStoreMini_Api) and frontend (AppleStoreMini).

### 1. System Prompt Rewrite

**File:** `D:\AppleStoreMini_Api\src\controllers\chat.controller.js`

Replace `SYSTEM_CHAT_FOCUSED` with a more flexible Vietnamese prompt:

- Allow AI to **infer** product families from user needs (e.g., "máy chụp ảnh đẹp" → iPhone Pro)
- Allow AI to **ask clarifying questions** (e.g., "Anh/chị dùng cho công việc hay giải trí ạ?")
- Soften rejection tone: instead of rigid refusal, suggest alternatives
- Remove overly restrictive rules that make AI sound scripted
- Keep Vietnamese Apple Store persona with "em"/"anh/chị" addressing

### 2. Conversation History

**FE:** `D:\AppleStoreMini\src\components\shared\ChatWidget.jsx`
- Extract last 10 user-AI message pairs (20 messages max) from local `messages[]` state
- Send as `history` field in POST body: `{ message, history: [{ role, content }] }`
- Only include text content, skip product card messages

**BE:** `D:\AppleStoreMini_Api\src\controllers\chat.controller.js`
- Accept `req.body.history` (optional array)
- Validate each item has `role` ("user"|"assistant") and `content` (string)
- Insert history messages between system prompt and user message in the AI messages array
- Cap at 20 messages

### 3. Temperature & Token Tuning

**File:** `D:\AppleStoreMini_Api\src\config\ai.js`

| Setting | Before | After | Rationale |
|---------|--------|-------|-----------|
| `AI_TEMPERATURE` | 0.2 | 0.5 | More varied, natural wording while keeping data accuracy |
| `AI_MAX_TOKENS` | 800 | 1200 | History + products + reply need more room |

## Files Changed

| Repo | File | Change |
|------|------|--------|
| Api | `src/config/ai.js` | Temperature 0.2→0.5, max_tokens 800→1200 |
| Api | `src/controllers/chat.controller.js` | Rewrite SYSTEM_CHAT_FOCUSED + accept history in chat handler |
| FE | `src/components/shared/ChatWidget.jsx` | Build history array from local state, send with API call |

## Non-Goals

- No changes to product search logic
- No changes to other AI endpoints (compare, recommend, search, etc.)
- No UI redesign
- No database changes
- No multi-language support

## Verification

1. `npm run lint` and `npm run build` pass on both repos
2. Manual test: ask "tôi cần máy chụp ảnh đẹp" → AI should infer iPhone Pro models
3. Manual test: ask follow-up "cái đầu tiên giá bao nhiêu" → AI should remember previous context
4. Backend existing unit tests: `npm test -- tests/chat.service.test.js` still pass
