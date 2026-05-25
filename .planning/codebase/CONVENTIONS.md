---
last_mapped: 2026-05-25
focus: quality
---

# Conventions

## Language And Module Style

- New application code is TypeScript.
- Imports use the `@/*` path alias from `tsconfig.json`.
- Server and client components follow Next.js App Router conventions.
- Client components explicitly use `"use client"`, for example `components/agent-chat/AgentChatShell.tsx` and `lib/agent-team/chat/useAgentChat.ts`.
- Public facade exports are used for auth in `lib/auth/index.ts`.

## React Patterns

- Server pages perform auth checks with `await requireUser()` or identity reads with `await getCurrentUser()`.
- Client UX state is centralized in hooks, especially `useAgentChat`.
- UI composition passes domain-specific empty states into generic shells, as in `app/treasure/hunt/page-client.tsx`.
- Tool renderers receive parsed tool data and render stable UI cards.

## Agent Extension Pattern

To add an agent, current code expects changes in these areas:

1. Add an `AgentManifest` to `lib/agent-team/agents/registry.ts`.
2. Add or reuse a prompt builder in `lib/agent-team/agents/prompts/`.
3. Select tool names from `AgentToolName`.
4. Add a page under `app/`.
5. Optionally add a domain empty state under `components/`.

The shared runtime route does not need per-agent changes when the manifest and prompt builder are enough.

## AGUI Tool Pattern

- Tool schemas are strict JSON-schema-style objects in `lib/agent-team/agui/tools.ts`.
- Most tools set `additionalProperties: false`.
- Tools with display-only output often return `input` unchanged from `execute`.
- Normalization helpers exist for cards, charts, and scorecards.
- Renderer dispatch is currently centralized in `MessagePartsRenderer`, with explicit `if` branches for each supported tool.

## Auth Pattern

- Cookie constants stay in `lib/auth/cookies.ts`.
- Session creation and validation stay in `lib/auth/session.ts`.
- Pages should call auth functions rather than reading Prisma auth tables directly.
- Session IDs are opaque random strings stored in the DB and cookie.

## Error Handling

- API routes return localized JSON error messages for bad input or missing configuration.
- `app/api/agent-team/chat/route.ts` catches model/runtime errors and returns a 500 JSON payload.
- `useAgentChat` stores chat errors by appending a fallback assistant message.
- `revokeSession` intentionally swallows update failures during logout.

## Styling

- CSS modules are the local convention for page and component styles.
- Cards and controls generally use 8px border radius.
- The app currently uses a warm neutral and green palette in the agent chat interface.
- Global CSS is minimal; most component-specific styling lives near the component.

## Documentation Style

- Product and architecture docs are written in Chinese.
- Existing docs are pragmatic and phase-oriented.
- Paths are documented directly, for example `lib/agent-team/agents/prompts/treasure-hunt.ts`.

## Current Type Safety Gaps

- Tool renderer props use `any` heavily in:
  - `components/agent-chat/tool-renderers/structured-tools.tsx`
  - `components/agent-chat/tool-renderers/visual-tools.tsx`
  - `components/agent-chat/MessagePartsRenderer.tsx`
- `ToolPartShape` is a local loose shape rather than a discriminated union per tool.
- This is acceptable for a POC but should tighten as tool contracts stabilize.

## Local Next.js Rule

`AGENTS.md` explicitly says this is not the standard Next.js agents may remember. Before modifying Next.js behavior, read the relevant files in `node_modules/next/dist/docs/`.
