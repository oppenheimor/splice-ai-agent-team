# Requirements: Splice Agent Team

**Defined:** 2026-05-25
**Core Value:** 让不同 Agent 共享一套稳定的聊天与工具交互底座，同时保留各自独立的页面和体验。

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: 用户可以用手机号登录，并在刷新页面后保持登录态
- [ ] **AUTH-02**: 未登录用户访问受保护的 Agent 页面时会被引导到登录页

### Agent Platform

- [ ] **AGENT-01**: 每个 Agent 都有独立且可访问的页面地址
- [ ] **AGENT-02**: 共享聊天底座可以为任意已注册 Agent 流式展示文本和结构化工具输出
- [ ] **AGENT-03**: 共享工具渲染层可以展示选择题、卡片、对比、清单、时间线和评分卡
- [ ] **AGENT-04**: 同一 Agent 的会话可以在同一浏览器中恢复并继续

### Agent Experiences

- [ ] **EXPR-01**: 寻宝游戏 Agent 有独立的空状态表现和 starter prompts
- [ ] **EXPR-02**: 寻宝游戏 Agent 可以把模糊目标追问清楚，并输出可执行的方案、清单和时间线

### Extensibility

- [ ] **EXT-01**: 新增 Agent 时，只需注册 manifest、prompt builder 和必要的 renderer，而不需要重写共享聊天运行时

## v2 Requirements

### Platform Evolution

- **PLAT-01**: 会话可以跨设备同步
- **PLAT-02**: 会话可以服务端持久化和恢复
- **PLAT-03**: 后台可以配置 Agent、prompt 和工具
- **PLAT-04**: 平台可以记录分析、评估和质量信号

## Out of Scope

| Feature | Reason |
|---------|--------|
| 短信验证码登录 | 当前先跑通手机号直登 + session 的最小闭环 |
| OAuth / 第三方登录 | 不是现阶段平台复用优先级 |
| PDF 导出 / 分享链接 | 核心 Agent 体验还在打磨，先不扩展交付形态 |
| 服务端 conversation table | 目前会话先放 localStorage，等体验稳定再迁移 |
| 后台 Agent 配置系统 | 先用代码注册和 prompt 约定，降低首期复杂度 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AGENT-01 | Phase 1 | Pending |
| AGENT-02 | Phase 1 | Pending |
| AGENT-03 | Phase 2 | Pending |
| AGENT-04 | Phase 2 | Pending |
| EXPR-01 | Phase 3 | Pending |
| EXPR-02 | Phase 3 | Pending |
| EXT-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-25*
*Last updated: 2026-05-25 after initialization*
