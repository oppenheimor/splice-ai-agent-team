import { readFileSync } from "node:fs";

const routeSource = readFileSync(new URL("../app/api/agent-team/chat/route.ts", import.meta.url), "utf8");
const loopEngineSource = readFileSync(new URL("../lib/agent-team/chat/loop-engine.ts", import.meta.url), "utf8");
const contextManagerSource = readFileSync(new URL("../lib/deep-diagnosis/context-manager.ts", import.meta.url), "utf8");
const webSearchSource = readFileSync(new URL("../lib/agent-team/external-tools/web-search.ts", import.meta.url), "utf8");
const publishHtmlReportSource = readFileSync(new URL("../lib/agent-team/external-tools/publish-html-report.ts", import.meta.url), "utf8");
const agentRegistrySource = readFileSync(new URL("../lib/agent-team/agents/registry.ts", import.meta.url), "utf8");
const businessMapSource = readFileSync(new URL("../lib/deep-diagnosis/business-map.ts", import.meta.url), "utf8");
const hypothesisTreeSource = readFileSync(new URL("../lib/deep-diagnosis/hypothesis-tree.ts", import.meta.url), "utf8");
const evidenceCompilerSource = readFileSync(new URL("../lib/deep-diagnosis/evidence-compiler.ts", import.meta.url), "utf8");
const stateMachineSource = readFileSync(new URL("../lib/deep-diagnosis/state-machine.ts", import.meta.url), "utf8");
const qualitySource = readFileSync(new URL("../lib/deep-diagnosis/report-quality.ts", import.meta.url), "utf8");
const reportReadinessSource = readFileSync(new URL("../lib/deep-diagnosis/report-readiness.ts", import.meta.url), "utf8");
const deliverableReadinessSource = readFileSync(new URL("../lib/deep-diagnosis/deliverable-readiness.ts", import.meta.url), "utf8");
const decisionPolicySource = readFileSync(new URL("../lib/deep-diagnosis/decision/policy.ts", import.meta.url), "utf8");
const decisionStateSource = readFileSync(new URL("../lib/deep-diagnosis/decision/state.ts", import.meta.url), "utf8");
const decisionFormatSource = readFileSync(new URL("../lib/deep-diagnosis/decision/format.ts", import.meta.url), "utf8");
const factCardSource = readFileSync(new URL("../lib/deep-diagnosis/fact-card.ts", import.meta.url), "utf8");
const evidenceViewSource = readFileSync(new URL("../lib/deep-diagnosis/evidence-view.ts", import.meta.url), "utf8");
const runtimeQualityGateSource = readFileSync(new URL("../lib/deep-diagnosis/runtime-quality-gate.ts", import.meta.url), "utf8");
const runtimeStateSource = readFileSync(new URL("../lib/deep-diagnosis/runtime-state.ts", import.meta.url), "utf8");
const toolGuardSource = readFileSync(new URL("../lib/deep-diagnosis/tool-guard.ts", import.meta.url), "utf8");
const outputValidatorSource = readFileSync(new URL("../lib/deep-diagnosis/output-validator.ts", import.meta.url), "utf8");
const judgeEvaluatorSource = readFileSync(new URL("./evaluate-deep-diagnosis-judge.mjs", import.meta.url), "utf8");
const conversationSimulatorSource = readFileSync(new URL("./evaluate-deep-diagnosis-conversations.mjs", import.meta.url), "utf8");
const protocolSource = readFileSync(new URL("../lib/deep-diagnosis/protocol-data.ts", import.meta.url), "utf8");
const promptSource = readFileSync(new URL("../lib/agent-team/agents/prompts/deep-diagnosis.ts", import.meta.url), "utf8");
const requirementsPromptSource = readFileSync(
  new URL("../lib/agent-team/agents/prompts/requirements-diagnosis.ts", import.meta.url),
  "utf8",
);
const soulSource = readFileSync(new URL("../lib/agent-team/agents/prompts/deep-diagnosis-soul.ts", import.meta.url), "utf8");
const messagePartsRendererSource = readFileSync(new URL("../components/agent-chat/MessagePartsRenderer.tsx", import.meta.url), "utf8");
const webSearchToolRendererSource = readFileSync(
  new URL("../components/agent-chat/tool-renderers/web-search-tool.tsx", import.meta.url),
  "utf8",
);
const visualToolsSource = readFileSync(new URL("../components/agent-chat/tool-renderers/visual-tools.tsx", import.meta.url), "utf8");
const aguiToolsSource = readFileSync(new URL("../lib/agent-team/agui/tools.ts", import.meta.url), "utf8");
const goodReportSource = readFileSync(new URL("./fixtures/deep-diagnosis/content-creation.good.md", import.meta.url), "utf8");
const badReportSource = readFileSync(new URL("./fixtures/deep-diagnosis/content-creation.bad.md", import.meta.url), "utf8");
const hollowReportSource = readFileSync(
  new URL("./fixtures/deep-diagnosis/keyword-stuffed-hollow-report.bad.md", import.meta.url),
  "utf8",
);
const openContextChoiceMismatchBadConversationSource = readFileSync(
  new URL("./fixtures/deep-diagnosis/conversations/open-context-choice-mismatch.bad.md", import.meta.url),
  "utf8",
);
const pendingFactsCompleteReportBadConversationSource = readFileSync(
  new URL("./fixtures/deep-diagnosis/conversations/pending-facts-complete-report.bad.md", import.meta.url),
  "utf8",
);
const customizationOvertriggerBadConversationSource = readFileSync(
  new URL("./fixtures/deep-diagnosis/conversations/customization-overtrigger.bad.md", import.meta.url),
  "utf8",
);
const prematureReportBadCaseSource = readFileSync(
  new URL("./fixtures/deep-diagnosis/education-reverse-selection-premature-report.bad.md", import.meta.url),
  "utf8",
);
const pendingFactsPrematureReportBadCaseSource = readFileSync(
  new URL("./fixtures/deep-diagnosis/education-pending-facts-premature-report.bad.md", import.meta.url),
  "utf8",
);
const uncoveredAreasPrematureCompleteReportBadCaseSource = readFileSync(
  new URL("./fixtures/deep-diagnosis/education-uncovered-areas-premature-complete-report.bad.md", import.meta.url),
  "utf8",
);

const protocol = {
  stages: extractArray("DEEP_DIAGNOSIS_STAGES").map((item) => item.label),
  sections: extractArray("DEEP_DIAGNOSIS_REPORT_SECTIONS"),
  priorityFactors: extractArray("DEEP_DIAGNOSIS_PRIORITY_FACTORS"),
  handoffSignals: extractArray("DEEP_DIAGNOSIS_HUMAN_HANDOFF_SIGNALS"),
  upgradePathLevels: extractArray("DEEP_DIAGNOSIS_UPGRADE_PATH_LEVELS"),
  customizationTriggerSignals: extractArray("DEEP_DIAGNOSIS_CUSTOMIZATION_TRIGGER_SIGNALS"),
  customizationSoftSignals: extractArray("DEEP_DIAGNOSIS_CUSTOMIZATION_SOFT_SIGNALS"),
  customizationHardSignals: extractArray("DEEP_DIAGNOSIS_CUSTOMIZATION_HARD_SIGNALS"),
  customizationBlockingSignals: extractArray("DEEP_DIAGNOSIS_CUSTOMIZATION_BLOCKING_SIGNALS"),
  customizationReadinessRules: extractArray("DEEP_DIAGNOSIS_CUSTOMIZATION_READINESS_RULES"),
  customHandoffQuestions: extractArray("DEEP_DIAGNOSIS_CUSTOM_HANDOFF_QUESTIONS"),
  antiEmptyReportRules: extractArray("DEEP_DIAGNOSIS_ANTI_EMPTY_REPORT_RULES"),
  bottleneckTypes: extractArray("DEEP_DIAGNOSIS_BOTTLENECK_TYPES"),
  deliverableAssetTypes: extractArray("DEEP_DIAGNOSIS_DELIVERABLE_ASSET_TYPES"),
  externalResearchSections: extractArray("DEEP_DIAGNOSIS_EXTERNAL_RESEARCH_SECTIONS"),
  scopeLevels: extractArray("DEEP_DIAGNOSIS_SCOPE_LEVELS"),
  entryRoutes: extractArray("DEEP_DIAGNOSIS_ENTRY_ROUTES").map((item) => item.label),
  multiProblemScanRules: extractArray("DEEP_DIAGNOSIS_MULTI_PROBLEM_SCAN_RULES"),
  interactionContracts: extractArray("DEEP_DIAGNOSIS_INTERACTION_CONTRACTS"),
  reportReadinessRules: extractArray("DEEP_DIAGNOSIS_REPORT_READINESS_RULES"),
  reportLevels: extractArray("DEEP_DIAGNOSIS_REPORT_LEVELS"),
  assetQualityCriteria: extractArray("DEEP_DIAGNOSIS_ASSET_QUALITY_CRITERIA"),
  todos: extractArray("DEEP_DIAGNOSIS_TODOS"),
};

const sampleCases = [
  {
    role: "企业主",
    input: "我是做本地生活服务的企业主，想知道客服、销售跟进和门店排班哪个更适合先用 AI 改造。",
    expectedSignals: ["业务环节", "优先级", "预算", "企业微信", "第一瓶颈"],
  },
  {
    role: "设计师",
    input: "我是公司内部设计师，想用 AI 提升素材整理、初稿生成和需求沟通效率。",
    expectedSignals: ["岗位流程", "工作流", "人审", "验证指标", "可用资产"],
  },
  {
    role: "运营/销售",
    input: "我负责私域运营和销售跟进，想判断 AI 能不能帮我做线索分层、话术生成和复盘看板。",
    expectedSignals: ["线索", "自动化", "数据看板", "失败信号", "暂不建议"],
  },
];

const checks = [
  protocolHasAll("诊断阶段", protocol.stages),
  protocolHasAll("诊断书结构", protocol.sections),
  protocolHasAll("优先级评分因素", protocol.priorityFactors),
  protocolHasAll("人工承接信号", protocol.handoffSignals),
  protocolHasAll("升级路径分层", protocol.upgradePathLevels),
  protocolHasAll("定制触发信号", protocol.customizationTriggerSignals),
  protocolHasAll("定制软信号", protocol.customizationSoftSignals),
  protocolHasAll("定制硬信号", protocol.customizationHardSignals),
  protocolHasAll("定制阻塞信号", protocol.customizationBlockingSignals),
  protocolHasAll("定制 readiness 规则", protocol.customizationReadinessRules),
  protocolHasAll("定制承接问题", protocol.customHandoffQuestions),
  protocolHasAll("空洞报告防线", protocol.antiEmptyReportRules),
  protocolHasAll("瓶颈类型", protocol.bottleneckTypes),
  protocolHasAll("可交付资产类型", protocol.deliverableAssetTypes),
  protocolHasAll("外部分析对照结构", protocol.externalResearchSections),
  protocolHasAll("横向扫描矩阵列", extractArray("DEEP_DIAGNOSIS_HORIZONTAL_SCAN_MATRIX_COLUMNS")),
  protocolHasAll("事实确认去路选项", extractArray("DEEP_DIAGNOSIS_FACT_CONFIRMATION_OPTIONS")),
  protocolHasAll("证据绑定列", extractArray("DEEP_DIAGNOSIS_EVIDENCE_BINDING_COLUMNS")),
  protocolHasAll("报告双评分口径", extractArray("DEEP_DIAGNOSIS_REPORT_SCORE_SECTIONS")),
  protocolHasAll("诊断范围等级", protocol.scopeLevels),
  protocolHasAll("入口范围路由", protocol.entryRoutes),
  protocolHasAll("多问题横扫规则", protocol.multiProblemScanRules),
  protocolHasAll("交互契约", protocol.interactionContracts),
  protocolHasAll("完整报告就绪规则", protocol.reportReadinessRules),
  protocolHasAll("报告级别命名", protocol.reportLevels),
  protocolHasAll("可用资产质量", protocol.assetQualityCriteria),
  protocolHasAll("暂缓事项 TODO", protocol.todos),
  sampleCasesCoverRoles("样例角色覆盖", ["企业主", "设计师", "运营/销售"]),
  includesAll("Prompt 引用诊断协议", ["DEEP_DIAGNOSIS_STAGES", "DEEP_DIAGNOSIS_REPORT_SECTIONS", "DEEP_DIAGNOSIS_PRIORITY_FACTORS"]),
  includesAll("Prompt 接入 Soul 层", ["buildDeepDiagnosisSoulPrompt", "Deep Diagnosis 专属覆盖层"]),
  sourceIncludesAll("Soul 只定义身份与语气", soulSource, ["Deep Diagnosis Soul", "你是谁", "核心气质", "说话方式", "如何处理不确定性", "如何表达分歧", "避免事项"]),
  sourceIncludesAll("Soul 避免项目规则污染", soulSource, ["不要在这一层写项目路径、命令、工具参数、接口规则或仓库约定"]),
  sourceIncludesAll("Soul 强化诊断顾问人格", soulSource, ["AI 落地诊断顾问", "温暖，但不讨好", "直接，但不粗暴", "不假装知道", "不建议现在先做这个", "不要为了转化而硬推定制开发"]),
  includesAll("Prompt 分层架构", ["本 prompt 是表达层", "决策策略层决定本轮", "结构化运行状态", "事实卡", "证据视图", "当前可交付物就绪判定", "运行时质量 Gate"]),
  includesAll("Prompt 引用诊断骨架", ["DEEP_DIAGNOSIS_BOTTLENECK_TYPES", "DEEP_DIAGNOSIS_SCOPE_LEVELS", "DEEP_DIAGNOSIS_REPORT_LEVELS", "DEEP_DIAGNOSIS_DELIVERABLE_ASSET_TYPES"]),
  includesAll("Prompt 外部分析对照", ["DEEP_DIAGNOSIS_EXTERNAL_RESEARCH_SECTIONS", "用户现场的对照", "Evidence Compiler", "未验证缺口"]),
  includesAll("Prompt 外部搜索节制", ["默认每个外部研究节点只做 1 次综合搜索", "才补搜 1 次", "coverage 不足", "缺反例"]),
  sourceIncludesAll("基础 Prompt 默认一次综合搜索", requirementsPromptSource, ["默认只做一次综合搜索", "才允许补搜 1 次", "coverage 明显不足", "不要为了行业趋势、案例、工具选型各查一次"]),
  includesAll("Prompt 强制瓶颈诊断", ["第一瓶颈", "证据来源", "取舍理由", "真实样本", "可用资产"]),
  includesAll("Prompt 强制验证闭环", ["成功阈值", "失败阈值", "推翻当前结论"]),
  includesAll("Prompt 强制范围与横扫", ["诊断范围等级", "报告级别", "横向扫描", "Universal Business Map"]),
  includesAll("Prompt 强制横扫矩阵", ["DEEP_DIAGNOSIS_HORIZONTAL_SCAN_MATRIX_COLUMNS", "横向扫描矩阵列"]),
  includesAll("Prompt 强制入口路由", ["入口范围", "formatEntryRoutesForPrompt", "先全局盘点", "聚焦一个问题", "还说不清楚"]),
  includesAll("Prompt 强制多问题横扫", ["多选候选问题", "用户可以全选", "业务横向扫描 + 单流程深度诊断"]),
  includesAll("Prompt 强制交互契约", ["交互契约", "DEEP_DIAGNOSIS_INTERACTION_CONTRACTS", "不要让正文提出一个开放式问题，同时又调用一个只能选择的 UI 工具"]),
  includesAll("Prompt 强制全局盘点前置上下文", ["业务类型、用户角色、当前阶段", "text 输入", "不调用 askUserChoice"]),
  includesAll("Prompt 接入业务地图", ["Universal Business Map", "formatBusinessMapForPrompt"]),
  includesAll("Prompt 接入假设树", ["诊断假设树", "formatHypothesisTreesForPrompt", "要查什么数据", "如果不是"]),
  includesAll("Prompt 接入证据编译器", ["Evidence Compiler", "formatEvidenceCompilerForPrompt"]),
  includesAll("Prompt 强制事实确认", ["已确认事实", "待确认事实", "未覆盖区域", "事实卡和完整报告就绪判定是硬依据"]),
  includesAll("Prompt 强制事实确认去路", ["DEEP_DIAGNOSIS_FACT_CONFIRMATION_OPTIONS", "假设简报", "继续补事实"]),
  includesAll("Prompt 强制完整报告就绪门禁", ["最小事实包", "真实样本或明确缺失", "策略层允许"]),
  includesAll("Prompt 强制证据链和反例", ["反例", "工具失败", "证据视图"]),
  includesAll("Prompt 强制证据绑定", ["DEEP_DIAGNOSIS_EVIDENCE_BINDING_COLUMNS", "证据绑定表", "未验证缺口"]),
  includesAll("Prompt 强制质量门禁", ["运行时质量 Gate", "canCallCompleteReport=false", "完整诊断书"]),
  includesAll("Prompt 强制双评分口径", ["DEEP_DIAGNOSIS_REPORT_SCORE_SECTIONS", "当前级别可用度", "完整诊断书成熟度", "formatDeepDiagnosisReportScoreGuidanceForPrompt"]),
  includesAll("Prompt 强制接地气", ["用户当前现场", "当前基线", "低成本", "7 天内", "现在不用做什么"]),
  includesAll("Prompt 强制落地边界", ["落地方式", "formatLandingModesForPrompt", "可用资产必须满足以下质量标准"]),
  includesAll("Prompt 强制升级路径", ["升级路径", "DEEP_DIAGNOSIS_UPGRADE_PATH_LEVELS", "canMentionCustomization", "canRecommendCustomization"]),
  includesAll("Prompt 服从决策策略层", ["Deep Diagnosis 决策策略层", "运行时裁判", "优先级高于本 prompt", "策略层允许"]),
  includesAll("Prompt 强制定制 readiness", ["定制 readiness 规则", "DEEP_DIAGNOSIS_CUSTOMIZATION_READINESS_RULES", "不要在报告结尾硬塞销售话术"]),
  includesAll("Prompt 引用人工承接边界", ["DEEP_DIAGNOSIS_HUMAN_HANDOFF_SIGNALS", "企业微信只作为高意向承接出口", "DEEP_DIAGNOSIS_CUSTOM_HANDOFF_QUESTIONS", "自助方案不足以安全推进"]),
  includesAll("当前交付物与发布流程", ["offer_current_deliverable_publish", "publish_current_deliverable", "generate_report", "publishHtmlReport", "发布 HTML 前", "HTML 已发布", "线上发布失败"]),
  sourceIncludesAll("Loop Engine max_turn", loopEngineSource, ["maxTurns: 10", "deep-diagnosis", "stepCountIs"]),
  sourceIncludesAll("API 接入 Loop 与上下文管理", routeSource, ["resolveAgentLoopConfig", "buildDeepDiagnosisManagedContext", "buildAgentStopCondition"]),
  sourceIncludesAll("API 接入工具硬门禁", routeSource, ["decideNextDeepDiagnosisAction", "resolveDeepDiagnosisToolGuard", "activeTools", "prepareStep"]),
  sourceIncludesAll("API 接入输出裁判", routeSource, ["validateDeepDiagnosisOutput", "attachDeepDiagnosisValidationMetadata", "withDeepDiagnosisValidationMetadata"]),
  sourceIncludesAll("上下文管理保留证据", contextManagerSource, ["已抽取的用户事实候选", "工具状态", "报告生成前必须"]),
  sourceIncludesAll("Decision Policy 规则管线", decisionPolicySource, ["DeepDiagnosisDecisionRule", "DEEP_DIAGNOSIS_DECISION_RULES", "hardBlocks", "forbiddenPhrases", "maxReportLevel", "canRecommendCustomization"]),
  sourceIncludesAll("Decision Policy 强制全局盘点多选", decisionPolicySource, ["overview_scan_requires_multi_problem_selection", "ask_multi_problem_selection", "multiple_choice", "mode=multiple", "minSelections=1", "不要设置 maxSelections"]),
  sourceIncludesAll("Decision Policy 状态提取", decisionStateSource, ["buildDeepDiagnosisDecisionState", "buildDeepDiagnosisRuntimeState", "runtimeState", "missingOpenContextLabels", "customization", "hasToolFailure"]),
  sourceIncludesAll("Decision Policy 注入 Prompt", decisionFormatSource, ["Deep Diagnosis 决策策略层", "本轮允许动作", "最高报告级别", "禁止表达"]),
  sourceIncludesAll("上下文管理注入 Decision Policy", contextManagerSource, ["decideNextDeepDiagnosisAction", "formatDeepDiagnosisDecisionForPrompt"]),
  sourceIncludesAll("结构化事实卡", factCardSource, ["DeepDiagnosisFactCard", "confirmedFacts", "pendingFacts", "uncoveredAreas", "confirmationState"]),
  sourceIncludesAll("证据视图模型", evidenceViewSource, ["DeepDiagnosisEvidenceView", "coverageStatement", "sourceCount", "unverifiedGaps"]),
  sourceIncludesAll("当前可交付物就绪模型", deliverableReadinessSource, ["DeepDiagnosisDeliverableReadinessSnapshot", "canOfferPublish", "confirmedToPublish", "发布 HTML 前必须先让用户明确确认"]),
  sourceIncludesAll("运行时质量 Gate", runtimeQualityGateSource, ["DeepDiagnosisRuntimeQualityGate", "enforcedReportLevel", "judgeDeepDiagnosisReportText", "不得称为完整诊断书"]),
  sourceIncludesAll("结构化运行状态快照", runtimeStateSource, ["DeepDiagnosisRuntimeStateSnapshot", "currentState", "stateGates", "blockingGates", "previousValidationBlockers"]),
  sourceIncludesAll("结构化运行状态聚合产品层", runtimeStateSource, ["buildDeepDiagnosisFactCard", "buildDeepDiagnosisEvidenceView", "evaluateDeepDiagnosisDeliverableReadiness", "evaluateDeepDiagnosisReportReadiness", "buildDeepDiagnosisRuntimeQualityGate"]),
  sourceIncludesAll("Tool Guard", toolGuardSource, ["resolveDeepDiagnosisToolGuard", "disabledTools", "askUserChoice", "canUseChoiceTool"]),
  sourceIncludesAll("Output Validator", outputValidatorSource, ["validateDeepDiagnosisOutput", "buildDeepDiagnosisRuntimeState", "deepDiagnosisValidation", "forbiddenPhrases", "report_level_overreach", "quality_gate_failed", "pending_facts_complete_report", "choice_mode_mismatch"]),
  sourceIncludesAll("上下文管理注入产品化骨架", contextManagerSource, ["formatDeepDiagnosisRuntimeStateForPrompt", "formatDeepDiagnosisFactCardForPrompt", "formatDeepDiagnosisEvidenceViewForPrompt", "formatDeepDiagnosisDeliverableReadinessForPrompt", "formatDeepDiagnosisRuntimeQualityGateForPrompt"]),
  sourceIncludesAll("Judge Evaluator", judgeEvaluatorSource, ["keyword-stuffed-hollow-report.bad.md", "golden report 可以通过 Judge", "关键词堆砌空洞报告不能通过 Judge"]),
  sourceIncludesAll("Conversation Simulator", conversationSimulatorSource, ["fixtures/deep-diagnosis/conversations", "requiredByFile", "process.exitCode"]),
  sourceIncludesAll("Universal Business Map", businessMapSource, ["DEEP_DIAGNOSIS_BUSINESS_MAP", "acquisition", "conversion", "retention", "baselineSignals"]),
  sourceIncludesAll("Diagnosis Hypothesis Tree", hypothesisTreeSource, ["DEEP_DIAGNOSIS_HYPOTHESIS_TREES", "rootQuestion", "requiredSignals", "ifFalseImplication"]),
  sourceIncludesAll("Evidence Compiler", evidenceCompilerSource, ["compileWebSearchEvidence", "coverage", "counterEvidence", "evidenceLevel"]),
  sourceIncludesAll("webSearch 接入 Evidence Compiler", webSearchSource, ["compileWebSearchEvidence", "compiledEvidence", "searchedQuestions"]),
  sourceIncludesAll("MessagePartsRenderer 合并 webSearch", messagePartsRendererSource, ["webSearchParts", "firstWebSearchIndex", "webSearchOutputs", "isWebSearchPart", "data={webSearchOutputs.length === 1 ? webSearchOutputs[0] : webSearchOutputs}"]),
  sourceIncludesAll("WebSearchTool 支持多次检索汇总", webSearchToolRendererSource, ["normalizeWebSearchOutputs", "mergeWebSearchOutputs", "dedupeResults", "searchCount", "其余"]),
  sourceIncludesAll("CardsTool 支持语义化卡片组", visualToolsSource, ["CardGroupVariant", "resolveCardGroupVariant", "CardMatrix", "MetricsBlock", "metricsDisplay", "variant === \"comparison\""]),
  sourceIncludesAll("AGUI showCards 暴露卡片协议字段", aguiToolsSource, ["variant", "density", "emphasis", "metricsDisplay", "recommendation", "comparison", "insight"]),
  sourceIncludesAll("Prompt 约束 showCards 语义", requirementsPromptSource, ["showCards 必须先声明语义", "variant: recommendation", "variant: comparison", "layout: matrix", "不要把对比矩阵硬塞成厚重大卡片"]),
  sourceIncludesAll("状态机门禁", stateMachineSource, ["入口范围路由", "业务类型", "用户角色", "当前阶段", "horizontal_scan", "fact_confirmation", "report_delivery", "最小事实包", "quality_gate", "taskification"]),
  sourceIncludesAll("Report Judge", qualitySource, ["DEEP_DIAGNOSIS_QUALITY_CHECKS", "judgeDeepDiagnosisReportText", "canCallCompleteReport", "verdict", "revisionHints", "antiPatterns", "第一瓶颈可信度", "因果链", "证据强度", "可执行资产质量", "接地气程度", "currentLevelUsabilityScore", "completeReportMaturityScore"]),
  sourceIncludesAll("运行期完整报告就绪判定", reportReadinessSource, ["evaluateDeepDiagnosisReportReadiness", "missingMinimumFactLabels", "keyFactsConfirmed", "hasBlockingPendingFacts", "hasUncoveredAreas", "reverseSelectionReasonConfirmed", "本轮禁止出现「出完整方案」"]),
  sourceIncludesAll("上下文管理注入就绪判定", contextManagerSource, ["buildDeepDiagnosisReportReadinessContext", "报告生成前必须"]),
  sourceIncludesAll("HTML 发布工具已注册", agentRegistrySource, ["deep-diagnosis", "publishHtmlReport"]),
  sourceIncludesAll("HTML 发布接口接入", publishHtmlReportSource, ["https://splice-ai.cn/html-publish/api/publish", "FormData", "\"files\"", "\"filePaths\"", "\"publishPath\"", "http://118.196.86.98", "https://splice-ai.cn"]),
  sourceIncludesAll("HTML 发布提示词接入", promptSource, ["调用 publishHtmlReport", "HTML 已发布", "只有 publishHtmlReport 返回 url 后", "不得称为完整诊断书"]),
  sourceIncludesAll("HTML 发布决策接入", decisionPolicySource, ["confirmed_generate_report", "confirmed_publish_current_deliverable", "ready_offer_current_deliverable_publish", "publishHtmlReport"]),
  sourceIncludesAll("HTML 发布剩余 TODO 边界", protocolSource, ["TODO: publishHtmlReport 当前已接入真实 HTML 发布", "TODO: deep-diagnosis 独立会话", "TODO: 深度诊断价格 / 价值边界"]),
  fixtureHasAll("Golden case 覆盖质量信号", goodReportSource, ["诊断范围声明", "报告级别", "横向扫描", "已确认事实", "搜索覆盖范围", "反例", "完整性评分", "下一步任务化清单", "假设树", "要查什么数据", "用户现场", "当前基线", "低成本", "7 天内", "不用", "最小事实包", "用户确认", "升级路径与定制适配度", "自助工具版", "工作流模板版", "系统 / Agent 定制版", "系统化升级判断"]),
  fixtureLacksAny("反例 case 缺少关键门禁", badReportSource, ["诊断范围声明", "横向扫描", "已确认事实", "反例", "报告质量 Gate"]),
  fixtureHasAll("关键词堆砌空洞坏例覆盖新 Judge", hollowReportSource, ["诊断范围声明", "候选业务环节", "第一瓶颈", "证据来源", "可用资产", "建议加强", "形成闭环", "根据实际情况", "建议直接做系统 / Agent 定制版"]),
  fixtureHasAll("教培反选坏例覆盖真实 UAT 失败", prematureReportBadCaseSource, ["教培", "深挖复购/续费", "优先级最低", "webSearch", "现在信息够出一版完整方案", "出完整方案"]),
  fixtureLacksAll("教培反选坏例缺少就绪门禁", prematureReportBadCaseSource, ["为什么你更想看", "用户确认关键事实", "最小事实包", "用户确认："]),
  fixtureHasAll("教培待确认事实坏例覆盖真实 UAT 失败", pendingFactsPrematureReportBadCaseSource, ["待确认事实", "地推月成本", "招生目标", "线上账号", "现在信息已经够出一版完整方案", "出完整方案"]),
  fixtureLacksAll("教培待确认事实坏例缺少完成确认", pendingFactsPrematureReportBadCaseSource, ["显式跳过", "用户确认：", "无阻塞项"]),
  fixtureHasAll("教培未覆盖区域坏例覆盖真实 UAT 失败", uncoveredAreasPrematureCompleteReportBadCaseSource, ["未覆盖区域", "课程交付标准化", "复购体系", "排课运营", "财务分析", "出完整方案"]),
  fixtureLacksAll("教培未覆盖区域坏例缺少范围扩展选择", uncoveredAreasPrematureCompleteReportBadCaseSource, ["出本轮专项方案", "继续看未覆盖模块", "获客专项方案"]),
  fixtureHasAll("对话坏例覆盖开放上下文与选择冲突", openContextChoiceMismatchBadConversationSource, ["业务类型、角色、当前阶段", "mode: multiple", "nextAction: ask_open_context", "inputMode: text"]),
  fixtureHasAll("对话坏例覆盖待确认事实完整报告", pendingFactsCompleteReportBadConversationSource, ["待确认事实", "未覆盖区域", "出完整方案", "nextAction: ask_missing_facts", "maxReportLevel: hypothesis_brief"]),
  fixtureHasAll("对话坏例覆盖定制过度触发", customizationOvertriggerBadConversationSource, ["只命中软信号", "建议直接做系统 / Agent 定制版", "canRecommendCustomization: false", "forbiddenPhrases"]),
];

const failed = checks.filter((check) => !check.passed);

for (const check of checks) {
  if (check.passed) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ ${check.name}：缺少 ${check.missing.join("、")}`);
  }
}

if (failed.length > 0) {
  process.exitCode = 1;
}

function includesAll(name, required) {
  return sourceIncludesAll(name, promptSource, required);
}

function sourceIncludesAll(name, source, required) {
  const missing = required.filter((item) => !source.includes(item));
  return {
    name,
    passed: missing.length === 0,
    missing,
  };
}

function fixtureHasAll(name, source, required) {
  return sourceIncludesAll(name, source, required);
}

function fixtureLacksAny(name, source, forbidden) {
  const present = forbidden.filter((item) => source.includes(item));
  return {
    name,
    passed: present.length < forbidden.length,
    missing: present.length < forbidden.length ? [] : ["bad case 不应完整覆盖所有质量门禁"],
  };
}

function fixtureLacksAll(name, source, forbidden) {
  const present = forbidden.filter((item) => source.includes(item));
  return {
    name,
    passed: present.length === 0,
    missing: present.length === 0 ? [] : present,
  };
}

function protocolHasAll(name, required) {
  const missing = required.filter((item) => !protocolSource.includes(item));
  return {
    name,
    passed: missing.length === 0,
    missing,
  };
}

function sampleCasesCoverRoles(name, requiredRoles) {
  const roles = sampleCases.map((item) => item.role);
  const missing = requiredRoles.filter((role) => !roles.includes(role));
  return {
    name,
    passed: missing.length === 0,
    missing,
  };
}

function extractArray(name) {
  const start = protocolSource.indexOf(`export const ${name} = [`);
  if (start === -1) {
    throw new Error(`未找到 ${name}`);
  }

  const arrayStart = protocolSource.indexOf("[", start);
  let depth = 0;

  for (let index = arrayStart; index < protocolSource.length; index += 1) {
    const char = protocolSource[index];
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;
    if (depth === 0) {
      const arraySource = protocolSource.slice(arrayStart, index + 1);
      return parseArrayLiteral(arraySource);
    }
  }

  throw new Error(`无法解析 ${name}`);
}

function parseArrayLiteral(arraySource) {
  const jsSource = arraySource
    .replace(/\bsatisfies\s+[^\n;]+/g, "")
    .replace(/\bas const/g, "");
  return Function(`"use strict"; return (${jsSource});`)();
}
