---
last_mapped: 2026-07-19
focus: tech
---

# Integrations

## Summary

The codebase has active integration surfaces for DeepSeek through Vercel AI SDK, Tavily web search, PostgreSQL through Prisma, Eve sandbox execution, and production Docker deployment through Volcengine Code Pipeline plus Volcengine Container Registry.

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
- Production database URL is stored in `/home/deploy/agent-team/.env` and loaded by Docker Compose at runtime.
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
- A Volcengine Code Pipeline watches GitHub `main`, builds the immutable commit-tagged image on managed build resources, and deploys it over SSH.
- Production deployment no longer depends on a GitHub self-hosted Runner.
- Remote deploy directory: `/home/deploy/agent-team`.
- `docker-compose.yml` expects an external Docker network named `app-network`.
- `scripts/deploy-production.sh` gates the switch with candidate prewarm, Prisma migration, container health, and Nginx upstream verification.

## Production Configuration

Application runtime secrets are stored only in `/home/deploy/agent-team/.env`:

- `DEEPSEEK_API_KEY`
- `DATABASE_URL`
- `TAVILY_API_KEY`

The Volcengine pipeline keeps `SERVER_HOST`, `SERVER_USER`, and `SERVER_SSH_KEY` as connection variables. They are not injected into the application container. Operational changes and rollback are documented in `docs/生产回滚操作手册.md`.

Do not copy any actual secret values into planning docs or logs.

## Missing Or Deferred Integrations

- No SMS provider is implemented yet, despite `docs/登录注册.md` describing a future SMS-code phase.
- No password provider or OAuth provider exists.
- No analytics, eval, tracing, or model-observability integration exists.
- No server-side conversation persistence exists.
- No image generation, product-link, or shopping integration exists yet, though `TODO.md` mentions future AGUI components for Taobao links and generated images.
