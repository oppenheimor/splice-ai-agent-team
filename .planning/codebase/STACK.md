---
last_mapped: 2026-07-19
focus: tech
---

# Stack

## Summary

This is a TypeScript Next.js application for a specialized Agent Team platform. The current product combines protected agent pages, a reusable agent chat shell, AGUI-style tool rendering, phone-based session auth, and PostgreSQL persistence for users/sessions.

## Runtime

- **Node.js**: Docker production image uses Node.js 24 on Debian Bookworm.
- **Package manager**: `pnpm`, locked by `pnpm-lock.yaml`; `.npmrc` is present.
- **Framework**: Next.js `16.2.6` with App Router under `app/`.
- **React**: React `19.2.4` and React DOM `19.2.4`.
- **TypeScript**: TypeScript `6.0.3`; `tsconfig.json` enables `strict`, `isolatedModules`, `moduleResolution: "bundler"`, and path alias `@/*`.

## Application Framework

- `next.config.mjs` sets `basePath: "/agent-team"` and `output: "standalone"`.
- App routes live directly under `app/`, for example `app/page.tsx`, `app/login/page.tsx`, `app/requirements-diagnosis/page.tsx`, and `app/treasure/hunt/page.tsx`.
- API routes live under `app/api/`, including `app/api/agent-team/chat/route.ts` and `app/api/auth/*/route.ts`.
- `proxy.ts` handles route protection for selected paths.

## AI And Chat Dependencies

- `ai` `^6.0.182` provides `streamText`, UI messages, tool definitions, message conversion, and stream response helpers.
- `@ai-sdk/react` `^3.0.184` provides the frontend `useChat` hook and `DefaultChatTransport`.
- `@ai-sdk/deepseek` `^2.0.35` is the active model provider integration.
- `app/api/agent-team/chat/route.ts` defaults to `DEEPSEEK_MODEL || "deepseek-chat"` and requires `DEEPSEEK_API_KEY`.

## UI Dependencies

- `react-markdown`, `remark-gfm`, and `rehype-sanitize` render assistant markdown safely in `components/agent-chat/MessagePartsRenderer.tsx`.
- `recharts` renders chart tools in `components/agent-chat/tool-renderers/visual-tools.tsx`.
- `@radix-ui/react-checkbox` and `@radix-ui/react-radio-group` power structured choice input in `components/agent-chat/tool-renderers/choice-tool.tsx`.
- Styling uses CSS modules and global CSS, not Tailwind.

## Database And ORM

- Prisma `7.8.0` and `@prisma/client` `7.8.0` are used with PostgreSQL.
- `@prisma/adapter-pg` and `pg` back Prisma with the Node PostgreSQL driver.
- Prisma schema is `prisma/schema.prisma`.
- Prisma config is `prisma.config.ts`, reading `DATABASE_URL` via `env("DATABASE_URL")`.
- The generated database currently has `users` and `sessions` tables from `prisma/migrations/0001_init_auth/migration.sql`.

## Auth Stack

- Auth logic is local to `lib/auth/`.
- `lib/auth/session.ts` creates cryptographically random session IDs using `node:crypto`.
- Cookie settings are in `lib/auth/cookies.ts`.
- Login/logout/me endpoints live in `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, and `app/api/auth/me/route.ts`.

## Build And Deployment

- Scripts in `package.json`:
  - `pnpm dev` -> `next dev`
  - `pnpm build` -> `next build`
  - `pnpm start` -> `next start`
  - `pnpm lint` -> `eslint`
  - `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio` for Prisma
- `Dockerfile` uses source, builder, and runtime stages. The runtime includes the `.dockerignore`-filtered authored source needed by Eve, Next.js standalone output, production dependencies, and Prisma CLI.
- `entrypoint.sh` starts Eve, waits for sandbox prewarm and health, then starts the standalone Next.js server; either process exiting terminates the container.
- `docker-compose.yml` runs the production image from Volcengine Container Registry.
- `docker-compose.dev.yml` runs local PostgreSQL 17 on port 5432.
- Volcengine Code Pipeline builds immutable commit-tagged images from GitHub `main`, uploads the Compose and deployment scripts, and invokes `scripts/deploy-production.sh` over SSH.
- Production runtime variables are loaded from `/home/deploy/agent-team/.env`; GitHub Secrets are not part of the active release path.

## Configuration

- `.env.example` defines:
  - `DEEPSEEK_API_KEY=`
  - `TAVILY_API_KEY=`
  - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/splice_agent_team?schema=public"`
- `lib/db/prisma.ts` includes a fallback development connection string ending in `splice_agent_team_missing_database_url`; this avoids immediate undefined env access but can obscure missing `DATABASE_URL` until runtime DB calls fail.

## Notable Version-Specific Constraint

`AGENTS.md` says this Next.js version may differ from standard assumptions and instructs agents to read `node_modules/next/dist/docs/` before writing Next.js code. Future implementation work touching Next.js APIs should honor that local-docs-first rule.
