## Project Reference

See: .planning/PROJECT.md (updated 2026-05-25)

**Core value:** 让不同 Agent 共享一套稳定的聊天与工具交互底座，同时保留各自独立的页面和体验。
**Current focus:** Project initialization

## Current State

- Project type: brownfield Next.js Agent Team platform
- Base path: `/agent-team`
- Existing validated capabilities: auth session, protected pages, shared agent chat, requirements-diagnosis agent, treasure-hunt agent
- Current planning mode: Vertical MVP
- Current workflow preferences: Standard granularity, Parallel execution, Balanced models, research on, plan check on, verifier on

## Memory

- Keep Agent registration manifest-driven.
- Keep shared chat/runtime code reusable across agents.
- Preserve the current localStorage conversation model until a later phase explicitly replaces it.
- Treat route/basePath handling as a risk area when adding new pages or API endpoints.

## Last Updated

2026-05-25 after initialization
