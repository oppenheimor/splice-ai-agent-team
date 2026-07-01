import type { UIMessage } from "ai";
import { evaluateDeepDiagnosisDeliverableReadiness, type DeepDiagnosisDeliverableReadinessSnapshot } from "./deliverable-readiness";
import { buildDeepDiagnosisEvidenceView, type DeepDiagnosisEvidenceView } from "./evidence-view";
import { buildDeepDiagnosisFactCard, type DeepDiagnosisFactCard } from "./fact-card";
import { evaluateDeepDiagnosisReportReadiness, type DeepDiagnosisReportReadinessSnapshot } from "./report-readiness";
import { buildDeepDiagnosisRuntimeQualityGate, type DeepDiagnosisRuntimeQualityGate } from "./runtime-quality-gate";
import { extractDeepDiagnosisRuntimeEvents, normalizeWhitespace, type DeepDiagnosisRuntimeEvents } from "./runtime-events";
import type { DeepDiagnosisState } from "./state-machine";

export type DeepDiagnosisEntryRouteState = {
  hasScopeRoute: boolean;
  selectedOverviewScan: boolean;
  selectedFocusedDeepDive: boolean;
  selectedAssistedClarification: boolean;
  selectedRouteLabel: "先全局盘点" | "聚焦一个问题" | "还说不清楚" | "未选择";
};

export type DeepDiagnosisOpenContextState = {
  businessType: RuntimeSignalState;
  userRole: RuntimeSignalState;
  currentStage: RuntimeSignalState;
  missingLabels: string[];
};

export type RuntimeSignalState = {
  present: boolean;
  evidence?: string;
};

export type DeepDiagnosisProgressState = {
  hasHorizontalScan: boolean;
  hasHypothesisTree: boolean;
  hasEvidenceCoverage: boolean;
  hasQualityGate: boolean;
  hasDeepDiveDirection: boolean;
  hasGenerateReportIntent: boolean;
  hasToolFailure: boolean;
  externalResearchRequired: boolean;
};

export type DeepDiagnosisStateGateSnapshot = {
  state: DeepDiagnosisState;
  label: string;
  status: "complete" | "blocked" | "pending";
  missing: string[];
};

export type DeepDiagnosisRuntimeStateSnapshot = {
  currentState: DeepDiagnosisState;
  transcript: string;
  userTranscript: string;
  assistantTranscript: string;
  entryRoute: DeepDiagnosisEntryRouteState;
  openContext: DeepDiagnosisOpenContextState;
  progress: DeepDiagnosisProgressState;
  factCard: DeepDiagnosisFactCard;
  evidenceView: DeepDiagnosisEvidenceView;
  deliverableReadiness: DeepDiagnosisDeliverableReadinessSnapshot;
  reportReadiness: DeepDiagnosisReportReadinessSnapshot;
  qualityGate: DeepDiagnosisRuntimeQualityGate;
  stateGates: DeepDiagnosisStateGateSnapshot[];
  blockingGates: DeepDiagnosisStateGateSnapshot[];
  previousValidationBlockers: string[];
};

const OPEN_CONTEXT_SIGNAL_DEFINITIONS = [
  {
    id: "businessType",
    label: "业务类型",
    patterns: [/业务类型/, /行业/, /我做/, /我是做/, /教培/, /茶饮/, /门店/, /电商/, /律所/, /SaaS/i],
  },
  {
    id: "userRole",
    label: "用户角色",
    patterns: [/用户角色/, /角色/, /校长/, /老板/, /负责人/, /创始人/, /运营/, /销售/, /设计师/],
  },
  {
    id: "currentStage",
    label: "当前阶段",
    patterns: [/当前阶段/, /阶段/, /起步/, /刚开始/, /\d+\s*个?月/, /\d+\s*年/],
  },
] as const;

export function buildDeepDiagnosisRuntimeState(messages: UIMessage[]): DeepDiagnosisRuntimeStateSnapshot {
  const events = extractDeepDiagnosisRuntimeEvents(messages);
  const transcript = events.allText;
  const entryRoute = buildEntryRouteState(events);
  const openContext = buildOpenContextState(events.userText);
  const factCard = buildDeepDiagnosisFactCard(messages);
  const evidenceView = buildDeepDiagnosisEvidenceView(messages);
  const deliverableReadiness = evaluateDeepDiagnosisDeliverableReadiness(messages);
  const reportReadiness = evaluateDeepDiagnosisReportReadiness(messages);
  const qualityGate = buildDeepDiagnosisRuntimeQualityGate(messages);
  const progress = buildProgressState(events, evidenceView, qualityGate);
  const stateGates = buildStateGateSnapshots({ entryRoute, openContext, progress, factCard, evidenceView, reportReadiness, qualityGate });
  const blockingGates = stateGates.filter((gate) => gate.status === "blocked");

  return {
    currentState: resolveCurrentState(stateGates),
    transcript,
    userTranscript: events.userText,
    assistantTranscript: events.assistantText,
    entryRoute,
    openContext,
    progress,
    factCard,
    evidenceView,
    deliverableReadiness,
    reportReadiness,
    qualityGate,
    stateGates,
    blockingGates,
    previousValidationBlockers: extractPreviousValidationBlockers(messages),
  };
}

export function formatDeepDiagnosisRuntimeStateForPrompt(snapshot: DeepDiagnosisRuntimeStateSnapshot): string {
  const completed = snapshot.stateGates
    .filter((gate) => gate.status === "complete")
    .map((gate) => gate.label);
  const blockers = snapshot.blockingGates.map((gate) => `${gate.label}：缺少 ${gate.missing.join("、")}`);

  return [
    "【Deep Diagnosis 结构化运行状态】",
    `当前状态：${snapshot.currentState}`,
    `入口路线：${snapshot.entryRoute.selectedRouteLabel}`,
    `开放上下文：业务类型=${formatSignal(snapshot.openContext.businessType)}；用户角色=${formatSignal(snapshot.openContext.userRole)}；当前阶段=${formatSignal(snapshot.openContext.currentStage)}`,
    `已完成门禁：${completed.length ? completed.join("、") : "暂无"}`,
    `阻塞门禁：${blockers.length ? blockers.join("；") : "暂无"}`,
    `事实卡状态：${snapshot.factCard.confirmationState}；待确认事实=${snapshot.factCard.pendingFacts.length}；未覆盖区域=${snapshot.factCard.uncoveredAreas.length}`,
    `证据状态：coverage=${snapshot.evidenceView.hasCoverage ? "有" : "无"}；反例=${snapshot.evidenceView.hasCounterEvidence ? "有" : "无"}；来源数=${snapshot.evidenceView.sourceCount}`,
    `质量状态：${snapshot.qualityGate.score}/110；完整报告称谓=${snapshot.qualityGate.canCallCompleteReport ? "允许" : "不允许"}`,
    snapshot.previousValidationBlockers.length ? `上一轮输出裁判阻塞项：${snapshot.previousValidationBlockers.join("；")}` : "上一轮输出裁判阻塞项：暂无",
    "执行纪律：后续决策必须以本结构化状态为准；不要只凭自然语言感觉跳过门禁。",
  ].join("\n");
}

function buildEntryRouteState(events: DeepDiagnosisRuntimeEvents): DeepDiagnosisEntryRouteState {
  const selectedOverviewScan = events.choiceSelectionIds.includes("overview_scan")
    || events.choiceSelectionLabels.includes("先全局盘点")
    || /我(想|要|先).*全局盘点|先全局盘点/.test(events.userText);
  const selectedFocusedDeepDive = events.choiceSelectionIds.includes("focused_deep_dive")
    || events.choiceSelectionLabels.includes("聚焦一个问题")
    || /我(想|要).*聚焦|聚焦一个问题|只看一个问题/.test(events.userText);
  const selectedAssistedClarification = events.choiceSelectionIds.includes("assisted_clarification")
    || events.choiceSelectionLabels.includes("还说不清楚")
    || /还说不清楚|我也说不清|不知道从哪/.test(events.userText);

  return {
    hasScopeRoute: selectedOverviewScan || selectedFocusedDeepDive || selectedAssistedClarification,
    selectedOverviewScan,
    selectedFocusedDeepDive,
    selectedAssistedClarification,
    selectedRouteLabel: selectedOverviewScan
      ? "先全局盘点"
      : selectedFocusedDeepDive
        ? "聚焦一个问题"
        : selectedAssistedClarification
          ? "还说不清楚"
          : "未选择",
  };
}

function buildOpenContextState(transcript: string): DeepDiagnosisOpenContextState {
  const businessType = matchRuntimeSignal(transcript, OPEN_CONTEXT_SIGNAL_DEFINITIONS[0].patterns);
  const userRole = matchRuntimeSignal(transcript, OPEN_CONTEXT_SIGNAL_DEFINITIONS[1].patterns);
  const currentStage = matchRuntimeSignal(transcript, OPEN_CONTEXT_SIGNAL_DEFINITIONS[2].patterns);
  const missingLabels = [
    [OPEN_CONTEXT_SIGNAL_DEFINITIONS[0].label, businessType] as const,
    [OPEN_CONTEXT_SIGNAL_DEFINITIONS[1].label, userRole] as const,
    [OPEN_CONTEXT_SIGNAL_DEFINITIONS[2].label, currentStage] as const,
  ]
    .filter(([, signal]) => !signal.present)
    .map(([label]) => label);

  return {
    businessType,
    userRole,
    currentStage,
    missingLabels,
  };
}

function buildProgressState(
  events: DeepDiagnosisRuntimeEvents,
  evidenceView: DeepDiagnosisEvidenceView,
  qualityGate: DeepDiagnosisRuntimeQualityGate,
): DeepDiagnosisProgressState {
  const assistantText = events.assistantText;
  const userText = events.userText;
  const externalResearchRequired = evidenceView.hasCoverage
    || events.webSearchOutputs.length > 0
    || hasAffirmativeExternalResearchRequest(userText);

  return {
    hasHorizontalScan: hasCompletedHorizontalScan(assistantText),
    hasHypothesisTree: /假设树[\s\S]*根问题[\s\S]*原因分支[\s\S]*要查什么数据[\s\S]*如果不是/.test(assistantText),
    hasEvidenceCoverage: evidenceView.hasCoverage && evidenceView.hasCounterEvidence,
    hasQualityGate: qualityGate.hasReportLikeOutput && /当前级别可用度|完整诊断书成熟度|报告质量 Gate|完整性评分|质量分/.test(assistantText),
    hasDeepDiveDirection: /深挖方向|本轮方向|用户选择的深挖方向/.test(assistantText)
      || /聚焦|只看|深挖/.test(userText),
    hasGenerateReportIntent: hasAffirmativeGenerateReportIntent(events),
    hasToolFailure: evidenceView.hasToolFailure || /工具失败|无法联网|搜索结果不足|空结果/i.test(assistantText),
    externalResearchRequired,
  };
}

function buildStateGateSnapshots(input: {
  entryRoute: DeepDiagnosisEntryRouteState;
  openContext: DeepDiagnosisOpenContextState;
  progress: DeepDiagnosisProgressState;
  factCard: DeepDiagnosisFactCard;
  evidenceView: DeepDiagnosisEvidenceView;
  reportReadiness: DeepDiagnosisReportReadinessSnapshot;
  qualityGate: DeepDiagnosisRuntimeQualityGate;
}): DeepDiagnosisStateGateSnapshot[] {
  return [
    createGate("scope_selection", "诊断范围等级", input.entryRoute.hasScopeRoute ? [] : ["入口范围路由"]),
    createGate("entry", "业务上下文收集", input.openContext.missingLabels),
    createGate("horizontal_scan", "横向扫描门禁", input.progress.hasHorizontalScan ? [] : ["至少 3 个候选业务环节", "可比较评分"]),
    createGate("external_research", "外部证据门禁", input.progress.externalResearchRequired ? input.evidenceView.unverifiedGaps : []),
    createGate("fact_confirmation", "关键事实确认", input.factCard.confirmationState === "confirmed" || input.factCard.confirmationState === "skipped" ? [] : ["用户确认或显式跳过事实卡"]),
    createGate("report_delivery", "完整报告就绪", input.reportReadiness.ready ? [] : [
      ...input.reportReadiness.missingMinimumFactLabels,
      ...(input.reportReadiness.hasBlockingPendingFacts ? ["待确认事实未处理"] : []),
      ...(!input.reportReadiness.reverseSelectionReasonConfirmed ? ["反选原因未确认"] : []),
    ]),
    createGate("quality_gate", "报告质量门禁", input.qualityGate.canCallCompleteReport ? [] : input.qualityGate.blockerLabels.length ? input.qualityGate.blockerLabels : ["质量分未达到完整报告门槛"]),
    createGate("taskification", "下一步任务化", input.qualityGate.hasReportLikeOutput ? [] : ["本周任务", "负责人", "验收标准"], false),
  ];
}

function createGate(
  state: DeepDiagnosisState,
  label: string,
  missing: string[],
  blockedIfMissing = true,
): DeepDiagnosisStateGateSnapshot {
  return {
    state,
    label,
    status: missing.length === 0 ? "complete" : blockedIfMissing ? "blocked" : "pending",
    missing,
  };
}

function resolveCurrentState(gates: DeepDiagnosisStateGateSnapshot[]): DeepDiagnosisState {
  const firstBlockedGate = gates.find((gate) => gate.status === "blocked");
  return firstBlockedGate?.state || "taskification";
}

function matchRuntimeSignal(transcript: string, patterns: readonly RegExp[]): RuntimeSignalState {
  const matchedPattern = patterns.find((pattern) => pattern.test(transcript));
  if (!matchedPattern) return { present: false };

  return {
    present: true,
    evidence: matchedPattern.source,
  };
}

function extractPreviousValidationBlockers(messages: UIMessage[]): string[] {
  return messages
    .flatMap((message) => {
      const metadata = message.metadata;
      if (!isRecord(metadata)) return [];
      const validation = metadata.deepDiagnosisValidation;
      if (!isRecord(validation) || !Array.isArray(validation.violations)) return [];
      return validation.violations
        .filter(isRecord)
        .filter((violation) => violation.severity === "blocker")
        .map((violation) => typeof violation.message === "string" ? violation.message : "")
        .filter(Boolean);
    })
    .slice(-6);
}

function formatSignal(signal: RuntimeSignalState): string {
  return signal.present ? "已识别" : "缺失";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasCompletedHorizontalScan(text: string): boolean {
  const candidateCount = (text.match(/候选(?:业务|岗位)?环节|候选项|候选方向/g) || []).length;
  return /横向扫描/.test(text)
    && /可比较评分|评分分解矩阵|总分/.test(text)
    && /为什么不是其它环节/.test(text)
    && (candidateCount >= 1 || /至少\s*3\s*个候选/.test(text));
}

function hasAffirmativeGenerateReportIntent(events: DeepDiagnosisRuntimeEvents): boolean {
  if (events.choiceSelectionIds.includes("generate_report")) return true;
  if (events.choiceSelectionLabels.some((label) => /出完整方案|出本轮专项方案|出.*专项方案/.test(label))) return true;
  if (/不要|先别|不急|暂时不/.test(events.userText) && /完整方案|完整诊断书|报告/.test(events.userText)) return false;
  return /出完整方案|生成完整方案|拿完整方案|出本轮专项方案|出.*专项方案/.test(events.userText);
}

function hasAffirmativeExternalResearchRequest(text: string): boolean {
  if (/不要.*(行业|外部|竞品|案例|趋势|市场)|不用.*(行业|外部|竞品|案例|趋势|市场)/.test(text)) return false;
  return /行业|外部资料|竞品|案例|趋势|市场数据|同类企业/.test(text);
}
