# Handoff：需求诊断正式页 Mono Capsule 风格迁移

## 当前目标

把 `/requirements-diagnosis/demo-consulting` 中选定的 `Mono Capsule` 样板墙风格，迁移到正式 `/requirements-diagnosis` 智能体页面全流程。

这次迁移的重点不是“换色板 / 换圆角”，而是把正式页面从桌面优先的咨询页、报告页、后台列表和传统聊天壳，重塑成 **移动端优先的诊断 App 产品体验**。

## 关键结论

`/demo-consulting` 真正要迁移的是右侧手机里的产品语言，不是左侧 demo wall 桌面说明区。

核心视觉语言：

- 深色背景只是舞台。
- 白色 / 近白色 App screen 是正式内容发生的地方。
- 默认按移动端手机屏设计，再扩展到 desktop。
- 信息以纵向胶囊列表呈现，不做传统 SaaS 三列卡片。
- 主 CTA 固定在内容底部，优先服务拇指触控。
- 选中态使用黑底白字、厚重阴影和明显反馈。
- 标题用粗黑、紧凑、直接的产品语气。
- Desktop 端只展开辅助上下文，不重新变成 landing page 或 dashboard。

## 使用过的设计依据

### Wiki 检索

按 `AGENTS.md` 规则，UI / skill / impeccable 相关 Wiki 命中超过 10 个文件，因此派 Explore Agent 隔离筛选 top-3。

本次参考：

- `~/wiki-global/wiki/patterns/design-skill-layering.md`
  - 当前任务属于“整理层 + 还原层 + 系统化层”，不是重新发明视觉风格。
- `~/wiki-global/wiki/patterns/same-content-style-wall-screening.md`
  - 样板墙的价值是固定内容骨架，筛选风格方向，然后迁移到真实页面。
- `~/wiki-global/wiki/patterns/anti-ai-slop-frontend-prompting.md`
  - 约束迁移结果不要滑回普通 AI SaaS 皮肤。

Wiki 中暂未找到专门讲 mobile-first 迁移验收清单的文档，后续值得补充。

### Impeccable

已读取本地 skill：

- `/Users/paulchess/.agents/skills/impeccable/SKILL.md`
- `reference/product.md`
- `reference/shape.md`
- `reference/adapt.md`

本次使用方式：

- `shape` 思路：先确认全站设计 brief，不直接动代码。
- `adapt` 思路：移动端优先，desktop 是扩展，不是重做。
- `product` register：这是任务型产品界面，设计服务于完成诊断流程。

当前项目没有 `PRODUCT.md` / `DESIGN.md`，`impeccable` loader 输出：

```json
{
  "hasProduct": false,
  "hasDesign": false,
  "contextDir": "/Users/paulchess/Desktop/Home/entrepreneurship/splice-ai-agent-team"
}
```

后续如果继续强化品牌一致性，可以补 `PRODUCT.md` / `DESIGN.md`，或运行 impeccable 的 `teach` / `document` 流程。

## 已修改范围

### 共享样式

文件：

- `components/requirements-diagnosis/styles.ts`

新增 / 重塑的关键 token：

- `diagnosisStage`
- `diagnosisAppScreen`
- `diagnosisWideScreen`
- `diagnosisTopNav`
- `diagnosisIconButton`
- `diagnosisBottomActions`
- `diagnosisDesktopCompanion`

这些 token 是正式页 mobile-first App Shell 的核心。后续新增页面应优先复用它们。

### 首页

文件：

- `app/requirements-diagnosis/page.tsx`

改动：

- 首页主内容改成白色 App screen。
- 移动端默认就是最终体验。
- 标题、说明、三条能力说明、底部 CTA 按 demo home screen 顺序组织。
- Desktop 端右侧只显示辅助说明和登录状态，不再主导页面结构。
- 最近评测仍保留，但作为 App screen 后的延续内容。

### 问卷页

文件：

- `app/requirements-diagnosis/quiz/page-client.tsx`

改动：

- 问卷页改成手机 App screen。
- 顶部为返回按钮、进度 badge、标题。
- 进度条进入白屏内部。
- 单选 / 多选都改成胶囊选项。
- 选中态为黑底白字，隐藏原生 radio / checkbox 的视觉存在。
- 底部只保留主 CTA。
- Desktop 右侧展示辅助说明和进度，不改变问卷主体节奏。

保留逻辑：

- `localStorage` 续答。
- `transitionPrompts` 中场提示。
- `calculateDiagnosis`。
- 最终跳转到 `/requirements-diagnosis/result`。

### 结果页

文件：

- `app/requirements-diagnosis/result/page-client.tsx`
- `components/requirements-diagnosis/DiagnosisResultReport.tsx`

改动：

- 结果页从“报告卡片堆叠”改成手机报告流。
- 首屏重点为人格 code、人格名、定义、AI 层级、刚需方向。
- 五维形状改成更接近 demo result 的小型进度条列表。
- 本周动作提前到主信息流。
- 后续行动洞察、AI 实践画像、推荐路径、三步建议、结尾话术都保留，但改成胶囊 section。
- 底部 CTA 为“深度诊断 / 重新评测”。
- Desktop 右侧显示转化提示和完整维度 meter。

保留逻辑：

- 本地结果读取。
- 自动保存诊断结果。
- SSE 流式叙事生成。
- 自动重试。
- `onRetry`。
- `mergeNarrative`。

### 历史页

文件：

- `app/requirements-diagnosis/history/page.tsx`

改动：

- 历史页改成移动端记录卡流。
- 顶部为返回、History badge、标题、退出按钮。
- 每条记录为可点击胶囊卡，展示 AI level、消息数、人格名、定义、继续诊断入口。
- 底部保留重新评测 / 最近结果。
- Desktop 右侧展示记录数量和最近三条概览。

保留逻辑：

- 登录用户过滤。
- `diagnosisQuizResult.findMany`。
- `diagnosisChatMessage.groupBy` 统计消息数。
- `fromDiagnosisRecord`。

### Chat 页

文件：

- `components/requirements-diagnosis/DiagnosisChatShell.tsx`

改动：

- Chat 主体改成手机聊天 App screen。
- 顶部为返回历史、Agent 名、人格 code、查看报告入口。
- 消息气泡接近 demo chat：assistant 浅色，user 黑底。
- 空状态不再是大工作台卡片，而是第一条 assistant 引导 + prompt 胶囊 + 结构化判断块。
- 输入区固定在底部：浅灰输入胶囊 + 黑色发送按钮。
- Desktop 右侧展示人格摘要、AI 层级、用户类型、刚需方向和返回历史。

保留逻辑：

- `useAgentChat`。
- `conversationId`。
- `quizResultId` request body。
- `MessagePartsRenderer`。
- `addToolOutput`。
- `sendText`。
- `stop`。
- 自动滚动到底部。

## 没有修改 / 不应修改的范围

未主动修改 demo 样板墙逻辑：

- `app/requirements-diagnosis/demo-consulting/*`
- `app/requirements-diagnosis/demo-boardroom/*`
- `app/requirements-diagnosis/demo-instrument/*`
- `components/requirements-diagnosis/demo/*`

这些仍作为风格参考和静态样板墙存在。

未修改核心业务逻辑：

- scoring
- quiz 数据
- persistence
- chat hook
- API route
- Prisma schema
- agent prompt

## 验证记录

已通过：

```bash
pnpm exec tsc --noEmit
pnpm build
git diff --check -- app/requirements-diagnosis components/requirements-diagnosis
```

`pnpm lint` 结果：

- 无本次改动导致的 error。
- 仍有 6 个既有 warning，来源在 `.codex/get-shit-done/bin/lib/*`，本次未处理。

生产构建已确认包含路由：

- `/requirements-diagnosis`
- `/requirements-diagnosis/quiz`
- `/requirements-diagnosis/result`
- `/requirements-diagnosis/history`
- `/requirements-diagnosis/chat/[id]`
- `/requirements-diagnosis/demo-*`

## 浏览器验证情况

当前项目配置了：

```js
basePath: "/agent-team"
```

正确访问路径示例：

- `http://localhost:3000/agent-team/requirements-diagnosis`
- `http://localhost:3000/agent-team/requirements-diagnosis/demo-consulting`

已有 dev server：

- `http://localhost:3000`
- PID: `6082`

浏览器检查：

- demo 参考页可访问，并已截图：
  - `/tmp/rd-demo-mobile-reference.png`
- 正式页受登录保护，未登录访问会重定向：
  - `/agent-team/login?next=%2Frequirements-diagnosis`
  - 因此当前未完成正式页面登录态截图。

如需截图正式页面，需要先登录测试账号或使用已有登录态。

## 当前风险与后续建议

### 1. 需要登录态视觉验收

虽然类型检查和构建均通过，但正式页面受登录保护，当前未做登录后逐页截图。

建议下一步：

1. 使用测试账号登录。
2. 分别截图 mobile / desktop：
   - 首页
   - 问卷
   - 结果
   - 历史
   - Chat 空态
   - Chat 有消息态
3. 对照 `/demo-consulting` 的五个静态 screen 做视觉验收。

### 2. 结果页信息仍然较长

结果页已经从报告卡堆叠改成 App 流，但真实数据较多，移动端仍可能较长。

后续可考虑：

- 将部分 section 折叠。
- 按“首屏摘要 / 行动建议 / 细节报告”拆成 tabs。
- 只在 desktop companion 区展示完整维度详情。

### 3. Chat 的工具态还只是视觉占位

空状态中已经表达“结构化判断”，但真正 tool-aware workspace 还没实现。

后续如果要升级：

- 将追问、假设、行动项做成结构化 tool result。
- `MessagePartsRenderer` 里增加需求诊断专属 tool card。
- Chat 主屏保留消息流，右侧或下方沉淀结构化产物。

### 4. Impeccable 项目上下文缺失

当前没有 `PRODUCT.md` / `DESIGN.md`，后续继续用 impeccable 时会缺项目级设计上下文。

建议补充：

- `PRODUCT.md`：用户、使用场景、产品调性、反方向。
- `DESIGN.md`：Mono Capsule 的颜色、圆角、阴影、布局、状态规范。

## 接手建议

如果继续推进，建议按以下顺序：

1. 登录正式页并截图所有页面。
2. 对照 `/demo-consulting` 的 home / quiz / result / history / chat 逐页检查。
3. 优先修移动端，再修 desktop。
4. 不要再回到传统 desktop hero / report card / admin list / dashboard chat。
5. 对每个新样式先问：它是否像右侧手机里的产品，而不是像左侧 demo wall 的说明页。

## 本轮核心文件清单

- `components/requirements-diagnosis/styles.ts`
- `app/requirements-diagnosis/page.tsx`
- `app/requirements-diagnosis/quiz/page-client.tsx`
- `app/requirements-diagnosis/result/page-client.tsx`
- `components/requirements-diagnosis/DiagnosisResultReport.tsx`
- `app/requirements-diagnosis/history/page.tsx`
- `components/requirements-diagnosis/DiagnosisChatShell.tsx`

