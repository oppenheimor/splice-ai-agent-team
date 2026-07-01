import type { UIMessage } from "ai";
import { buildDeepDiagnosisDecisionState } from "./state";
import type {
  DeepDiagnosisDecision,
  DeepDiagnosisDecisionPatch,
  DeepDiagnosisDecisionRule,
  DeepDiagnosisDecisionState,
} from "./types";

const REPORT_LEVEL_RANK: Record<DeepDiagnosisDecision["maxReportLevel"], number> = {
  hypothesis_brief: 0,
  external_research_report: 1,
  single_problem_report: 2,
  workflow_report: 3,
  overview_scan_plus_workflow_report: 4,
  role_scope_report: 5,
  business_overview_report: 6,
};

const DEEP_DIAGNOSIS_DECISION_RULES: DeepDiagnosisDecisionRule[] = [
  {
    id: "confirmed_generate_report",
    priority: 1000,
    when: (state) => state.hasGenerateReportIntent
      && state.reportReadiness.ready
      && !state.reportReadiness.hasUncoveredAreas,
    decide: () => ({
      nextAction: "generate_report",
      inputMode: "none",
      maxReportLevel: "business_overview_report",
      requiredNextSteps: [
        "先输出对话内完整诊断书 fallback",
        "再调用 publishHtmlReport 发布同一份完整 HTML 报告",
        "只有工具返回 url 后才能声称 HTML 已发布",
      ],
      reason: "用户已确认生成完整方案，且完整报告就绪，可以进入报告生成与 HTML 发布。",
    }),
  },
  {
    id: "confirmed_publish_current_deliverable",
    priority: 1000,
    when: (state) => state.runtimeState.deliverableReadiness.confirmedToPublish
      && state.runtimeState.deliverableReadiness.canOfferPublish,
    decide: (state) => ({
      nextAction: "publish_current_deliverable",
      inputMode: "none",
      maxReportLevel: state.runtimeState.deliverableReadiness.level === "special_report"
        ? "workflow_report"
        : "hypothesis_brief",
      forbiddenPhrases: ["完整诊断书", "完整业务全局诊断", "完整业务方案"],
      warnings: [state.runtimeState.deliverableReadiness.publishBoundary],
      requiredNextSteps: [
        `先输出对话内${state.runtimeState.deliverableReadiness.publishTitle}`,
        "再调用 publishHtmlReport 发布同一份 HTML",
        "HTML 标题必须使用当前交付物级别，不得冒充完整诊断书",
        "只有工具返回 url 后才能声称 HTML 已发布",
      ],
      reason: "用户已明确确认发布当前可交付物，可以把当前假设简报或专项方案保存为 HTML。",
    }),
  },
  {
    id: "entry_scope_route_required",
    priority: 1000,
    when: (state) => state.hasUserMessage && !state.hasScopeRoute,
    decide: () => ({
      nextAction: "ask_scope_route",
      inputMode: "single_choice",
      maxReportLevel: "hypothesis_brief",
      allowedLabels: ["先全局盘点", "聚焦一个问题", "还说不清楚"],
      forbiddenPhrases: ["出完整方案", "现在信息够出完整方案"],
      hardBlocks: ["尚未完成入口范围路由"],
      reason: "冷启动必须先判断诊断范围，不能直接锁进单一路径。",
    }),
  },
  {
    id: "overview_scan_requires_open_context",
    priority: 1000,
    when: (state) => state.selectedOverviewScan && state.missingOpenContextLabels.length > 0,
    decide: (state) => ({
      nextAction: "ask_open_context",
      inputMode: "text",
      maxReportLevel: "hypothesis_brief",
      forbiddenPhrases: ["请选择", "多选 2-5 个", "最多选 5 个", "出完整方案"],
      hardBlocks: [`全局盘点前缺少开放上下文：${state.missingOpenContextLabels.join("、")}`],
      missingFacts: state.missingOpenContextLabels,
      reason: "业务类型、用户角色、当前阶段属于开放信息，必须先文本收集，再弹选择卡片。",
    }),
  },
  {
    id: "overview_scan_requires_multi_problem_selection",
    priority: 1000,
    when: (state) => state.selectedOverviewScan
      && state.missingOpenContextLabels.length === 0
      && !state.hasHorizontalScan,
    decide: () => ({
      nextAction: "ask_multi_problem_selection",
      inputMode: "multiple_choice",
      maxReportLevel: "hypothesis_brief",
      forbiddenPhrases: ["请选择一个方向", "单选", "多选 2-5 个", "最多选 5 个", "出完整方案"],
      hardBlocks: ["全局盘点必须先让用户用多选选择候选环节，不能用单选把用户锁进单一路径"],
      requiredNextSteps: [
        "调用 askUserChoice 时必须设置 mode=multiple、minSelections=1、allowOther=true，且不要设置 maxSelections",
        "用户可以只选 1 个，也可以多选或全选；选择后先横向扫描全部已选方向，再推荐优先深挖 1-2 个",
      ],
      reason: "全局盘点的候选环节收集必须是多选，不允许退化成单选。",
    }),
  },
  {
    id: "blocking_pending_facts",
    priority: 1000,
    when: (state) => state.reportReadiness.hasBlockingPendingFacts,
    decide: (state) => ({
      nextAction: "ask_missing_facts",
      inputMode: "single_choice",
      maxReportLevel: "hypothesis_brief",
      allowedLabels: ["补齐关键事实", "跳过并降级出假设简报"],
      forbiddenPhrases: ["出完整方案", "信息已经够出完整方案", "完整诊断书"],
      hardBlocks: ["待确认事实非空且用户未显式跳过"],
      missingFacts: state.reportReadiness.missingMinimumFactLabels,
      requiredNextSteps: ["让用户在补齐关键事实和跳过降级之间明确选择；如果同时存在未覆盖区域，还要提供继续诊断未覆盖模块"],
      reason: "待确认事实会影响预算、目标、渠道、优先级、工具选择或验收标准，不能进入完整方案。",
    }),
  },
  {
    id: "minimum_facts_missing",
    priority: 800,
    when: (state) => state.hasScopeRoute && state.reportReadiness.missingMinimumFactLabels.length > 0,
    decide: (state) => ({
      nextAction: "ask_missing_facts",
      inputMode: "text",
      maxReportLevel: "hypothesis_brief",
      forbiddenPhrases: ["出完整方案", "完整诊断书"],
      hardBlocks: [`缺少最小事实包：${state.reportReadiness.missingMinimumFactLabels.join("、")}`],
      missingFacts: state.reportReadiness.missingMinimumFactLabels,
      reason: "最小事实包不完整时，只能继续追问或输出假设简报。",
    }),
  },
  {
    id: "horizontal_scan_required_before_report",
    priority: 800,
    when: (state) => state.hasGenerateReportIntent && !state.selectedFocusedDeepDive && !state.hasHorizontalScan,
    decide: () => ({
      nextAction: "run_horizontal_scan",
      inputMode: "none",
      maxReportLevel: "hypothesis_brief",
      forbiddenPhrases: ["出完整方案", "最值得先做的是"],
      hardBlocks: ["用户要求优先级或完整方案前，尚未完成横向扫描"],
      requiredNextSteps: ["先比较至少 3 个候选业务 / 岗位环节，并使用同一套评分维度"],
      reason: "没有横向扫描时，不能声称已经找到最值得先做的 AI 改造环节。",
    }),
  },
  {
    id: "hypothesis_tree_required_before_report",
    priority: 800,
    when: (state) => state.hasGenerateReportIntent && state.hasDeepDiveDirection && !state.hasHypothesisTree,
    decide: () => ({
      nextAction: "offer_hypothesis_brief",
      inputMode: "none",
      maxReportLevel: "hypothesis_brief",
      forbiddenPhrases: ["完整诊断结论", "完整诊断书"],
      hardBlocks: ["深挖方向已有，但尚未建立诊断假设树"],
      requiredNextSteps: ["先输出根问题、原因分支、要查什么数据、如果是怎么修、如果不是排除什么"],
      reason: "没有假设树时，只能输出临时建议或假设简报，不能输出完整诊断结论。",
    }),
  },
  {
    id: "external_evidence_coverage_required",
    priority: 600,
    when: (state) => state.runtimeState.progress.externalResearchRequired
      && !state.hasEvidenceCoverage,
    decide: () => ({
      nextAction: "offer_hypothesis_brief",
      inputMode: "none",
      maxReportLevel: "external_research_report",
      forbiddenPhrases: ["已完成外部验证", "行业已经证明"],
      hardBlocks: ["使用或要求外部资料，但缺少 coverage、引用链、证据等级或反例"],
      requiredNextSteps: ["先补外部资料 coverage、来源标题、原始引用链、证据等级和反例"],
      reason: "外部资料没有证据视图时，不能混进最终诊断结论。",
    }),
  },
  {
    id: "key_facts_confirmation_required",
    priority: 800,
    when: (state) => !state.reportReadiness.keyFactsConfirmed && state.reportReadiness.missingMinimumFactLabels.length === 0,
    decide: () => ({
      nextAction: "confirm_key_facts",
      inputMode: "fact_confirmation",
      maxReportLevel: "hypothesis_brief",
      forbiddenPhrases: ["出完整方案", "完整诊断书"],
      hardBlocks: ["尚未完成关键事实确认"],
      allowedLabels: ["补齐关键事实", "跳过并降级出假设简报", "继续诊断未覆盖模块"],
      requiredNextSteps: ["列出已确认事实、待确认事实、未覆盖区域，并让用户选择补齐、跳过降级或继续未覆盖模块"],
      reason: "关键事实确认是完整报告前置门禁。",
    }),
  },
  {
    id: "uncovered_areas_force_special_report",
    priority: 800,
    when: (state) => state.reportReadiness.ready && state.reportReadiness.hasUncoveredAreas,
    decide: () => ({
      nextAction: "offer_special_report",
      inputMode: "single_choice",
      maxReportLevel: "overview_scan_plus_workflow_report",
      allowedLabels: ["出本轮专项方案", "继续看未覆盖模块"],
      forbiddenPhrases: ["出完整方案", "完整业务全局诊断", "业务全局完整方案"],
      warnings: ["存在未覆盖区域，只能输出本轮专项方案或单流程方案"],
      reason: "未覆盖区域非空时，不能把当前范围包装成完整方案。",
    }),
  },
  {
    id: "ready_offer_complete_report",
    priority: 600,
    when: (state) => state.reportReadiness.ready && !state.reportReadiness.hasUncoveredAreas && !state.hasGenerateReportIntent,
    decide: () => ({
      nextAction: "offer_complete_report",
      inputMode: "single_choice",
      maxReportLevel: "business_overview_report",
      allowedLabels: ["出完整方案", "再诊断一轮"],
      forbiddenPhrases: ["已生成 HTML 链接", "二维码已生成"],
      reason: "完整报告就绪，但仍需先让用户确认是否生成。",
    }),
  },
  {
    id: "ready_offer_current_deliverable_publish",
    priority: 600,
    when: (state) => state.hasCurrentDeliverableReady
      && !state.runtimeState.deliverableReadiness.confirmedToPublish
      && !state.reportReadiness.ready,
    decide: (state) => ({
      nextAction: "offer_current_deliverable_publish",
      inputMode: "single_choice",
      maxReportLevel: state.runtimeState.deliverableReadiness.level === "special_report"
        ? "workflow_report"
        : "hypothesis_brief",
      allowedLabels: ["发布当前简报为 HTML", "继续补充诊断"],
      forbiddenPhrases: ["已生成 HTML 链接", "完整诊断书", "完整业务方案"],
      warnings: [state.runtimeState.deliverableReadiness.publishBoundary],
      requiredNextSteps: ["先让用户确认是否发布当前可交付物；用户确认前不得调用 publishHtmlReport"],
      reason: "当前已有可执行阶段性产物，但还未达到完整报告门禁；可以询问是否发布当前简报为 HTML。",
    }),
  },
  {
    id: "quality_gate_required_for_report",
    priority: 600,
    when: (state) => state.hasGenerateReportIntent && !state.hasQualityGate,
    decide: () => ({
      nextAction: "offer_hypothesis_brief",
      inputMode: "none",
      maxReportLevel: "hypothesis_brief",
      forbiddenPhrases: ["完整诊断书", "质量已达标"],
      warnings: ["尚未出现报告质量 Gate，报告只能按假设简报或当前允许级别输出"],
      requiredNextSteps: ["生成报告前必须给出 110 分制质量分、缺口和阻塞项"],
      reason: "没有运行时质量 Gate 或报告自检时，不能宣称完整诊断书。",
    }),
  },
  {
    id: "customization_blocking_signals",
    priority: 600,
    when: (state) => state.customization.blockingSignals.length > 0,
    decide: (state) => ({
      canMentionCustomization: false,
      canRecommendCustomization: false,
      forbiddenPhrases: ["建议定制", "建议做系统 / Agent 定制", "进入定制开发"],
      warnings: [`存在定制阻塞信号：${state.customization.blockingSignals.join("；")}`],
      reason: "存在定制前置条件缺口时，只能写定制前置条件，不能推荐定制。",
    }),
  },
  {
    id: "customization_hard_signals",
    priority: 400,
    when: (state) => state.customization.hardSignals.length > 0 && state.customization.blockingSignals.length === 0,
    decide: () => ({
      canMentionCustomization: true,
      canRecommendCustomization: true,
      requiredNextSteps: ["如提系统 / Agent 定制，必须写成系统化升级判断，并包含最小试点、成功指标和人工兜底边界"],
      reason: "命中硬触发信号且无阻塞信号，可以进入系统化升级判断。",
    }),
  },
  {
    id: "customization_soft_signals_only",
    priority: 400,
    when: (state) => state.customization.softSignals.length > 0
      && state.customization.hardSignals.length === 0
      && state.customization.blockingSignals.length === 0,
    decide: () => ({
      canMentionCustomization: true,
      canRecommendCustomization: false,
      forbiddenPhrases: ["建议定制", "建议做系统 / Agent 定制"],
      warnings: ["只命中定制软信号：可提未来系统化方向，但不要推荐定制"],
      reason: "软信号只能支持未来升级提醒，不能支持定制推荐。",
    }),
  },
  {
    id: "tool_failure_disclosure",
    priority: 400,
    when: (state) => state.hasToolFailure,
    decide: () => ({
      warnings: ["检测到工具失败或弱来源信号，报告必须披露工具失败状态和未验证缺口"],
      forbiddenPhrases: ["已验证", "权威证明", "行业已经证明"],
      reason: "工具失败不能被自然语言补偿成已验证结论。",
    }),
  },
];

export function decideNextDeepDiagnosisAction(messages: UIMessage[]): DeepDiagnosisDecision {
  const state = buildDeepDiagnosisDecisionState(messages);
  return decideFromDeepDiagnosisState(state);
}

export function decideFromDeepDiagnosisState(state: DeepDiagnosisDecisionState): DeepDiagnosisDecision {
  const base = createDefaultDecision(state);
  return DEEP_DIAGNOSIS_DECISION_RULES
    .toSorted((left, right) => right.priority - left.priority)
    .reduce((decision, rule) => {
      if (!rule.when(state)) return decision;
      return mergeDecision(decision, rule.decide(state));
    }, base);
}

function createDefaultDecision(state: DeepDiagnosisDecisionState): DeepDiagnosisDecision {
  return {
    nextAction: state.hasHorizontalScan ? "ask_deep_dive_selection" : "run_horizontal_scan",
    inputMode: state.hasHorizontalScan ? "single_choice" : "none",
    maxReportLevel: "hypothesis_brief",
    allowedLabels: [],
    forbiddenPhrases: [],
    hardBlocks: [],
    warnings: [],
    requiredNextSteps: [],
    missingFacts: [],
    reason: "默认进入横向扫描或深挖方向确认，等待更高优先级规则校准。",
    canMentionCustomization: false,
    canRecommendCustomization: false,
  };
}

function mergeDecision(current: DeepDiagnosisDecision, patch: DeepDiagnosisDecisionPatch): DeepDiagnosisDecision {
  const ignorePatchForCurrentDeliverable = shouldIgnorePatchForCurrentDeliverable(current, patch);
  const nextReportLevel = !ignorePatchForCurrentDeliverable && patch.maxReportLevel
    ? mergeReportLevel(current, patch.maxReportLevel)
    : current.maxReportLevel;
  const nextAction = !ignorePatchForCurrentDeliverable && shouldReplaceAction(current, patch)
    ? patch.nextAction || current.nextAction
    : current.nextAction;
  const currentHardBlocks = shouldDropReportReadinessBlocksForCurrentDeliverable(current, patch)
    ? current.hardBlocks.filter(isEarlyContextBlock)
    : current.hardBlocks;
  const patchHardBlocks = ignorePatchForCurrentDeliverable || shouldIgnorePatchHardBlocksForCurrentDeliverable(current, patch)
    ? []
    : patch.hardBlocks;

  return {
    ...current,
    nextAction,
    inputMode: ignorePatchForCurrentDeliverable ? current.inputMode : patch.inputMode || current.inputMode,
    maxReportLevel: nextReportLevel,
    allowedLabels: mergeUnique(current.allowedLabels, patch.allowedLabels),
    forbiddenPhrases: mergeUnique(current.forbiddenPhrases, patch.forbiddenPhrases),
    hardBlocks: mergeUnique(currentHardBlocks, patchHardBlocks),
    warnings: mergeUnique(current.warnings, ignorePatchForCurrentDeliverable ? undefined : patch.warnings),
    requiredNextSteps: mergeUnique(current.requiredNextSteps, ignorePatchForCurrentDeliverable ? undefined : patch.requiredNextSteps),
    missingFacts: mergeUnique(current.missingFacts, ignorePatchForCurrentDeliverable ? undefined : patch.missingFacts),
    reason: ignorePatchForCurrentDeliverable ? current.reason : patch.reason || current.reason,
    canMentionCustomization: patch.canMentionCustomization ?? current.canMentionCustomization,
    canRecommendCustomization: patch.canRecommendCustomization ?? current.canRecommendCustomization,
  };
}

function shouldReplaceAction(current: DeepDiagnosisDecision, patch: DeepDiagnosisDecisionPatch): boolean {
  if (!patch.nextAction) return false;
  if (current.nextAction === "publish_current_deliverable" && !isEarlyContextAction(patch.nextAction)) {
    return false;
  }
  if (current.nextAction === "ask_scope_route" && current.hardBlocks.includes("尚未完成入口范围路由")) {
    return false;
  }
  if (current.nextAction === "ask_open_context" && current.hardBlocks.some((block) => block.startsWith("全局盘点前缺少开放上下文"))) {
    return false;
  }
  if (patch.nextAction === "offer_current_deliverable_publish" || patch.nextAction === "publish_current_deliverable") {
    return !current.hardBlocks.some((block) => block.includes("尚未完成入口范围路由") || block.startsWith("全局盘点前缺少开放上下文"));
  }
  if (current.hardBlocks.length === 0) return true;
  return Boolean(patch.hardBlocks?.length);
}

function shouldDropReportReadinessBlocksForCurrentDeliverable(
  current: DeepDiagnosisDecision,
  patch: DeepDiagnosisDecisionPatch,
): boolean {
  return patch.nextAction === "offer_current_deliverable_publish"
    || patch.nextAction === "publish_current_deliverable";
}

function shouldIgnorePatchHardBlocksForCurrentDeliverable(
  current: DeepDiagnosisDecision,
  patch: DeepDiagnosisDecisionPatch,
): boolean {
  return current.nextAction === "publish_current_deliverable"
    && !patch.hardBlocks?.some(isEarlyContextBlock);
}

function shouldIgnorePatchForCurrentDeliverable(
  current: DeepDiagnosisDecision,
  patch: DeepDiagnosisDecisionPatch,
): boolean {
  return current.nextAction === "publish_current_deliverable"
    && !patch.hardBlocks?.some(isEarlyContextBlock)
    && !isEarlyContextAction(patch.nextAction || current.nextAction);
}

function isEarlyContextAction(action: DeepDiagnosisDecision["nextAction"]): boolean {
  return action === "ask_scope_route" || action === "ask_open_context";
}

function isEarlyContextBlock(block: string): boolean {
  return block.includes("尚未完成入口范围路由") || block.startsWith("全局盘点前缺少开放上下文");
}

function mergeReportLevel(
  currentDecision: DeepDiagnosisDecision,
  next: DeepDiagnosisDecision["maxReportLevel"],
): DeepDiagnosisDecision["maxReportLevel"] {
  if (!currentDecision.hardBlocks.length && !currentDecision.warnings.length) return next;
  return REPORT_LEVEL_RANK[next] < REPORT_LEVEL_RANK[currentDecision.maxReportLevel] ? next : currentDecision.maxReportLevel;
}

function mergeUnique(current: string[], next: string[] | undefined): string[] {
  return Array.from(new Set([...current, ...(next || [])]));
}
