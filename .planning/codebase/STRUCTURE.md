---
last_mapped: 2026-05-25
focus: arch
---

# Structure

## Top-Level Layout

```text
app/                 Next.js App Router pages and API routes
components/          Shared and domain UI components
docs/                Product and technical planning notes in Chinese
lib/                 Application logic, auth, db, agent abstractions
prisma/              Prisma schema and migrations
public/              Static assets from create-next-app
.github/workflows/   Production deployment workflow
.codex/              Local GSD/Codex workflow and skill definitions
```

## App Routes

- `app/layout.tsx` sets global HTML language, Geist fonts, and metadata.
- `app/page.tsx` renders the main Splice Agent Team entry page.
- `app/login/page.tsx` renders phone login.
- `app/requirements-diagnosis/page.tsx` renders the protected requirements diagnosis placeholder.
- `app/treasure/hunt/page.tsx` is the server wrapper for the treasure hunt agent.
- `app/treasure/hunt/page-client.tsx` renders the client-side chat shell with `TreasureHuntHero`.

## API Routes

- `app/api/agent-team/chat/route.ts` handles all agent chat streaming.
- `app/api/auth/login/route.ts` handles phone login and session cookie creation.
- `app/api/auth/logout/route.ts` revokes the session and clears the cookie.
- `app/api/auth/me/route.ts` returns current auth state.

## Agent Team Modules

- `lib/agent-team/agents/types.ts` defines manifest, conversation, memory, and eval types.
- `lib/agent-team/agents/registry.ts` contains the static `AGENTS` registry.
- `lib/agent-team/agents/prompts/index.ts` chooses the prompt builder.
- `lib/agent-team/agents/prompts/treasure-hunt.ts` contains the "大喜" prompt.
- `lib/agent-team/agui/tools.ts` defines structured tool schemas and normalization helpers.
- `lib/agent-team/chat/useAgentChat.ts` wraps `@ai-sdk/react` for the app's agent conversation UX.
- `lib/agent-team/storage/local-conversations.ts` persists conversations in localStorage.
- `lib/agent-team/id.ts` creates client-side IDs.

## UI Components

- `components/agent-chat/AgentChatShell.tsx` is the reusable chat workbench layout.
- `components/agent-chat/MessagePartsRenderer.tsx` renders UI message parts and dispatches tool parts.
- `components/agent-chat/tool-renderers/choice-tool.tsx` renders `askUserChoice`.
- `components/agent-chat/tool-renderers/structured-tools.tsx` renders comparison, checklist, timeline, scorecard, and generic tools.
- `components/agent-chat/tool-renderers/visual-tools.tsx` renders cards and charts.
- `components/treasure-hunt/TreasureHuntHero.tsx` renders the empty state for the treasure hunt agent.

## Auth And Database Modules

- `lib/auth/cookies.ts` stores auth cookie constants.
- `lib/auth/session.ts` implements phone login, current user lookup, `requireUser`, and logout revocation.
- `lib/auth/index.ts` re-exports the auth facade.
- `lib/db/prisma.ts` creates the shared Prisma client with `@prisma/adapter-pg`.
- `prisma/schema.prisma` defines `User` and `Session`.
- `prisma/migrations/0001_init_auth/migration.sql` creates the initial auth tables.

## Styles

- `app/globals.css` sets root colors, global box sizing, and body defaults.
- `app/page.module.css`, `app/login/page.module.css`, and `app/requirements-diagnosis/page.module.css` style individual pages.
- `components/agent-chat/agent-chat.module.css` styles the shared chat workbench and AGUI cards.
- `components/treasure-hunt/treasure-hunt.module.css` styles the treasure hunt empty state.

## Documentation

- `docs/业务需求.md` describes the Agent Team platform goal and planned agents.
- `docs/技术方案.md` describes the reusable Agent Team architecture and treasure-hunt implementation plan.
- `docs/登录注册.md` describes incremental auth phases from local login to full auth infrastructure.
- `TODO.md` tracks deployment and treasure-hunt follow-up work.

## Naming Conventions Observed

- Agent IDs use kebab-case: `requirements-diagnosis`, `treasure-hunt`.
- TypeScript type names use PascalCase: `AgentManifest`, `AgentConversation`.
- React components use PascalCase and live in `.tsx`.
- CSS modules use lowercase domain names: `agent-chat.module.css`, `treasure-hunt.module.css`.
- API route folders follow Next.js App Router conventions with `route.ts`.
