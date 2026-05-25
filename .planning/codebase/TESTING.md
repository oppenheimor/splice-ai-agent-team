---
last_mapped: 2026-05-25
focus: quality
---

# Testing

## Current Test Coverage

There is no dedicated automated test suite in the repository today. No `test`, `unit`, `e2e`, `vitest`, `jest`, or `playwright` script exists in `package.json`.

## Available Verification Commands

- `pnpm lint` runs ESLint through `eslint`.
- `pnpm build` runs `next build`.
- `pnpm db:migrate` runs Prisma development migrations.
- `pnpm db:generate` runs Prisma client generation.

## Linting

- ESLint config is `eslint.config.mjs`.
- It uses `eslint-config-next/core-web-vitals`.
- Global ignores include `.next/**`, `out/**`, `build/**`, and `next-env.d.ts`.

## Type Checking

- There is no standalone `typecheck` script.
- TypeScript checking happens as part of `next build`.
- `tsconfig.json` has `strict: true`, `noEmit: true`, `isolatedModules: true`, and incremental compilation.

## Manual Auth Verification

The auth docs in `docs/登录注册.md` describe expected V1 checks:

- Start local PostgreSQL with `docker compose -f docker-compose.dev.yml up -d postgres`.
- Set `DATABASE_URL`.
- Run `pnpm db:migrate`.
- Run `pnpm dev`.
- Visit protected pages while logged out and confirm redirect.
- Login with a phone number and confirm the session persists after refresh.
- Logout and confirm protected routes require login again.

## Manual Agent Chat Verification

For `app/treasure/hunt/page.tsx`:

- Ensure `DEEPSEEK_API_KEY` is configured.
- Login first because the page calls `requireUser()`.
- Open `/agent-team/treasure/hunt` in the browser.
- Start from a starter prompt in `TreasureHuntHero`.
- Confirm streamed text appears.
- Confirm `askUserChoice` renders and submitting a choice resumes generation.
- Confirm cards/checklists/timelines render when the model calls AGUI tools.

## Missing Test Areas

- No unit tests for phone normalization and session expiry logic in `lib/auth/session.ts`.
- No API route tests for auth login/logout/me.
- No API route tests for chat request validation and missing environment variables.
- No component tests for `ChoiceTool` and tool-output continuation.
- No E2E tests for login -> protected page -> chat flow.
- No regression tests around `basePath: "/agent-team"` URL construction.
- No deployment smoke test beyond Docker Compose health check in `.github/workflows/deploy.yml`.

## Recommended Next Testing Steps

1. Add unit tests for pure auth helpers: `normalizePhone`, `isValidPhone`, and session expiry behavior.
2. Add route-level tests for `app/api/auth/*`.
3. Add Playwright E2E for login and treasure-hunt happy path.
4. Add a `typecheck` script if build time becomes too slow for routine validation.
5. Add minimal AGUI renderer tests once tool contracts are stricter.
