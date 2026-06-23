import type { UIMessage } from "ai";
import { extractDeepDiagnosisRuntimeEvents, normalizeWhitespace } from "./runtime-events";

export type DeepDiagnosisFactCard = {
  confirmedFacts: string[];
  pendingFacts: string[];
  uncoveredAreas: string[];
  confirmationState: "missing" | "pending" | "confirmed" | "skipped";
};

export function buildDeepDiagnosisFactCard(messages: UIMessage[]): DeepDiagnosisFactCard {
  const events = extractDeepDiagnosisRuntimeEvents(messages);
  const transcript = normalizeWhitespace(events.assistantText);
  const confirmedFacts = extractFactBucket(transcript, "已确认事实", ["待确认事实", "未覆盖区域", "完整报告就绪", "报告质量"]);
  const pendingFacts = extractFactBucket(transcript, "待确认事实", ["未覆盖区域", "完整报告就绪", "报告质量", "现在信息", "你想"]);
  const uncoveredAreas = extractFactBucket(transcript, "未覆盖区域", ["完整报告就绪", "报告质量", "现在信息", "你想", "出完整方案", "出本轮专项方案"]);
  const hasBuckets = transcript.includes("已确认事实") && transcript.includes("待确认事实") && transcript.includes("未覆盖区域");
  const userConfirmationText = events.userText;
  const skipped = /显式跳过|跳过关键事实|先按假设|按假设简报/.test(userConfirmationText);
  const confirmed = pendingFacts.length === 0
    && /确认以上|事实准确|可以用于生成报告|没有要补充/.test(userConfirmationText);

  return {
    confirmedFacts,
    pendingFacts,
    uncoveredAreas,
    confirmationState: skipped ? "skipped" : confirmed ? "confirmed" : hasBuckets ? "pending" : "missing",
  };
}

export function formatDeepDiagnosisFactCardForPrompt(factCard: DeepDiagnosisFactCard): string {
  return [
    "【Deep Diagnosis 事实卡】",
    `确认状态：${factCard.confirmationState}`,
    formatBucket("已确认事实", factCard.confirmedFacts),
    formatBucket("待确认事实", factCard.pendingFacts),
    formatBucket("未覆盖区域", factCard.uncoveredAreas),
    "执行纪律：报告前必须让用户确认、编辑或显式跳过事实卡；待确认事实非空时不得生成完整方案。",
  ].join("\n");
}

function formatBucket(title: string, items: string[]): string {
  if (!items.length) return `${title}：暂无结构化记录`;
  return [`${title}：`, ...items.map((item, index) => `${index + 1}. ${item}`)].join("\n");
}

function extractFactBucket(transcript: string, marker: string, endMarkers: string[]): string[] {
  const startIndex = transcript.lastIndexOf(marker);
  if (startIndex === -1) return [];

  const rest = transcript.slice(startIndex + marker.length);
  const endPattern = new RegExp(endMarkers.join("|"));
  const section = rest
    .split(endPattern)[0]
    .replace(/[：:]/g, "")
    .trim();

  if (!section || /^(无|暂无|没有|均已确认|全局已覆盖|本次已覆盖所有)/.test(section)) {
    return [];
  }

  return section
    .split(/(?:\d+[.、]\s*)|(?:[-•]\s*)|(?:；|;)/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1)
    .slice(0, 8);
}
