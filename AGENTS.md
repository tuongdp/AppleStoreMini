# Agent Instructions - AppleStoreMini FE

Use the Superpowers source at `D:\AI\superpowers` for workflow skills. Before starting any coding task, check the relevant skill files in `D:\AI\superpowers\skills` and follow them.

## Required First Step

Before editing code, inspect the existing codebase and match local patterns:

- Find similar components, pages, hooks, API slices, tests, and utilities with `rg`/file search.
- Match naming, folder structure, import/export style, validation, error handling, and test style.
- Keep the change scoped to the requested bug/feature. Do not refactor unrelated code.

## Skill Routing

For feature/backlog work:

1. `skills/brainstorming/SKILL.md` - clarify the desired behavior and solution shape when requirements are not already precise.
2. `skills/writing-plans/SKILL.md` - create an implementation plan for multi-step work.
3. `skills/executing-plans/SKILL.md` - execute the plan in small verified steps.
4. `skills/test-driven-development/SKILL.md` - add or update tests before/with implementation when behavior changes.
5. `skills/verification-before-completion/SKILL.md` - verify with lint/build/tests before claiming done.

For bugs:

1. `skills/systematic-debugging/SKILL.md` - reproduce and identify root cause before changing code.
2. `skills/test-driven-development/SKILL.md` - write or update a failing test/regression check where practical.
3. `skills/verification-before-completion/SKILL.md` - confirm the bug is fixed with targeted verification.

For large independent work, use `skills/subagent-driven-development/SKILL.md` and `skills/dispatching-parallel-agents/SKILL.md` only when explicitly useful and allowed by the current agent environment.

For reviews or merge preparation, use `skills/requesting-code-review/SKILL.md`, `skills/receiving-code-review/SKILL.md`, and `skills/finishing-a-development-branch/SKILL.md`.

## Frontend Project Rules

This is a React/Vite Apple Store mini frontend.

- Prefer existing components in `src/components/ui`, `src/components/shared`, `src/features`, and `src/pages` before adding new abstractions.
- Use existing Redux Toolkit API slices in `src/store/api` for server calls.
- Keep UI consistent with Tailwind/shadcn/Radix/lucide patterns already in the repo.
- Use `lucide-react` icons for icon buttons when available.
- Avoid unrelated visual redesigns.
- For routes, follow `src/routes.jsx` and existing layout patterns.
- For forms, follow current `react-hook-form` and `zod` patterns when present.
- For tests, prefer existing Playwright test structure under `tests`.

## Verification

Use the narrowest verification that proves the change, then broader checks when risk justifies it:

- `npm run lint`
- `npm run build`
- `npm run test:e2e` or a targeted Playwright command for UI flows
- `npm run test:api` only when frontend API contract behavior is touched
