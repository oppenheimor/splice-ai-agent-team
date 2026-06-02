# 项目记忆

## 项目概况
- Agent Team 平台，每个 Agent 有独立前端页面 + 对话能力 + 差异化 UI
- 技术栈：Next.js 16 + React 19 + TypeScript + Vercel AI SDK + DeepSeek + Prisma + PostgreSQL
- basePath: `/agent-team`，output: standalone（Docker 部署）
- UI 库：shadcn/ui + tailwindcss，treasure-hunt 额外用 animal-island-ui

## 已完成
- treasure-hunt（大喜）Agent：Hero → Chat 完整流程，岛屿主题
- 通用架构：AgentManifest 注册、useAgentChat Hook、AGUI 工具系统、聊天 API
- 认证系统：登录/注册合一 + session cookie + PostgreSQL
- 埋点 + 管理后台（treasure-hunt 专用）

## 当前进行中
- requirements-diagnosis Agent 开发（需求与架构分析已完成，待进入代码实现阶段）

## requirements-diagnosis 关键决策
- 全页面登录保护（Hero/Quiz/Result/Chat 均需登录）
- 图表库：ECharts（非 recharts），需动态 import
- 评测→Chat：1评测:1Chat会话:N轮对话，有评测历史列表
- 数据：localStorage 防刷新 + DB 全量存储，答完即存 DB
- 搜索：Tavily webSearch，Key 在 .env.local
- 头像：渐变色占位，AI 生图提示词已设计（3基底×10倾向色）
- Chat Prompt：11模块设计完成（requirements-diagnosis.ts）
- DB 新增模型：DiagnosisQuizResult + DiagnosisChatSession
- API：/complete（保存+叙事）、/history（评测历史）、/chat 改造

## 关键架构约定
- UIMessage.parts 为渲染中心
- AgentManifest 驱动：prompt / tools / rendererProfile / promptBuilder
- AGUI 工具通过 toolName → renderer 映射渲染
- 对话存储：localStorage（MVP），消息压缩：最近 14 条 + 文本截断 5000 字
- Chat API 最多 4 轮工具调用（stepCountIs(4)）

## 用户偏好
- 文档和注释用中文
- 函数式编程优先
- tsx 不超 500 行
- 边界/复杂逻辑必须写注释
- 临时代码打 TODO 注释
