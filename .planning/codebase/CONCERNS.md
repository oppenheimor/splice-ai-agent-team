---
last_mapped: 2026-05-25
focus: concerns
---

# Concerns

## Summary

The codebase has a coherent MVP architecture, but several seams are still POC-grade: route/basePath handling, auth redirects, lack of tests, local-only conversation state, loose tool typing, and deployment rollback. These should be treated as known risks during planning.

## Route And Base Path Fragility

- `next.config.mjs` sets `basePath: "/agent-team"`.
- Several hardcoded action URLs and redirects include `/agent-team`, for example `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, and `components/agent-chat/AgentChatShell.tsx`.
- Some links and redirects are source-path style, for example `redirect("/login")` in `lib/auth/session.ts` and links to `/requirements-diagnosis` in `app/page.tsx`.
- `proxy.ts` protects both `/agent-team/requirements-diagnosis` and `/requirements-diagnosis`, but does not include treasure hunt paths.

Risk: future route additions can accidentally bypass middleware protection or generate double/missing base paths. Page-level `requireUser()` currently mitigates this for `app/treasure/hunt/page.tsx`.

## Auth Is Minimal By Design

- Login is phone-only and auto-creates users.
- There is no verification code, password, OAuth, rate limit, or abuse control.
- Session cleanup for expired sessions is not implemented.
- `docs/登录注册.md` documents future phases, but only V1 database user/session behavior exists.

Risk: this is acceptable for internal learning/MVP, not for public production auth.

## Chat Persistence Is Browser-Only

- Conversations are stored in localStorage via `lib/agent-team/storage/local-conversations.ts`.
- Server has no conversation table.
- User identity and visitor ID are not used to persist chat history server-side.

Risk: users lose conversations across browsers/devices and cannot recover them after localStorage cleanup.

## LLM Runtime Has Limited Guardrails

- `app/api/agent-team/chat/route.ts` compacts to the last 14 UI messages and truncates text parts to 5000 chars.
- There is no request rate limit, tenant/user quota, model timeout beyond route `maxDuration`, content moderation, telemetry, or cost tracking.
- Tool calls stop at `stepCountIs(4)`, which may prematurely halt more complex flows.

Risk: UX and cost behavior may be unpredictable under real user load.

## Tool Renderer Typing Is Loose

- Many renderer props use `any`.
- `MessagePartsRenderer` dispatches by string matching `tool-*`.
- Adding tool-specific renderer profiles is planned in `docs/技术方案.md`, but current code does not yet implement a manifest-level renderer registry.

Risk: malformed tool output can fail visually or silently without compile-time protection.

## Deployment Has No Rollback Yet

- `TODO.md` explicitly lists blue/green deployment, rollback, deployment notifications, and Docker Secrets/Vault as pending.
- `.github/workflows/deploy.yml` deploys `latest` via Docker Compose and prunes old images after 24h.

Risk: production recovery depends on manual intervention if a bad image is deployed.

## Docker/Prisma Build Mismatch

- `Dockerfile` comments show Prisma generate/schema copy steps are currently disabled.
- The app imports `@prisma/client` and uses Prisma at runtime.
- Production standalone output plus copied `node_modules` may work if the client is already generated during install/build, but the disabled generate step is a risk area.

Risk: production image can fail at runtime if Prisma client generation or schema availability is incomplete.

## Documentation Drift

- `docs/技术方案.md` target directory mentions `app/agent-team/treasure/hunt/page.tsx`, but the implemented source route is `app/treasure/hunt/page.tsx` because `basePath` supplies `/agent-team`.
- `docs/业务需求.md` planned routes include `/agent-team/...`, while code source paths omit the base path.
- README remains the default create-next-app README and does not describe current setup.

Risk: future agents may follow stale paths unless docs are reconciled with the implemented basePath strategy.

## Styling And UX Follow-Up

- `TODO.md` lists AGUI style optimization and chat interaction improvements.
- Current AGUI renderers are functional but generic.
- Treasure-hunt-specific components such as material lists, clue cards, and delivery packs are not implemented yet.

Risk: the current "大喜" experience may feel structurally correct but not yet differentiated enough for the product vision.
