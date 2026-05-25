---
last_mapped: 2026-05-25
focus: tech
---

# Integrations

## Summary

The codebase has three active integration surfaces: DeepSeek through Vercel AI SDK, PostgreSQL through Prisma, and production Docker deployment through GitHub Actions plus Volcengine Container Registry. Browser-side chat persistence is localStorage and is not currently server-synced.

## DeepSeek Model Provider

- Provider package: `@ai-sdk/deepseek`.
- API route: `app/api/agent-team/chat/route.ts`.
- Required environment variable: `DEEPSEEK_API_KEY`.
- Optional environment variable: `DEEPSEEK_MODEL`; default is `deepseek-chat`.
- Runtime behavior:
  - Builds agent-specific system prompts via `lib/agent-team/agents/prompts/index.ts`.
  - Selects tools from `lib/agent-team/agui/tools.ts`.
  - Calls `streamText`.
  - Returns `toUIMessageStreamResponse`.
- Provider options set `deepseek.thinking` based on model name and `reasoningEffort: "high"`.

## PostgreSQL

- Local development database is defined in `docker-compose.dev.yml`.
- Production database URL is injected in `.github/workflows/deploy.yml` from `DATABASE_URL_PRODUCTION`.
- Prisma datasource provider is PostgreSQL in `prisma/schema.prisma`.
- The only persisted domain data today is auth:
  - `users`
  - `sessions`
- Client initialization is centralized in `lib/db/prisma.ts`.

## Browser Storage

- Agent conversations are stored in localStorage by `lib/agent-team/storage/local-conversations.ts`.
- Conversation storage key: `agent-team.chat.v1`.
- Visitor key: `agent-team.visitor.v1` in `lib/agent-team/chat/useAgentChat.ts`.
- This is client-only state. Refreshes preserve conversations on the same browser, but there is no cross-device sync, server backup, or account-level conversation table yet.

## Authentication Cookies

- Cookie name: `splice_session_id` from `lib/auth/cookies.ts`.
- Max age: 7 days.
- Login route sets `httpOnly`, `sameSite: "lax"`, production-only `secure`, and `path: "/"`.
- Logout route revokes the DB session and deletes the cookie.

## Deployment Infrastructure

- Registry: `splice-ai-cn-shanghai.cr.volces.com`.
- Image name: `splice-ai/agent-team-nextjs`.
- `.github/workflows/deploy.yml` runs on pushes to `main`.
- Runner labels: `self-hosted`, `agent-team`.
- Remote deploy directory: `/home/deploy/agent-team`.
- `docker-compose.yml` expects an external Docker network named `app-network`.

## External Secrets

Configured through GitHub Actions secrets:

- `VOLCENGINE_CR_PASSWORD`
- `VOLCENGINE_CR_USERNAME`
- `SERVER_SSH_KEY`
- `SERVER_HOST`
- `SERVER_USER`
- `DEEPSEEK_API_KEY_PRODUCTION`
- `DATABASE_URL_PRODUCTION`

Do not copy any actual secret values into planning docs or logs.

## Missing Or Deferred Integrations

- No SMS provider is implemented yet, despite `docs/登录注册.md` describing a future SMS-code phase.
- No password provider or OAuth provider exists.
- No analytics, eval, tracing, or model-observability integration exists.
- No server-side conversation persistence exists.
- No image generation, product-link, or shopping integration exists yet, though `TODO.md` mentions future AGUI components for Taobao links and generated images.
