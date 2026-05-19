# AppleStore Mini TestSprite PRD

## Product
Fullstack ecommerce app for Apple products with React/Vite frontend, Express API, Prisma/MySQL persistence, JWT auth, Socket.IO realtime, MoMo payments, and PWA offline support. Stripe is a future payment contract only if a Stripe webhook route is added.

## Critical User Journeys
- Customer registers, verifies email, logs in, refreshes token silently, logs out.
- Customer searches, filters, paginates, views product detail, manages cart and wishlist.
- Customer checks out, creates order, pays through MoMo, and sees payment result.
- Admin logs in, manages products/categories/images/orders, and reviews dashboard statistics.
- Realtime notifications arrive for new orders/chat/status updates without duplicate sessions.
- PWA serves cached shell offline, invalidates stale caches, and recovers after reconnect.

## Quality Gates
- No `test.only`.
- All Playwright projects pass on PR.
- API contracts return structured JSON envelopes.
- MoMo IPN handles success, failure, duplicate event id/order state, invalid signature, and retry.
- Authentication protects user/admin routes and supports concurrent refresh safely.
- Screenshots, videos, traces, HTML and JUnit reports are retained on failure.

## TestSprite Prompt
Use this file plus `tests/testsprite/regression-plan.md` as the project testing context. Generate UI/API regression tests using stable `data-testid` selectors first, then accessible roles, then text as a final fallback.
