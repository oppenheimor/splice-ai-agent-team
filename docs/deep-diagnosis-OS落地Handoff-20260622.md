# Handoff：Deep Diagnosis OS 落地

更新时间：2026-06-22 03:43:19 +0800

## 当前目标

把 `deep-diagnosis` 从“靠 prompt 自律的深度聊天”升级为一套可收费、可评估、可持续迭代的 `Deep Diagnosis OS`。

核心变化不是让报告更长，而是让系统先完成业务横向扫描、瓶颈定位、假设树、证据对照、质量 Gate，再生成诊断报告。目标是让用户感觉“这份诊断确实理解了我的业务现场，而且钱花得值”。

## 重要约束

- Repo：`/Users/paulchess/Desktop/Home/entrepreneurship/splice-ai-agent-team`
- 文档和注释使用中文。
- 不回滚当前脏工作区内未确认来源的改动。
- `publishHtmlReport` 真实 HTML 发布和二维码生成本轮不处理，已列入 TODO。
- `deep-diagnosis` 独立服务端会话持久化本轮不处理，已列入 TODO。
- 深度诊断价格 / 价值边界本轮不处理，后续单独设计。

## 本轮已落地内容

### 1. Loop Engine

新增：

- `lib/agent-team/chat/loop-engine.ts`

已实现：

- `deep-diagnosis` 最大轮次提升到 `maxTurns: 10`。
- 默认 agent 仍保持较轻的停止条件。
- `app/api/agent-team/chat/route.ts` 已接入 `resolveAgentLoopConfig` 和 `buildAgentStopCondition`。

目的：

- 修复原先 `stepCountIs(4)` 不足以支撑完整深度诊断的问题。

### 2. 上下文管理

新增：

- `lib/deep-diagnosis/context-manager.ts`

已实现：

- 从长对话中抽取工作记忆。
- 保留用户事实、工具状态、证据线索和报告前必须确认的信息。
- `app/api/agent-team/chat/route.ts` 已接入 `buildDeepDiagnosisManagedContext`。

目的：

- 降低长对话压缩后丢失关键证据、用户事实和工具失败状态的风险。

### 3. 状态机门禁

新增：

- `lib/deep-diagnosis/state-machine.ts`

覆盖阶段：

- `horizontal_scan`
- `fact_confirmation`
- `quality_gate`
- `taskification`

目的：

- 修复原先“只有 prompt 阶段描述，没有工程状态机”的问题。

### 4. Universal Business Map

新增：

- `lib/deep-diagnosis/business-map.ts`

覆盖业务环节：

- 获客
- 转化
- 交付
- 复购
- 客服
- 内容
- 运营
- 供应链
- 财务
- 管理协同
- 数据分析

导出：

- `DEEP_DIAGNOSIS_BUSINESS_MAP`
- `formatBusinessMapForPrompt`

目的：

- 修复首轮入口容易把用户锁进单一路径的问题。
- 支撑“先横向扫描，再定位第一瓶颈”。

### 5. Diagnosis Hypothesis Tree

新增：

- `lib/deep-diagnosis/hypothesis-tree.ts`

已覆盖问题结构：

- 获客不足
- 转化偏弱
- 复购不足
- 内容产能不足
- 交付质量不稳定

导出：

- `DEEP_DIAGNOSIS_HYPOTHESIS_TREES`
- `formatHypothesisTreesForPrompt`

目的：

- 修复“直接给建议但没有假设树”的空洞诊断问题。
- 要求每个核心问题说明：要查什么数据、如果是怎么修、如果不是排除什么。

### 6. Evidence Compiler

新增：

- `lib/deep-diagnosis/evidence-compiler.ts`

已实现：

- 将 `webSearch` 结果编译为结构化证据块。
- 输出 `coverage`、`evidence`、`counterEvidence`、`unverifiedGaps`。
- 支持 A / B / C / D 证据等级。
- 工具失败、无 API Key、搜索失败时显式输出失败状态。

已接入：

- `lib/agent-team/external-tools/web-search.ts`

目的：

- 修复外部搜索没有 coverage 声明、没有反例机制、没有原始引用链、工具失败被文本补偿掩盖的问题。

### 7. Report Judge

新增 / 升级：

- `lib/deep-diagnosis/report-quality.ts`

110 分质量规则：

| 模块 | 分值 | 必须出现的信号 |
|---|---:|---|
| 诊断范围与报告级别 | 15 | 诊断范围声明、报告级别、未覆盖区域 |
| 横向扫描 | 15 | 候选业务环节、可比较评分、为什么不是其它环节 |
| 第一瓶颈定位 | 15 | 第一瓶颈、瓶颈类型、证据来源 |
| 诊断假设树 | 15 | 假设树、要查什么数据、如果是、如果不是 |
| 证据链可信 | 15 | 搜索覆盖范围、原始引用链、证据等级、反例 |
| 方案可执行 | 15 | 可用资产、负责人、验收标准、失败后 |
| 顾问感表达 | 10 | 暂不建议、不适用、退出标准 |
| 接地气程度 | 10 | 用户现场、当前基线、低成本、7 天内、不用 |

判定规则：

- 总分低于 90 分，不能叫“完整诊断书”。
- 任一 15 分模块缺失，不能叫“完整诊断书”。

接地气程度是 2026-06-22 新增评估项。它要求报告不要只像咨询模板，而要贴着用户现场给低成本动作：引用用户原话或现场事实，给出当前基线，优先推荐零成本 / 低成本方案，明确 7 天内能试跑什么，并说明现在不用做的大设备、大系统或重投入方向。

目的：

- 修复报告质量只靠 prompt 自律的问题。

### 8. Prompt 与协议集成

修改：

- `lib/agent-team/agents/prompts/deep-diagnosis.ts`
- `lib/deep-diagnosis/protocol-data.ts`
- `lib/deep-diagnosis/protocol.ts`
- `lib/deep-diagnosis/types.ts`

关键变化：

- 接入 Universal Business Map。
- 接入 Diagnosis Hypothesis Tree。
- 接入 Evidence Compiler。
- 接入 Report Judge。
- 增加诊断范围等级和报告级别。
- 增加用户关键事实确认。
- 增加外部分析报告和诊断报告的区分。
- 增加未覆盖区域章节。
- 增加失败后怎么办的分支。
- 增加下一步任务化清单。
- 修正评分方向：所有评分均为分数越高越值得做，使用“风险可控性 / 成本友好度”等正向指标。
- 人设、用户类型、初诊标签只能作为先验，不能覆盖当前用户原话。

### 8.1 入口范围路由器

新增 / 修改：

- `lib/deep-diagnosis/protocol-data.ts`
- `lib/deep-diagnosis/protocol.ts`
- `lib/deep-diagnosis/types.ts`
- `lib/agent-team/agents/prompts/deep-diagnosis.ts`
- `components/deep-diagnosis/DeepDiagnosisChatShell.tsx`

已实现：

- 新增 `DEEP_DIAGNOSIS_ENTRY_ROUTES`：
  - 先全局盘点
  - 聚焦一个问题
  - 还说不清楚
- 新增 `DEEP_DIAGNOSIS_MULTI_PROBLEM_SCAN_RULES`。
- 冷启动时禁止直接问“最头疼的问题是哪一个”并强制单选。
- 当用户选择全局盘点时，必须用 `askUserChoice` 的 `multiple` 模式收集 2-5 个候选问题。
- 当用户选择全局盘点但业务类型、用户角色、当前阶段缺失时，必须先用纯文本追问这些开放信息，不能同轮弹多选卡片。
- 多问题用户必须先横向扫描，再推荐优先深挖 1-2 个。
- 多问题横扫后只深挖一个流程时，报告命名为“业务横向扫描 + 单流程深度诊断”，不能伪称完整业务全局诊断。

### 8.2 交互契约

新增 / 修改：

- `lib/deep-diagnosis/protocol-data.ts`
- `lib/deep-diagnosis/state-machine.ts`
- `lib/agent-team/agents/prompts/deep-diagnosis.ts`
- `scripts/evaluate-deep-diagnosis.mjs`

已实现：

- 新增 `DEEP_DIAGNOSIS_INTERACTION_CONTRACTS`。
- 明确每一轮只能承载一种用户输入形态：开放文本或结构化选择。
- 正文出现“请告诉我 / 先说说 / 补充一下 / 写下”这类开放式必答要求时，本轮不能调用 `askUserChoice`。
- 调用 `askUserChoice` 时，正文只能写一句简短承接，所有必答内容必须能在卡片选项或 `allowOther` 输入框中完成。
- 如果既需要业务类型 / 角色 / 阶段，又需要多选候选环节，必须拆成两轮。

目的：

- 修复“正文要求用户填写业务类型和角色，但下方只给选择卡片”的体验错位。
- 防止后续继续出现工具卡片和自然语言承诺不一致的低级问题。
- 承接“用户很多方面都想咨询”的真实测试场景。
- 避免入口单选把用户锁进单一路径，导致后续诊断遗漏经营复杂度。

### 8.3 完整报告就绪门禁

新增 / 修改：

- `lib/deep-diagnosis/protocol-data.ts`
- `lib/deep-diagnosis/protocol.ts`
- `lib/deep-diagnosis/state-machine.ts`
- `lib/agent-team/agents/prompts/deep-diagnosis.ts`
- `scripts/evaluate-deep-diagnosis.mjs`

已实现：

- 新增 `DEEP_DIAGNOSIS_REPORT_READINESS_RULES`。
- 「出完整方案」选项只能在关键事实确认之后出现。
- 进入完整报告前必须具备最小事实包：业务类型、用户角色、当前阶段、深挖方向、当前基线、真实样本或明确缺失、目标指标、资源约束。
- 如果用户选择的深挖方向与横向扫描推荐方向不一致，必须先追问用户为什么坚持该方向。
- 用户反选低优先级方向但未说明原因时，最多只能输出方向风险提示或假设简报，不能进入完整诊断报告。
- `hypothesis_brief` 状态下不能提供「出完整方案」选项，只能提供「继续补关键信息」或「先看假设简报」。

目的：

- 修复“没问几个问题就进入完整诊断书”的付费感问题。
- 修复“出完整报告前没有让用户确认关键事实”的门禁失效问题。

补充实现：

- 新增 `lib/deep-diagnosis/report-readiness.ts`，在运行期判断最小事实包、关键事实确认、反选原因是否齐全。
- `report-readiness` 新增 `hasBlockingPendingFacts`，将非空「待确认事实」视为完整报告阻塞项，除非用户显式跳过并降级为假设简报。
- `report-readiness` 新增 `hasUncoveredAreas`，将非空「未覆盖区域」转为范围边界：只能输出本轮专项方案，并引导用户继续看未覆盖模块。
- `buildDeepDiagnosisManagedContext` 已接入完整报告就绪判定；未就绪时会注入「本轮禁止出现『出完整方案』选项」。
- 新增 bad fixture：`scripts/fixtures/deep-diagnosis/education-reverse-selection-premature-report.bad.md`。
- 新增 bad fixture：`scripts/fixtures/deep-diagnosis/education-pending-facts-premature-report.bad.md`。
- 新增 bad fixture：`scripts/fixtures/deep-diagnosis/education-uncovered-areas-premature-complete-report.bad.md`。
- `scripts/evaluate-deep-diagnosis.mjs` 已检查该真实 UAT 失败路径，防止 webSearch 后绕过用户事实确认。

### 8.5 升级路径与定制适配度

新增 / 修改：

- `lib/deep-diagnosis/protocol-data.ts`
- `lib/deep-diagnosis/protocol.ts`
- `lib/agent-team/agents/prompts/deep-diagnosis.ts`
- `scripts/evaluate-deep-diagnosis.mjs`
- `scripts/fixtures/deep-diagnosis/content-creation.good.md`

已实现：

- 新增 `DEEP_DIAGNOSIS_UPGRADE_PATH_LEVELS`，要求高优先级机会点必须提供三层路径：自助工具版、工作流模板版、系统 / Agent 定制版。
- 新增 `DEEP_DIAGNOSIS_CUSTOMIZATION_TRIGGER_SIGNALS`，只有命中触发信号时，才允许把系统、Agent、看板、自动化、业务嵌入式方案作为升级判断。
- 新增 `DEEP_DIAGNOSIS_CUSTOM_HANDOFF_QUESTIONS`，把人工承接改成“还需要确认哪些事实”，而不是报告末尾硬销售。
- 扩展 `DEEP_DIAGNOSIS_HUMAN_HANDOFF_SIGNALS`，将定制承接限定为风险边界或系统化升级判断。
- Prompt 新增 `## 9.1 升级路径与定制适配度`，要求每个高优先级机会点写清：今天怎么自助试跑、如何固化为团队工作流、什么条件下才值得系统 / Agent 定制。
- Golden case 已补充“升级路径与定制适配度”和“系统化升级判断”样例。
- 评估脚本已新增检查：升级路径分层、定制触发信号、定制承接问题、Prompt 强制升级路径。

设计原则：

- 不在报告结尾加销售话术。
- 把定制能力嵌入具体方案成熟度：先自助工具版，再工作流模板版，最后才是系统 / Agent 定制版。
- 如果没有触发信号，报告应建议先自助试跑或流程模板化。
- 如果命中触发信号，报告写“系统化升级判断”：当前为什么可能值得升级、还缺哪些事实、最小试点是什么、失败后如何回退。
- 系统 / Agent 定制判断必须落到 harness 层：工具、知识、观测数据、动作接口和权限边界。只写“可以做 Agent / 自动化系统”不合格。

目的：

- 让用户在诊断里自然看到“从今天能做的小动作，到团队可复制流程，再到系统化嵌入”的连续路径。
- 给高意向用户留下定制承接入口，但不破坏诊断报告的专业可信度。
- 对齐 Agentic Engineering 的思路：不是一次性给建议，而是把高价值动作放进可验证、可升级、可闭环的流程里。
- 对齐 `SkillForge` 的企业级经验：定制能力应从真实流程、真实工具、失败反馈和诊断证据中长出来，而不是从报告结尾的话术里长出来。

### 9. EvidencePanel

修改：

- `components/deep-diagnosis/EvidencePanel.tsx`

已实现：

- 优先展示 `compiledEvidence.evidence`。
- 展示证据等级 badge。
- 展示来源标题、链接和摘要。

注意：

- 该文件已有视觉常量和样式改动，如 `deepDiagnosisDivider`、`deepDiagnosisFocusRing`、`deepDiagnosisBlueBadge`，不要回滚。

### 10. Evaluation / Golden Case

新增 / 修改：

- `scripts/evaluate-deep-diagnosis.mjs`
- `scripts/fixtures/deep-diagnosis/content-creation.good.md`
- `scripts/fixtures/deep-diagnosis/content-creation.bad.md`

当前评估覆盖：

- Universal Business Map 是否接入。
- Diagnosis Hypothesis Tree 是否接入。
- Evidence Compiler 是否接入。
- 入口范围路由是否接入。
- 多问题横扫规则是否接入。
- `webSearch` 是否返回 `compiledEvidence`。
- Report Judge 是否有 90 分门槛。
- Golden case 是否覆盖范围、横扫、事实确认、证据、反例、假设树、质量 Gate 和任务化。
- Bad case 是否缺失关键质量门禁。

## 已验证命令

以下命令已通过：

```bash
node scripts/evaluate-deep-diagnosis.mjs
pnpm lint lib/deep-diagnosis/business-map.ts lib/deep-diagnosis/hypothesis-tree.ts lib/deep-diagnosis/evidence-compiler.ts lib/deep-diagnosis/report-quality.ts lib/deep-diagnosis/protocol.ts lib/deep-diagnosis/protocol-data.ts lib/deep-diagnosis/types.ts lib/agent-team/agents/prompts/deep-diagnosis.ts lib/agent-team/external-tools/web-search.ts components/deep-diagnosis/EvidencePanel.tsx scripts/evaluate-deep-diagnosis.mjs
pnpm exec tsc --noEmit
```

## 关键文件清单

核心诊断模块：

- `lib/deep-diagnosis/business-map.ts`
- `lib/deep-diagnosis/hypothesis-tree.ts`
- `lib/deep-diagnosis/evidence-compiler.ts`
- `lib/deep-diagnosis/report-quality.ts`
- `lib/deep-diagnosis/context-manager.ts`
- `lib/deep-diagnosis/state-machine.ts`
- `lib/deep-diagnosis/protocol-data.ts`
- `lib/deep-diagnosis/protocol.ts`
- `lib/deep-diagnosis/types.ts`

Agent / API：

- `lib/agent-team/agents/prompts/deep-diagnosis.ts`
- `lib/agent-team/external-tools/web-search.ts`
- `lib/agent-team/chat/loop-engine.ts`
- `app/api/agent-team/chat/route.ts`

UI：

- `components/deep-diagnosis/EvidencePanel.tsx`
- `components/deep-diagnosis/DeepDiagnosisChatShell.tsx`
- `components/deep-diagnosis/DeepDiagnosisLanding.tsx`
- `components/deep-diagnosis/styles.ts`
- `app/deep-diagnosis/page.tsx`
- `app/deep-diagnosis/chat/[id]/page.tsx`

评估：

- `scripts/evaluate-deep-diagnosis.mjs`
- `scripts/fixtures/deep-diagnosis/content-creation.good.md`
- `scripts/fixtures/deep-diagnosis/content-creation.bad.md`

文档：

- `docs/2026-06-22-deep-diagnosis-优化执行计划.md`

## 当前工作区状态

当前工作区仍有大量未提交改动，包含 deep-diagnosis 本轮新增文件和其他既有改动。不要使用 `git reset --hard` 或回滚未知来源文件。

最近一次观察到的状态包括：

- `app/api/agent-team/chat/route.ts`
- `app/deep-diagnosis/chat/[id]/page.tsx`
- `app/deep-diagnosis/page.tsx`
- `components/agent-chat/MessagePartsRenderer.tsx`
- `components/requirements-diagnosis/DiagnosisChatShell.tsx`
- `docs/2026-06-22-deep-diagnosis-优化执行计划.md`
- `lib/agent-team/agents/prompts/deep-diagnosis.ts`
- `lib/agent-team/agents/registry.ts`
- `lib/agent-team/external-tools/web-search.ts`
- `components/deep-diagnosis/`
- `lib/agent-team/chat/loop-engine.ts`
- `lib/deep-diagnosis/`
- `scripts/evaluate-deep-diagnosis.mjs`
- `scripts/fixtures/`
- `skills-lock.json`

## 仍未完成 / TODO

### P0 / P1 后续工程化

1. 把 Report Judge 从“文本包含信号检查”升级为结构化报告解析和运行时强制 Gate。
2. 增加更多 benchmark fixtures，按问题结构覆盖，而不是按行业穷举。
3. 继续扩展 Decision Policy，但保持小规则管线，不要把所有顾问判断都规则化。
4. 建立 20 到 30 个 golden / counter cases：
   - 获客不足
   - 转化偏弱
   - 复购不足
   - 内容产能不足
   - 交付质量不稳定
   - 客服响应慢
   - 运营执行不稳
   - 管理协同低效
   - 数据分析缺口
5. 把诊断范围、事实卡、证据块、假设树、质量分数在 UI 里显式展示。
6. 增加“用户可编辑事实卡”，让用户在生成完整报告前确认关键事实。
7. 对 `compiledEvidence` 做更严格的来源分级，避免普通搜索结果默认过宽。
8. 增加真实用户 UAT，对比茶饮单店私域测试的 78/100 基线。

### Decision Policy 已落地

新增：

- `lib/deep-diagnosis/decision/types.ts`
- `lib/deep-diagnosis/decision/state.ts`
- `lib/deep-diagnosis/decision/policy.ts`
- `lib/deep-diagnosis/decision/format.ts`
- `lib/deep-diagnosis/decision/index.ts`

已接入：

- `lib/deep-diagnosis/context-manager.ts` 注入【Deep Diagnosis 决策策略层】。
- `lib/agent-team/agents/prompts/deep-diagnosis.ts` 明确策略层优先于 prompt 通用写作建议。
- `lib/deep-diagnosis/protocol-data.ts` 新增定制软信号、硬信号、阻塞信号和 readiness 规则。
- `scripts/evaluate-deep-diagnosis.mjs` 检查策略层、定制 readiness 和 conversation bad cases。

新增 conversation bad cases：

- `scripts/fixtures/deep-diagnosis/conversations/open-context-choice-mismatch.bad.md`
- `scripts/fixtures/deep-diagnosis/conversations/pending-facts-complete-report.bad.md`
- `scripts/fixtures/deep-diagnosis/conversations/customization-overtrigger.bad.md`

当前策略层覆盖：

- 入口路由缺失。
- 全局盘点前开放上下文缺失。
- 待确认事实阻塞完整方案。
- 最小事实包缺失。
- 关键事实确认缺失。
- 未覆盖区域导致专项方案降级。
- 完整报告就绪确认。
- 定制软 / 硬 / 阻塞信号分层。
- 工具失败披露。

### 产品化五块骨架已落地

新增：

- `lib/deep-diagnosis/fact-card.ts`
- `lib/deep-diagnosis/evidence-view.ts`
- `lib/deep-diagnosis/runtime-quality-gate.ts`
- `scripts/evaluate-deep-diagnosis-conversations.mjs`

已接入：

- `context-manager` 注入事实卡、证据视图、运行时质量 Gate。
- `protocol.ts` 导出事实卡、证据视图和运行时质量 Gate。
- `decision/state.ts` 增加 `hasHypothesisTree`、`hasEvidenceCoverage`、`hasQualityGate`。
- `decision/policy.ts` 增加横向扫描、假设树、外部证据 coverage、质量 Gate 中间门禁。
- `deep-diagnosis` prompt 明确结构层优先于普通表达。

当前定位：

- 事实卡：把已确认事实、待确认事实、未覆盖区域变成结构化状态。
- 证据视图：把外部来源、coverage、反例、工具失败变成结构化状态。
- 运行时质量 Gate：把 Report Judge 从报告文本检查推进到上下文强约束。
- Conversation Simulator：把多轮坏例固定成可回归资产。
- Decision Policy 2.0：不只拦最终报告，也拦中间诊断跳步。

### 暂缓事项

1. `publishHtmlReport` 真实发布和二维码生成。
2. `deep-diagnosis` 独立服务端会话持久化。
3. 深度诊断价格 / 价值边界。

## 已记录的重要 UAT 基线

人工测试案例：

- 茶饮单店新店私域沉淀。

旧流程评分：

- 78/100。

主要扣分点：

- 横向扫描缺少可比较评分。
- 外部证据缺少来源链。
- 没有 coverage 声明。
- 没有反例机制。
- 评分方向混乱。
- 缺少经营基线。
- 没有诊断假设树。

记录位置：

- `docs/2026-06-22-deep-diagnosis-优化执行计划.md`
- 章节：`## 12. 人工实测 UAT 记录：茶饮单店私域沉淀`

## 方法论基线

Deep Diagnosis OS 主流程：

```text
范围判断 -> 横向扫描 -> 瓶颈定位 -> 假设树 -> 证据对照 -> 方案设计 -> 质量评分 -> 任务化
```

记录位置：

- `docs/2026-06-22-deep-diagnosis-优化执行计划.md`
- 章节：`## 13. 通用方法论：Deep Diagnosis OS`

## 下一步建议

建议接手后从这里开始：

1. 先重新运行验证命令，确认当前工作区仍可通过。
2. 继续 85 -> 90：把 `state-machine.ts` 从描述性状态升级为真正的结构化状态快照，减少正则误判。
3. 后续新增能力不要直接补 prompt，先写行为判定表、正反例、状态机 / UI 承接检查和模拟对话测试。
4. 增加 5 个问题结构 benchmark，不要先按行业扩散。
5. 继续 90 -> 94：把 Report Judge 从关键词评分升级为维度化裁判，至少覆盖“因果合理性、第一瓶颈可信度、反选理由、可执行资产质量、接地气程度”。
6. 真正文本级硬拦要改造 stream：使用自定义 `createUIMessageStream` 或 UI 消费 `metadata.deepDiagnosisValidation` 后展示降级状态。
7. 做一轮真实手工 UAT，使用新 OS 产出的报告重新打分，对比旧茶饮案例 78/100。
8. 再考虑 UI，把事实卡、证据块、假设树和质量分数产品化展示出来。

## 接手时的第一动作

第一步执行：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-runtime.mjs
node scripts/evaluate-deep-diagnosis-conversations.mjs
pnpm exec tsc --noEmit
```

如果这两条通过，再继续做 benchmark 和运行时质量 Gate。如果失败，优先修复 deep-diagnosis 新增模块，不要顺手重构 requirements-diagnosis。

## 最新进展：78 -> 85 硬门禁

已新增：

- `lib/deep-diagnosis/tool-guard.ts`
- `lib/deep-diagnosis/output-validator.ts`
- `scripts/evaluate-deep-diagnosis-runtime.mjs`

已接入：

- `app/api/agent-team/chat/route.ts` 计算 `Decision Policy` 后，通过 `activeTools` 和 `prepareStep` 收窄 deep-diagnosis 可用工具。
- 当本轮必须自由文本输入或当前动作不允许选择卡片时，运行时禁用 `askUserChoice`。
- assistant 回复完成后执行 `Output Validator`，结果写入最后一条 assistant message 的 `metadata.deepDiagnosisValidation`。

当前边界：

- 工具越权已经是硬约束。
- 文本越权目前是完成后验证和持久化 metadata，尚未替换已经发出的流式文本。
- 下一阶段要把 metadata 用到上下文管理或 UI 告警里，避免“裁判记录了失败，但用户侧无感”。

已通过：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-runtime.mjs
node scripts/evaluate-deep-diagnosis-conversations.mjs
pnpm lint app/api/agent-team/chat/route.ts lib/deep-diagnosis/tool-guard.ts lib/deep-diagnosis/output-validator.ts scripts/evaluate-deep-diagnosis.mjs scripts/evaluate-deep-diagnosis-runtime.mjs
pnpm exec tsc --noEmit
```

## 最新进展：85 -> 90 结构化状态

已新增：

- `lib/deep-diagnosis/runtime-state.ts`

已接入：

- `decision/state.ts` 从 `buildDeepDiagnosisRuntimeState` 派生决策状态。
- `context-manager.ts` 注入 `formatDeepDiagnosisRuntimeStateForPrompt`。
- `output-validator.ts` 从同一份 runtime snapshot 读取事实卡与证据视图。
- `evaluate-deep-diagnosis.mjs` 和 `evaluate-deep-diagnosis-runtime.mjs` 增加结构化状态覆盖检查。

runtime snapshot 当前包含：

- `currentState`
- `entryRoute`
- `openContext`
- `progress`
- `factCard`
- `evidenceView`
- `reportReadiness`
- `qualityGate`
- `stateGates`
- `blockingGates`
- `previousValidationBlockers`

当前边界：

- 状态已经统一成可机读结构，但底层识别仍有启发式正则。
- 这一步解决的是“状态来源分散”和“模块各自判断”的问题，不等于 Report Judge 已经能做语义裁判。
- 后续新增状态必须进 `runtime-state.ts`，不要回到各模块散落判断。

已通过：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-runtime.mjs
pnpm lint lib/deep-diagnosis/runtime-state.ts lib/deep-diagnosis/decision/state.ts lib/deep-diagnosis/decision/types.ts lib/deep-diagnosis/context-manager.ts lib/deep-diagnosis/output-validator.ts scripts/evaluate-deep-diagnosis.mjs scripts/evaluate-deep-diagnosis-runtime.mjs
pnpm exec tsc --noEmit
```

## 最新进展：90 -> 94 Report Judge 真裁判

已改造：

- `lib/deep-diagnosis/report-quality.ts`
- `lib/deep-diagnosis/runtime-quality-gate.ts`
- `lib/deep-diagnosis/output-validator.ts`

已新增：

- `scripts/fixtures/deep-diagnosis/keyword-stuffed-hollow-report.bad.md`
- `scripts/evaluate-deep-diagnosis-judge.mjs`

当前 Judge 能力：

- 维度化评分，不再只是 requiredSignals 关键词检查。
- 输出 `verdict`：`pass / revise / downgrade / continue_diagnosis`。
- 输出 `revisionHints`，用于告诉系统哪里需要修订或继续诊断。
- 维度包含空洞话术反模式，能拦“建议加强、提升效率、形成闭环、根据实际情况、持续优化”等泛化表达。
- golden report 必须 `pass` 且 `score >= 90`。
- 关键词堆砌坏例即使命中大量报告关键词，也必须非 `pass` 且存在 blocker。

Judge 维度：

- 诊断范围与报告级别。
- 横向扫描。
- 第一瓶颈可信度。
- 因果链。
- 证据强度。
- 可执行资产质量。
- 接地气程度。
- 反选与暂不做判断。
- 定制升级适配度。

当前边界：

- 这是 deterministic Judge，不是 LLM-as-judge。
- 它已经能处理关键词齐全但逻辑空洞的坏例，但还不能证明覆盖所有行业和所有报告形态。
- 94 -> 98 的下一步不是继续堆规则，而是扩 benchmark：至少 5 个问题结构、3 个行业、每类 golden/bad 成对 fixture，再做真实 UAT 回放。

已通过：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-runtime.mjs
node scripts/evaluate-deep-diagnosis-judge.mjs
node scripts/evaluate-deep-diagnosis-conversations.mjs
pnpm lint lib/deep-diagnosis/report-quality.ts lib/deep-diagnosis/runtime-quality-gate.ts lib/deep-diagnosis/output-validator.ts scripts/evaluate-deep-diagnosis.mjs scripts/evaluate-deep-diagnosis-runtime.mjs scripts/evaluate-deep-diagnosis-judge.mjs
pnpm exec tsc --noEmit
```
