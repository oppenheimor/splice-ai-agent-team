# Roadmap: Splice Agent Team

## Phase 1: Access and Core Agent Runtime
**Goal:** 让用户能登录、进入受保护页面，并通过共享 runtime 启动任意已注册 Agent。
**Mode:** mvp
**Success Criteria:**
1. 未登录用户访问受保护 Agent 页面时会被引导到登录页
2. 登录后可以刷新并保持 session
3. 共享聊天 API 可以按 agentId 选择 prompt 和工具
4. 基础 Agent 页面可以正常打开并进入共享聊天壳
5. 新 Agent 的注册方式对现有运行时是可复用的

## Phase 2: Structured Chat and Continuity
**Goal:** 让共享聊天底座稳定渲染结构化工具输出，并保留同一浏览器内的会话连续性。
**Mode:** mvp
**Success Criteria:**
1. 文本消息可以流式显示
2. 选择、卡片、对比、清单、时间线和评分卡都能按 tool part 正确渲染
3. 同一 Agent 的会话可以在同一浏览器内恢复
4. 继续对话时不会丢失已完成的工具交互状态

## Phase 3: Differentiated Agent Experiences
**Goal:** 把寻宝游戏 Agent 做成真正有辨识度的领域化 Agent，并验证新增 Agent 的接入路径。
**Mode:** mvp
**Success Criteria:**
1. 寻宝游戏 Agent 有独立的空状态和 starter prompts
2. 寻宝游戏 Agent 的追问过程保持单轮单问
3. 寻宝游戏 Agent 能输出结构化的方案、清单和时间线
4. 新增 Agent 时只需补 manifest / prompt / renderer 的局部代码
5. 平台可以承载后续新增 Agent 而不改共享聊天运行时

## Requirements Coverage

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

## Notes

- This roadmap uses Vertical MVP slicing because each phase should ship a visible user capability end-to-end.
- The current architecture already supports the first phase; later phases focus on tightening the tool/UI contract and differentiating specific Agent experiences.

---
*Roadmap created: 2026-05-25*
*Last updated: 2026-05-25 after initialization*
