# AI Automated Testing Setup

## Folder Structure
- `playwright.config.ts`: browser, API, reporter, retry, screenshot/video/trace policy.
- `tests/fixtures`: Playwright fixtures.
- `tests/e2e`: UI regression tests.
- `tests/api`: API, MoMo payment webhook, Socket.IO contract tests.
- `tests/utils`: mock factories, route mocks, auth helpers, waits, screenshots.
- `tests/testsprite`: TestSprite PRD and regression plan.
- `.cursor/mcp.json`, `.vscode/mcp.json`: TestSprite MCP integration.
- `prisma/seed.ts`: deterministic test data seed template for the backend workspace.

## Commands
```bash
npm install
npm run test:install
cp .env.test.example .env.test
npm run test:e2e
npm run test:api
npm run test:fullstack
npm run test:regression
npm run test:report
npm run testsprite:mcp
```

## Fullstack Mode
The backend source lives outside this frontend repo at `../AppleStoreMini_Api` by default.

```bash
cp .env.test.example .env.test
npm run test:fullstack
```

Override the backend path when needed:

```bash
TEST_BACKEND_DIR=D:/AppleStoreMini_Api npm run test:fullstack
```

`test:fullstack` starts:
- backend: `npm start` in `TEST_BACKEND_DIR`
- frontend: Vite on `http://127.0.0.1:5173`
- tests: Chromium E2E + API project

Backend prerequisites:
- `.env` or `.env.test` values in the backend repo must include `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, Cloudinary keys, and Google OAuth keys because `server.js` validates them on startup.
- MySQL test database should be migrated and seeded before fullstack CI.

## TestSprite MCP
TestSprite's current npm package is `@testsprite/testsprite-mcp`. Configure `TESTSPRITE_API_KEY` in your shell or `.env.test`, restart Cursor/VSCode, then verify the MCP server is enabled.

Cursor config: `.cursor/mcp.json`
VSCode config: `.vscode/mcp.json`

Use this IDE prompt:
```text
Help me test this project with TestSprite. Use tests/testsprite/testsprite.prd.md and tests/testsprite/regression-plan.md. Prioritize auth, ecommerce checkout, MoMo payment webhook, Socket.IO, PWA offline, admin CRUD, and responsive regression. Keep Stripe as a future contract only if a Stripe route is added.
```

## Backend/Test Database Strategy
- Use a dedicated MySQL database, for example `applestore_test`.
- Never run E2E against production data.
- Set `DATABASE_URL` to the test DB in backend CI.
- Run `prisma migrate deploy` then `prisma db seed`.
- Prefer deterministic seed ids/emails, then clean by those ids/emails.
- For destructive API tests, create data inside the test and delete it in `afterEach`.

## Stability Rules
- Prefer `data-testid` for critical flows.
- Mock third-party dependencies in UI tests; keep real MoMo/Socket tests in API contract suite.
- Use `trace`, `video`, and `screenshot` only on failure in CI.
- Keep API contract tests tolerant of `401/404` when backend is intentionally not running locally, but strict in CI with seeded credentials.
