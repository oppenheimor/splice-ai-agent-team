import type { UIMessage } from "ai";

type MinimumFactSignal = {
  id: string;
  label: string;
  patterns: RegExp[];
};

export type DeepDiagnosisReportReadinessSnapshot = {
  ready: boolean;
  keyFactsConfirmed: boolean;
  hasBlockingPendingFacts: boolean;
  hasUncoveredAreas: boolean;
  reverseSelectionReasonConfirmed: boolean;
  missingMinimumFactLabels: string[];
};

const MINIMUM_FACT_SIGNALS: MinimumFactSignal[] = [
  {
    id: "business_type",
    label: "业务类型",
    patterns: [/业务类型/, /行业/, /我做/, /我是做/, /教培/, /茶饮/, /门店/, /电商/, /律所/, /SaaS/i],
  },
  {
    id: "user_role",
    label: "用户角色",
    patterns: [/用户角色/, /角色/, /校长/, /老板/, /负责人/, /创始人/, /运营/, /销售/, /设计师/],
  },
  {
    id: "current_stage",
    label: "当前阶段",
    patterns: [/当前阶段/, /阶段/, /起步/, /刚开始/, /\d+\s*个?月/, /\d+\s*年/],
  },
  {
    id: "deep_dive_direction",
    label: "用户选择的深挖方向",
    patterns: [/深挖/, /聚焦/, /本轮方向/, /深挖方向/],
  },
  {
    id: "current_baseline",
    label: "当前基线",
    patterns: [/当前基线/, /基线/, /目前.*\d+/, /现在.*\d+/, /每周/, /每天/, /日均/, /月均/],
  },
  {
    id: "real_sample",
    label: "真实样本或明确缺失",
    patterns: [/真实样本/, /样本缺失/, /明确缺失/, /最近一次/, /一条真实/, /一个真实/, /案例/],
  },
  {
    id: "target_metric",
    label: "目标指标",
    patterns: [/目标指标/, /成功阈值/, /希望.*提升/, /希望.*降低/, /目标.*\d+/],
  },
  {
    id: "resource_constraints",
    label: "资源约束",
    patterns: [/资源约束/, /预算/, /人手/, /团队/, /每周.*小时/, /每天.*分钟/, /低成本/, /0\s*元/],
  },
];

export function buildDeepDiagnosisReportReadinessContext(messages: UIMessage[]): string {
  const snapshot = evaluateDeepDiagnosisReportReadiness(messages);

  if (snapshot.ready) {
    const scopeNotice = snapshot.hasUncoveredAreas
      ? "当前存在未覆盖区域。只能称为「本轮专项方案」，不要称为「完整方案」；同时必须给用户一个继续诊断未覆盖模块的选择。"
      : "当前未发现明确未覆盖区域，可以按当前报告级别进入确认。";
    const confirmationCopy = snapshot.hasUncoveredAreas
      ? "当前状态：只满足当前范围报告门禁。仍需先通过 askUserChoice 让用户确认「出本轮专项方案 / 继续看未覆盖模块」，不要直接生成报告。"
      : "当前状态：已满足完整报告就绪门禁。仍需先通过 askUserChoice 让用户确认「出完整方案 / 再诊断一轮」，不要直接生成完整报告。";

    return [
      "【Deep Diagnosis 完整报告就绪判定】",
      confirmationCopy,
      scopeNotice,
    ].join("\n");
  }

  const missingFacts = snapshot.missingMinimumFactLabels.length
    ? `缺少最小事实包：${snapshot.missingMinimumFactLabels.join("、")}。`
    : "最小事实包表面齐全，但仍有其它阻塞项。";
  const factConfirmation = snapshot.keyFactsConfirmed
    ? "关键事实已确认。"
    : "尚未完成关键事实确认：必须列出已确认事实、待确认事实、未覆盖区域，并让用户确认或显式跳过。";
  const pendingFacts = snapshot.hasBlockingPendingFacts
    ? "仍存在阻塞性的待确认事实；不能一边列出待确认事实，一边提供「出完整方案」。"
    : "未发现阻塞性的待确认事实。";
  const reverseSelection = snapshot.reverseSelectionReasonConfirmed
    ? "未发现未处理的反选低优先级方向。"
    : "用户可能选择了非推荐或低优先级方向，必须先追问并确认原因。";

  return [
    "【Deep Diagnosis 完整报告就绪判定】",
    "当前状态：未就绪。本轮禁止出现「出完整方案」选项，也不要说「现在信息够出完整方案」。",
    missingFacts,
    factConfirmation,
    pendingFacts,
    reverseSelection,
    "下一步：继续追问 1-2 个最关键问题，或只提供「先看假设简报 / 继续补关键信息」。",
  ].join("\n");
}

export function evaluateDeepDiagnosisReportReadiness(messages: UIMessage[]): DeepDiagnosisReportReadinessSnapshot {
  const transcript = normalizeWhitespace(extractConversationText(messages));
  const missingMinimumFactLabels = MINIMUM_FACT_SIGNALS
    .filter((signal) => !signal.patterns.some((pattern) => pattern.test(transcript)))
    .map((signal) => signal.label);
  const keyFactsConfirmed = hasKeyFactConfirmation(transcript);
  const hasBlockingPendingFacts = hasUnresolvedPendingFacts(transcript);
  const hasUncoveredAreas = hasNonEmptyUncoveredAreas(transcript);
  const reverseSelectionReasonConfirmed = hasReverseSelectionReasonConfirmed(transcript);

  return {
    ready: missingMinimumFactLabels.length === 0
      && keyFactsConfirmed
      && !hasBlockingPendingFacts
      && reverseSelectionReasonConfirmed,
    keyFactsConfirmed,
    hasBlockingPendingFacts,
    hasUncoveredAreas,
    reverseSelectionReasonConfirmed,
    missingMinimumFactLabels,
  };
}

function hasKeyFactConfirmation(transcript: string): boolean {
  const hasFactBuckets = ["已确认事实", "待确认事实", "未覆盖区域"].every((signal) => transcript.includes(signal));
  const hasUserConfirmation = /用户确认|确认以上|事实准确|可以用于生成报告|显式跳过|用户跳过关键事实确认/.test(transcript);
  return hasFactBuckets && hasUserConfirmation && !hasUnresolvedPendingFacts(transcript);
}

function hasUnresolvedPendingFacts(transcript: string): boolean {
  const marker = "待确认事实";
  const pendingIndex = transcript.lastIndexOf(marker);

  if (pendingIndex === -1) {
    return false;
  }

  const laterTranscript = transcript.slice(pendingIndex);
  const explicitSkip = /显式跳过|用户跳过关键事实确认|跳过待确认事实|先按假设|按假设简报/.test(laterTranscript);

  if (explicitSkip) {
    return false;
  }

  const pendingSection = laterTranscript
    .split(/未覆盖区域|完整报告就绪|报告质量|现在信息|你想|单选|出完整方案/)[0]
    .replace(marker, "")
    .replace(/[：:]/g, "")
    .trim();

  if (!pendingSection) {
    return false;
  }

  return !/^(无|暂无|没有|无阻塞项|均已确认|不影响本轮方案)/.test(pendingSection);
}

function hasNonEmptyUncoveredAreas(transcript: string): boolean {
  const marker = "未覆盖区域";
  const uncoveredIndex = transcript.lastIndexOf(marker);

  if (uncoveredIndex === -1) {
    return false;
  }

  const uncoveredSection = transcript
    .slice(uncoveredIndex)
    .split(/完整报告就绪|报告质量|现在信息|你想|单选|出完整方案|出本轮专项方案/)[0]
    .replace(marker, "")
    .replace(/[：:]/g, "")
    .trim();

  if (!uncoveredSection) {
    return false;
  }

  return !/^(无|暂无|没有|全局已覆盖|本次已覆盖所有)/.test(uncoveredSection);
}

function hasReverseSelectionReasonConfirmed(transcript: string): boolean {
  const hasReverseSelectionRisk = /优先级最低|为时过早|不建议先做|非推荐方向|不是当前最优先/.test(transcript);

  if (!hasReverseSelectionRisk) {
    return true;
  }

  return /反选原因已确认|坚持这个方向的原因|用户确认.*原因|原因是/.test(transcript);
}

function extractConversationText(messages: UIMessage[]): string {
  return messages
    .flatMap((message) => message.parts || [])
    .filter((part) => part.type === "text" && "text" in part)
    .map((part) => String(part.text || ""))
    .join("\n");
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
