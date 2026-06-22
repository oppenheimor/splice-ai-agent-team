import type { UIMessage } from "ai";
import { buildDeepDiagnosisEvidenceView, type DeepDiagnosisEvidenceView } from "./evidence-view";
import { buildDeepDiagnosisFactCard, type DeepDiagnosisFactCard } from "./fact-card";
import { evaluateDeepDiagnosisReportReadiness, type DeepDiagnosisReportReadinessSnapshot } from "./report-readiness";
import { buildDeepDiagnosisRuntimeQualityGate, type DeepDiagnosisRuntimeQualityGate } from "./runtime-quality-gate";
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
  entryRoute: DeepDiagnosisEntryRouteState;
  openContext: DeepDiagnosisOpenContextState;
  progress: DeepDiagnosisProgressState;
  factCard: DeepDiagnosisFactCard;
  evidenceView: DeepDiagnosisEvidenceView;
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
  const transcript = normalizeWhitespace(extractConversationText(messages));
  const entryRoute = buildEntryRouteState(transcript);
  const openContext = buildOpenContextState(transcript);
  const factCard = buildDeepDiagnosisFactCard(messages);
  const evidenceView = buildDeepDiagnosisEvidenceView(messages);
  const reportReadiness = evaluateDeepDiagnosisReportReadiness(messages);
  const qualityGate = buildDeepDiagnosisRuntimeQualityGate(messages);
  const progress = buildProgressState(transcript, evidenceView, qualityGate);
  const stateGates = buildStateGateSnapshots({ entryRoute, openContext, progress, factCard, evidenceView, reportReadiness, qualityGate });
  const blockingGates = stateGates.filter((gate) => gate.status === "blocked");

  return {
    currentState: resolveCurrentState(stateGates),
    transcript,
    entryRoute,
    openContext,
    progress,
    factCard,
    evidenceView,
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

function buildEntryRouteState(transcript: string): DeepDiagnosisEntryRouteState {
  const selectedOverviewScan = /先全局盘点|overview_scan/.test(transcript);
  const selectedFocusedDeepDive = /聚焦一个问题|focused_deep_dive/.test(transcript);
  const selectedAssistedClarification = /还说不清楚|assisted_clarification/.test(transcript);

  return {
    hasScopeRoute: selectedOverviewScan || selectedFocusedDeepDive || selectedAssistedClarification || /入口范围路由/.test(transcript),
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
  transcript: string,
  evidenceView: DeepDiagnosisEvidenceView,
  qualityGate: DeepDiagnosisRuntimeQualityGate,
): DeepDiagnosisProgressState {
  return {
    hasHorizontalScan: /横向扫描|候选业务环节|至少\s*3\s*个候选|可比较评分/.test(transcript),
    hasHypothesisTree: /假设树|根问题|原因分支|要查什么数据|如果不是/.test(transcript),
    hasEvidenceCoverage: evidenceView.hasCoverage && evidenceView.hasCounterEvidence,
    hasQualityGate: qualityGate.hasReportLikeOutput || /报告质量 Gate|完整性评分|质量分|110\s*分|低于\s*90\s*分/.test(transcript),
    hasDeepDiveDirection: /深挖方向|本轮方向|用户选择的深挖方向|聚焦/.test(transcript),
    hasGenerateReportIntent: /generate_report|出完整方案|出本轮专项方案|出获客专项方案|完整诊断书/.test(transcript),
    hasToolFailure: evidenceView.hasToolFailure || /工具失败|无法联网|搜索结果不足|空结果|warning|error/i.test(transcript),
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
    createGate("external_research", "外部证据门禁", input.evidenceView.unverifiedGaps),
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

function extractConversationText(messages: UIMessage[]): string {
  return messages
    .flatMap((message) => message.parts || [])
    .map((part) => {
      if (part.type === "text" && "text" in part) return String(part.text || "");
      if (String(part.type).startsWith("tool-")) return JSON.stringify(part);
      return "";
    })
    .join("\n");
}

function formatSignal(signal: RuntimeSignalState): string {
  return signal.present ? "已识别" : "缺失";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
