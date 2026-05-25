---
last_mapped: 2026-05-25
focus: arch
---

# Architecture

## Summary

The application is a brownfield Next.js Agent Team platform. The core architecture is a reusable agent runtime surface: each agent is registered in a manifest, renders through a shared chat shell, sends messages to a shared streaming API route, and receives structured UI tool parts rendered by a tool registry.

## High-Level Layers

```text
Route Layer
  app/page.tsx
  app/login/page.tsx
  app/requirements-diagnosis/page.tsx
  app/treasure/hunt/page.tsx

Agent Definition Layer
  lib/agent-team/agents/types.ts
  lib/agent-team/agents/registry.ts
  lib/agent-team/agents/prompts/*

Chat UI Layer
  components/agent-chat/AgentChatShell.tsx
  components/agent-chat/MessagePartsRenderer.tsx
  components/agent-chat/tool-renderers/*

Chat State Layer
  lib/agent-team/chat/useAgentChat.ts
  lib/agent-team/storage/local-conversations.ts

Runtime Layer
  app/api/agent-team/chat/route.ts
  lib/agent-team/agui/tools.ts

Auth And Data Layer
  lib/auth/*
  app/api/auth/*
  lib/db/prisma.ts
  prisma/schema.prisma
```

## Request Flow: Agent Chat

1. A protected page such as `app/treasure/hunt/page.tsx` calls `requireUser()`.
2. The page loads an `AgentManifest` with `getAgentById("treasure-hunt")`.
3. The client page renders `components/agent-chat/AgentChatShell.tsx`.
4. `AgentChatShell` calls `useAgentChat(agent)`.
5. `useAgentChat` sends messages through `DefaultChatTransport` to `/agent-team/api/agent-team/chat`.
6. `app/api/agent-team/chat/route.ts` validates `agentId`, requires at least one user message, checks `DEEPSEEK_API_KEY`, builds system prompt and tools, and streams a UI message response.
7. `MessagePartsRenderer` renders text, reasoning summaries, and `tool-*` parts.
8. Tool outputs are submitted back through `addToolOutput`, and `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` continues the exchange.

## Agent Definition Model

- Types are in `lib/agent-team/agents/types.ts`.
- Agents are registered in `lib/agent-team/agents/registry.ts`.
- Current registered agents:
  - `requirements-diagnosis`
  - `treasure-hunt`
- A manifest defines `id`, `name`, `route`, `category`, `description`, `version`, `starterPrompts`, `tools`, `rendererProfile`, `promptBuilder`, and optional memory/eval metadata.
- Prompt selection is in `lib/agent-team/agents/prompts/index.ts`.
- Treasure-hunt-specific prompt logic is isolated in `lib/agent-team/agents/prompts/treasure-hunt.ts`.

## AGUI Tool Architecture

- Tool schema definitions live in `lib/agent-team/agui/tools.ts`.
- `pickAguiTools(agent.tools)` filters the common tool set by manifest.
- Tool rendering is currently hardcoded by tool name in `components/agent-chat/MessagePartsRenderer.tsx`.
- Renderers are split into:
  - `components/agent-chat/tool-renderers/choice-tool.tsx`
  - `components/agent-chat/tool-renderers/structured-tools.tsx`
  - `components/agent-chat/tool-renderers/visual-tools.tsx`

## Auth Architecture

- Auth is implemented inside the same Next.js app.
- `lib/auth/session.ts` owns login, current-user lookup, required-user redirect, and session revocation.
- `lib/auth/index.ts` is the facade re-export.
- `prisma/schema.prisma` stores users and sessions.
- Pages call `getCurrentUser()` for optional identity or `requireUser()` for protected access.
- `proxy.ts` handles cookie-level route guarding for selected routes, while page-level `requireUser()` performs server-side verification against the database.

## Routing And Base Path

- `next.config.mjs` sets `basePath: "/agent-team"`.
- Source routes are written without the base path, for example `app/treasure/hunt/page.tsx` maps externally to `/agent-team/treasure/hunt`.
- Several hardcoded URLs include `/agent-team/...` in forms and redirects. This is intentional in places because browser-visible URLs include the base path, but it makes path handling fragile if `basePath` changes.
- Some code and docs still refer to `/requirements-diagnosis` and `/login` without the base path.

## Data Flow Boundaries

- Server database data: users and sessions only.
- Client local data: agent conversations and visitor ID.
- LLM interaction state: recent UI messages sent to model after `compactUIMessages`.
- No dedicated server-side agent runtime, workflow engine, queue, job table, memory table, or conversation table exists yet.

## Current Product Shape

- `app/page.tsx` is a home/workbench landing page that shows auth status and links to agents.
- `app/requirements-diagnosis/page.tsx` is a protected placeholder page that verifies current user identity.
- `app/treasure/hunt/page.tsx` is the first real specialized agent page using the shared agent-chat stack.
