# Splice Agent Team

## What This Is

这是一个可持续扩展的多 Agent 平台。每个 Agent 都有自己的页面、对话能力和差异化交互 UI，但底层聊天、AGUI 工具和基础会话能力尽量复用。

当前已经落地了登录态、受保护页面、需求诊断 Agent、寻宝游戏 Agent，以及共享的 agent chat/runtime 骨架。

## Core Value

让不同 Agent 共享一套稳定的聊天与工具交互底座，同时保留各自独立的页面和体验。

## Requirements

### Validated

- ✓ 登录后可通过服务端 session 识别当前用户
- ✓ `/login` 可创建用户并写入 session cookie
- ✓ `/api/auth/me` 可返回当前登录态
- ✓ `/requirements-diagnosis` 是受保护页面
- ✓ `/treasure/hunt` 可进入寻宝游戏 Agent 页面
- ✓ Agent 聊天使用共享的 `AgentChatShell`、`useAgentChat` 和 AGUI 渲染层

### Active

- [ ] 为更多 Agent 提供可复用的 manifest / prompt / renderer 扩展方式
- [ ] 让不同 Agent 的页面和交互足够差异化，而不是只换提示词
- [ ] 逐步增强 AGUI 工具与领域化渲染能力

### Out of Scope

- [ ] 短信验证码登录与复杂账号体系 - 当前只做到手机号直登和 session，先跑通最小闭环
- [ ] OAuth / 第三方登录 - 不是当前平台复用优先级
- [ ] 服务端会话/对话持久化 - 当前会话先放在浏览器 localStorage
- [ ] 后台 Agent 配置系统 - 现阶段先用代码注册和 prompt 约定
- [ ] PDF 导出、分享链接、分析埋点 - 等核心平台体验稳定后再补

## Context

- 这是一个 brownfield Next.js 项目，`next.config.mjs` 配置了 `basePath: "/agent-team"`
- 当前技术栈是 Next.js App Router + React 19 + TypeScript + Prisma + PostgreSQL
- Agent 运行时通过 `@ai-sdk/react`、`ai` 和 `@ai-sdk/deepseek` 实现
- 现有 Agent 包括 `requirements-diagnosis` 和 `treasure-hunt`
- 对话状态目前主要依赖浏览器 localStorage
- 认证目前是手机号登录 + 服务端 session

## Constraints

- **Tech stack**: 继续沿用 Next.js App Router + TypeScript + Prisma + PostgreSQL - 现有代码已经按这套栈组织
- **Routing**: 保持 `/agent-team` basePath - 当前部署和路由都依赖它
- **Auth**: 先保留轻量 session 模型 - 方便继续迭代，不先引入复杂身份系统
- **Chat state**: 短期仍以 localStorage 为主 - 先把体验打通，再考虑服务端同步
- **Deployment**: 继续兼容当前 Docker + GitHub Actions 方案 - 先不动发布链路

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 使用 `/agent-team` 作为 basePath | 与现有部署和路由组织一致 | ✓ Good |
| 以 `AgentManifest` 驱动 Agent 注册 | 让新增 Agent 时尽量只改 manifest / prompt / renderer | ✓ Good |
| 共享 `AgentChatShell` 与 `useAgentChat` | 避免每个 Agent 重复实现聊天底座 | ✓ Good |
| 当前会话先放 localStorage | 快速跑通体验，降低首期复杂度 | — Pending |
| 登录采用手机号 + session | 能先跑通用户身份和受保护页面 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-25 after initialization*
