import type { UIMessage } from "ai";
import { extractDeepDiagnosisRuntimeEvents, normalizeWhitespace } from "./runtime-events";

export type DeepDiagnosisDeliverableLevel =
  | "none"
  | "hypothesis_brief"
  | "special_report"
  | "complete_report";

export type DeepDiagnosisDeliverableReadinessSnapshot = {
  canOfferPublish: boolean;
  confirmedToPublish: boolean;
  level: DeepDiagnosisDeliverableLevel;
  userRequestedDeliverable: boolean;
  hasReportLikeDraft: boolean;
  missingSignals: string[];
  publishTitle: string;
  publishBoundary: string;
};

type DeliverableSignal = {
  label: string;
  patterns: RegExp[];
};

const CURRENT_DELIVERABLE_SIGNALS: DeliverableSignal[] = [
  {
    label: "诊断范围或边界",
    patterns: [/诊断范围|单问题诊断|专项方案|假设简报|未覆盖区域/],
  },
  {
    label: "用户现场或当前基线",
    patterns: [/当前基线|用户现场|目前.*\d+|现在.*\d+|每周|每天|日均|月均|门店|员工|复购率|客单价|排班/],
  },
  {
    label: "核心判断或第一瓶颈",
    patterns: [/第一瓶颈|瓶颈类型|核心问题|根因|我的判断|建议顺序|优先/],
  },
  {
    label: "可执行动作",
    patterns: [/本周行动|行动清单|落地路径|第一步|7\s*天内|试点计划|直接拿去用|可用资产/],
  },
  {
    label: "验证标准",
    patterns: [/效果验证|验证指标|成功阈值|失败阈值|观察周期|验收标准|当前基线/],
  },
];

export function evaluateDeepDiagnosisDeliverableReadiness(
  messages: UIMessage[],
): DeepDiagnosisDeliverableReadinessSnapshot {
  const events = extractDeepDiagnosisRuntimeEvents(messages);
  const assistantTranscript = normalizeWhitespace(events.assistantText);
  const userTranscript = normalizeWhitespace(events.userText);
  const missingSignals = CURRENT_DELIVERABLE_SIGNALS
    .filter((signal) => !signal.patterns.some((pattern) => pattern.test(assistantTranscript)))
    .map((signal) => signal.label);
  const userRequestedDeliverable = hasUserRequestedDeliverable(userTranscript, events.choiceSelectionIds, events.choiceSelectionLabels);
  const confirmedToPublish = hasConfirmedPublishChoice(events.choiceSelectionIds, events.choiceSelectionLabels);
  const hasReportLikeDraft = /假设简报|专项方案|诊断简报|报告级别|本周行动清单|落地路径|可用资产/.test(assistantTranscript);
  const level = resolveDeliverableLevel(assistantTranscript);

  return {
    canOfferPublish: missingSignals.length === 0 && userRequestedDeliverable && hasReportLikeDraft,
    confirmedToPublish,
    level,
    userRequestedDeliverable,
    hasReportLikeDraft,
    missingSignals,
    publishTitle: resolvePublishTitle(level),
    publishBoundary: resolvePublishBoundary(level),
  };
}

export function formatDeepDiagnosisDeliverableReadinessForPrompt(
  snapshot: DeepDiagnosisDeliverableReadinessSnapshot,
): string {
  return [
    "【Deep Diagnosis 当前可交付物就绪判定】",
    `是否可询问发布当前 HTML 交付物：${snapshot.canOfferPublish ? "可以" : "不可以"}`,
    `用户是否已确认发布：${snapshot.confirmedToPublish ? "是" : "否"}`,
    `当前交付物级别：${snapshot.level}`,
    `用户是否请求/认可交付：${snapshot.userRequestedDeliverable ? "是" : "否"}`,
    `是否已有报告级草稿：${snapshot.hasReportLikeDraft ? "是" : "否"}`,
    snapshot.missingSignals.length ? `缺失信号：${snapshot.missingSignals.join("、")}` : "缺失信号：暂无",
    `发布标题建议：${snapshot.publishTitle}`,
    `边界口径：${snapshot.publishBoundary}`,
    "执行纪律：发布 HTML 前必须先让用户明确确认；当前可交付物发布只代表把本轮可执行产物保存为 HTML，除非完整报告门禁通过，不得称为完整诊断书或完整业务方案。",
  ].join("\n");
}

function hasUserRequestedDeliverable(userTranscript: string, choiceIds: string[], choiceLabels: string[]): boolean {
  if (choiceIds.some((id) => /generate_report|publish|deliverable|current_brief|special_report/.test(id))) return true;
  if (choiceLabels.some((label) => /出本轮专项方案|生成假设简报|发布当前简报|出.*方案|保存/.test(label))) return true;
  if (/不要|先别|不急|暂时不/.test(userTranscript) && /方案|报告|简报|HTML|链接|保存/.test(userTranscript)) return false;
  return /帮我生成|生成.*方案|出.*方案|给我.*方案|发我|保存|HTML|链接|听你的|就按这个|对|可以|确认|没问题/.test(userTranscript);
}

function hasConfirmedPublishChoice(choiceIds: string[], choiceLabels: string[]): boolean {
  return choiceIds.includes("publish_current_deliverable")
    || choiceIds.includes("publish_html_report")
    || choiceLabels.some((label) => /发布当前简报|发布为 HTML|生成 HTML|保存为链接/.test(label));
}

function resolveDeliverableLevel(assistantTranscript: string): DeepDiagnosisDeliverableLevel {
  if (/完整诊断书|完整诊断报告|business_overview_report/.test(assistantTranscript)) return "complete_report";
  if (/专项方案|单问题诊断|单流程|本轮专项|special_report|workflow_report/.test(assistantTranscript)) return "special_report";
  if (/假设简报|诊断简报|初版方案|hypothesis_brief/.test(assistantTranscript)) return "hypothesis_brief";
  return "none";
}

function resolvePublishTitle(level: DeepDiagnosisDeliverableLevel): string {
  if (level === "complete_report") return "完整诊断报告";
  if (level === "special_report") return "本轮专项方案";
  if (level === "hypothesis_brief") return "假设简报";
  return "当前诊断记录";
}

function resolvePublishBoundary(level: DeepDiagnosisDeliverableLevel): string {
  if (level === "complete_report") return "完整报告门禁通过后，才可使用完整诊断书称谓。";
  if (level === "special_report") return "这是当前范围专项方案，未覆盖模块不得包装为完整业务诊断。";
  if (level === "hypothesis_brief") return "这是基于现有信息的假设简报，可执行但仍需用真实数据复盘。";
  return "当前还没有足够结构化的可交付物，只能继续诊断。";
}
