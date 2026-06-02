# Handoff：需求诊断 Agent UI 审查与调性优化

## 当前目标

对 `requirements-diagnosis` 智能体做上线前 UI 调性优化，并用 `$impeccable critique` + `$agent-browser` 做专业审查。当前已完成一轮视觉重塑、浏览器实机审查、问题修复和验证。

## 重要约束

- Repo：`/Users/paulchess/Desktop/Home/entrepreneurship/splice-ai-agent-team`
- 访问路径带 `basePath`：
  - 正确：`/agent-team/requirements-diagnosis`
  - 源码路由：`app/requirements-diagnosis/*`
- 遵守 `AGENTS.md`：
  - 文档和注释中文
  - Next 16 代码变更前参考 `node_modules/next/dist/docs/`
  - TSX 文件不超过 500 行
  - 不回滚用户或其他流程产生的未提交改动
- 本次审查使用的外部知识依据：
  - `~/wiki-global/wiki/patterns/tool-aware-streaming-ui.md`
  - `~/wiki-global/wiki/patterns/design-skill-layering.md`
  - `~/wiki-global/wiki/products/claude-design.md`

## 本轮设计方向

最终调性：**冷静的战略咨询工作台**。

不是炫技 AI 聊天框，也不是营销页，而是围绕“镜子、坐标、诊断报告、深度咨询”的高信任产品界面。

核心判断：

- `requirements-diagnosis` 属于 product register，设计服务于任务完成，不能过度装饰。
- 当前阶段属于“整理层 + 系统化层”：已有功能逻辑，需要统一 spacing、颜色、组件语义和长期可维护的设计常量。
- Agent Chat 后续不能停留在普通聊天流，应向 tool-aware diagnosis workspace 演进。

## 已落地改动

### 1. 专属视觉系统

新增：

- `components/requirements-diagnosis/styles.ts`

统一以下样式常量：

- `diagnosisShell`
- `diagnosisPanel`
- `diagnosisRaisedPanel`
- `diagnosisInkPanel`
- `diagnosisBadge`
- `diagnosisPrimaryButton`
- `diagnosisSecondaryButton`
- `diagnosisInput`
- `diagnosisMetric`
- `diagnosisDivider`

色彩从默认 slate/shadcn 灰白升级为：

- 冷灰绿背景
- 深墨绿工作台面板
- 铜色批注点缀
- 偏冷的内容卡片与边框

注意：最初版本偏米色，后续已主动调整，避免产品界面读成单一 beige/cream 风格。

### 2. 页面覆盖范围

已覆盖：

- `app/requirements-diagnosis/page.tsx`
  - Hero 首页
  - 最近评测预览
  - 移动端最近评测按钮布局
- `app/requirements-diagnosis/quiz/page-client.tsx`
  - 问卷页
  - 过渡提示
  - 进度条
  - 选项卡片
- `components/requirements-diagnosis/DiagnosisResultReport.tsx`
  - 结果报告
  - 雷达图
  - 维度进度条
  - CTA 区块
- `components/requirements-diagnosis/DiagnosisChatShell.tsx`
  - 深度诊断 Chat
  - 诊断侧栏
  - 空态提示
  - “诊断工作台会沉淀这些产物”预期区
- `app/requirements-diagnosis/history/page.tsx`
  - 历史列表
  - 空状态
- `app/requirements-diagnosis/result/page-client.tsx`
  - 缺少结果时的空状态
- `app/globals.css`
  - 字体栈调整为 `Avenir Next, Optima, ui-sans-serif...`

## 审查结果

Impeccable critique 快照：

- `.impeccable/critique/2026-05-28T04-42-58Z__components-requirements-diagnosis.md`

Design Health Score：

| 指标 | 结果 |
| --- | --- |
| 总分 | 28/40 |
| 评级 | Good foundation, needs product-system hardening before launch |
| P0 | 0 |
| P1 | 2 |

主要结论：

- 当前界面已经不再像默认 shadcn demo，有明确诊断产品调性。
- Hero、问卷和 Chat 空态的产品记忆点成立。
- 结果页仍偏长、偏卡片化。
- 深度诊断 Chat 还没有完全成为 tool-aware 工作台。

## 审查中发现并已修复的问题

### 1. 主 CTA 文本颜色被覆盖

问题：

- `Button` 组件默认 `text-primary-foreground` 与自定义 `text-[#fbfbf7]` 生成顺序冲突。
- 浏览器 computed style 显示主 CTA “开始评测”实际为深色文字，出现在深色按钮上。

修复：

- `diagnosisPrimaryButton` 改为 `!text-[#fbfbf7]`
- `diagnosisSecondaryButton` 改为 `!text-[#203236]`
- 结果页底部白底按钮改为 `!text-[#182427]`

验证：

- `agent-browser get styles @e3 --json`
- 主 CTA computed color 已为 `rgb(251, 251, 247)`

### 2. 移动端首页历史区按钮拥挤

问题：

- “查看全部历史 / 重新评测”以及历史卡片内“查看结果 / 深度诊断”在移动端容易拥挤。

修复：

- 移动端改为两列按钮网格：
  - `grid grid-cols-2 gap-2`
  - 桌面端保持 `sm:flex`

验证：

- 截图：`/tmp/requirements-home-mobile-fixed.png`

### 3. Chat 空态仍像提示按钮集合

问题：

- 视觉上已经有商务风，但产品语义仍偏“给几个 prompt”。
- 与 Wiki 中 `Tool-Aware Streaming UI` 的方向不够一致。

修复：

- 在 Chat 空态右侧补充“诊断工作台会沉淀这些产物”：
  - 待确认问题
  - 证据与假设
  - 行动清单
- 这只是产品预期层，真正 typed tool state 仍在后续 backlog。

验证：

- 截图：`/tmp/requirements-chat-fixed-mobile.png`

## 浏览器验证记录

使用 `$agent-browser` 实际访问并截图：

- 桌面：
  - 首页：`/tmp/requirements-home-dev.png`
  - 问卷：`/tmp/requirements-quiz-dev.png`
  - 结果页：`/tmp/requirements-result-fixed-record.png`
  - Chat：`/tmp/requirements-chat.png`
- 移动端：
  - 首页修复后：`/tmp/requirements-home-mobile-fixed.png`
  - Chat 修复后：`/tmp/requirements-chat-fixed-mobile.png`

实际跑通流程：

1. 登录测试账号
2. 打开 `/agent-team/requirements-diagnosis`
3. 打开问卷页
4. 完成 12 题问卷
5. 生成结果记录
6. 从历史页进入结果页
7. 从历史页进入深度诊断 Chat
8. 验证移动端首页和 Chat 空态

测试账号：

- `codex-ui-check`

测试过程中创建了新的诊断记录，未做清理。若后续需要干净数据，可从 DB 删除该测试用户或其 `DiagnosisQuizResult`。

## 命令验证记录

已通过：

```bash
pnpm lint
pnpm build
```

`pnpm lint` 仍有既有 warning，来源不在本轮 UI 改动：

- `.codex/get-shit-done/bin/lib/cjs-sdk-bridge.cjs`
- `.codex/get-shit-done/bin/lib/phase-lifecycle.generated.cjs`
- `.codex/get-shit-done/bin/lib/runtime-artifact-layout.cjs`
- `.codex/get-shit-done/bin/lib/state.cjs`

本轮未修改这些 warning。

## Impeccable 工具状态

执行过：

```bash
node /Users/paulchess/.agents/skills/impeccable/scripts/load-context.mjs
node /Users/paulchess/.agents/skills/impeccable/scripts/critique-storage.mjs slug components/requirements-diagnosis
node /Users/paulchess/.agents/skills/impeccable/scripts/detect.mjs --json components/requirements-diagnosis app/requirements-diagnosis
node /Users/paulchess/.agents/skills/impeccable/scripts/live-server.mjs --background
```

结果：

- 项目没有 `PRODUCT.md` / `DESIGN.md`
- 使用 product register 继续审查
- critique slug：`components-requirements-diagnosis`
- detector CLI 不可用：
  - `Error: bundled detector not found.`
- 浏览器 mutable injection 预检成功
- 注入 `detect.js` 后没有可靠 `impeccable` console 输出
- live-server 已停止
- 本次最终依据：
  - 浏览器截图
  - accessibility snapshot
  - computed styles
  - 控制台日志
  - 人工 UI 审查

## 当前遗留问题 / Backlog

### P1：Chat 仍需真正 tool-aware diagnosis states

现状：

- Chat 空态已经提示“诊断工作台”方向。
- 但真实 Agent 输出仍主要依赖消息流和通用工具渲染。

建议：

- 新增或强化 typed cards：
  - `正在检索`
  - `证据来源`
  - `待确认问题`
  - `风险/假设`
  - `行动建议`
- 接入现有 AGUI/tool renderer 层，而不是在 Chat Shell 里硬编码。

相关文件：

- `components/agent-chat/MessagePartsRenderer.tsx`
- `components/agent-chat/tool-renderers/*`
- `lib/agent-team/agui/tools.ts`
- `lib/agent-team/agents/prompts/requirements-diagnosis.ts`

### P1：结果页报告仍偏卡片堆叠

现状：

- 信息完整，但长页面中后段重复卡片较多。
- 移动端尤其像“报告块列表”，缺少 executive summary / 导航锚点。

建议：

- 顶部增加“执行摘要”或“最重要的 3 个判断”
- 中段改成报告版式：
  - 分区锚点
  - 更紧凑的 metric group
  - 合并重复 narrative 卡片
- 结果页后半段可以更像咨询交付物，而不是表单报告。

相关文件：

- `components/requirements-diagnosis/DiagnosisResultReport.tsx`

### P2：概念解释不足

需要补充内联解释：

- 五维画像
- AI 实践画像
- AI 应用级别 L1-L5
- 认知宽度
- 盲区
- 星级含义

注意：

- 当前星级解释主要依赖 `title`，对移动端和屏幕阅读器不够友好。

### P2：登录页未同步诊断产品调性

现状：

- `/login` 仍是通用平台登录风格。
- 用户从 protected route 进入需求诊断时，第一屏信任感不连续。

建议：

- 保持表单传统，不要重造登录交互。
- 但使用 `diagnosisShell` / `diagnosisPanel` / `diagnosisPrimaryButton` 等视觉常量。

相关文件：

- `app/login/page.tsx`

### P3：Power user 效率不足

建议：

- 历史页增加筛选或“继续最近一次深度诊断”
- 可考虑报告页目录锚点
- Chat 支持更明确的“生成路线图 / 评估风险 / 搜索行业案例”快捷动作状态

## 运行注意事项

### dev server

Next 16 会阻止同一项目同时启动多个 dev server。

本轮曾遇到：

- 旧 `localhost:3000` dev 进程存在但返回 404
- `next start` 在 `output: standalone` 下提示不推荐
- standalone 方式启动后静态资源路径不完整，导致问卷交互不可用

最终采用：

```bash
pnpm dev
```

并访问：

```txt
http://localhost:3000/agent-team/requirements-diagnosis
```

如果需要 production-like standalone，请优先按 Next 提示使用：

```bash
node .next/standalone/server.js
```

但要额外确认 `.next/static` 是否正确可访问。

### Chat API

浏览器测试中，点击 Chat prompt 时出现过：

```txt
POST /api/agent-team/chat 500
```

这更像本地 AI API 配置或运行时问题，不是本轮 UI 范围。上线前需要单独排查。

## 当前工作区提醒

工作区仍有大量未提交改动，包含但不限于：

- `app/requirements-diagnosis/*`
- `components/requirements-diagnosis/*`
- `components/agent-chat/*`
- `lib/agent-team/*`
- `lib/requirements-diagnosis/*`
- `prisma/schema.prisma`
- `prisma/migrations/0003_requirements_diagnosis/`
- `prisma/migrations/0004_diagnosis_chat_messages/`
- 相关 docs

不要随意回滚未确认来源的改动。

## 建议下一步

推荐优先级：

1. 做 tool-aware diagnosis states，让 Chat 真正从聊天框升级为诊断工作台。
2. 重构结果页中后段信息架构，减少卡片堆叠。
3. 给报告概念补充内联解释和更好的移动端可读性。
4. 统一 `/login` 与需求诊断的视觉调性。
5. 单独排查 `POST /api/agent-team/chat 500`。
