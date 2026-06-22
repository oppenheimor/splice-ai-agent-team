import type { UIMessage } from "ai";

export type DeepDiagnosisEvidenceView = {
  coverageStatement: string;
  sourceCount: number;
  hasCoverage: boolean;
  hasCounterEvidence: boolean;
  hasToolFailure: boolean;
  sourceTitles: string[];
  unverifiedGaps: string[];
};

export function buildDeepDiagnosisEvidenceView(messages: UIMessage[]): DeepDiagnosisEvidenceView {
  const transcript = normalizeWhitespace(extractConversationText(messages));
  const toolText = normalizeWhitespace(extractToolText(messages));
  const combined = `${transcript} ${toolText}`;
  const sourceTitles = extractSourceTitles(combined);
  const hasToolFailure = /工具失败|无法联网|搜索结果不足|空结果|warning|error/i.test(combined);
  const hasCoverage = /搜索覆盖范围|覆盖了哪些来源|coveredSourceTypes|uncoveredSourceTypes|coverage/i.test(combined);
  const hasCounterEvidence = /反例|相反证据|不适配|失败案例|counterEvidence/i.test(combined);
  const unverifiedGaps = [];

  if (!hasCoverage) unverifiedGaps.push("缺少搜索 coverage 声明");
  if (!hasCounterEvidence) unverifiedGaps.push("缺少反例或不适配条件");
  if (!sourceTitles.length && /webSearch|外部资料|行业分析/.test(combined)) unverifiedGaps.push("缺少可展示来源标题");
  if (hasToolFailure) unverifiedGaps.push("存在工具失败或弱来源信号");

  return {
    coverageStatement: hasCoverage ? "已出现 coverage 信号" : "未发现 coverage 声明",
    sourceCount: sourceTitles.length,
    hasCoverage,
    hasCounterEvidence,
    hasToolFailure,
    sourceTitles,
    unverifiedGaps,
  };
}

export function formatDeepDiagnosisEvidenceViewForPrompt(evidenceView: DeepDiagnosisEvidenceView): string {
  return [
    "【Deep Diagnosis 证据视图】",
    `coverage：${evidenceView.coverageStatement}`,
    `来源数量：${evidenceView.sourceCount}`,
    `是否有反例：${evidenceView.hasCounterEvidence ? "有" : "没有"}`,
    `是否有工具失败：${evidenceView.hasToolFailure ? "有" : "没有"}`,
    evidenceView.sourceTitles.length ? `来源标题：${evidenceView.sourceTitles.join("；")}` : "来源标题：暂无结构化来源",
    evidenceView.unverifiedGaps.length ? `未验证缺口：${evidenceView.unverifiedGaps.join("；")}` : "未验证缺口：暂无",
    "执行纪律：外部资料只能作为证据对照，不得替代用户现场事实。",
  ].join("\n");
}

function extractSourceTitles(text: string): string[] {
  const titles = new Set<string>();
  const patterns = [
    /来源标题[：:]\s*([^；。\\n]+)/g,
    /"title"\s*:\s*"([^"]+)"/g,
    /sourceTitle["']?\s*[:：]\s*["']?([^"',，；。]+)/g,
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const title = match[1]?.trim();
      if (title && title.length > 1) titles.add(title.slice(0, 80));
    }
  }

  return Array.from(titles).slice(0, 8);
}

function extractConversationText(messages: UIMessage[]): string {
  return messages
    .flatMap((message) => message.parts || [])
    .filter((part) => part.type === "text" && "text" in part)
    .map((part) => String(part.text || ""))
    .join("\n");
}

function extractToolText(messages: UIMessage[]): string {
  return messages
    .flatMap((message) => message.parts || [])
    .filter((part) => String(part.type).startsWith("tool-"))
    .map((part) => JSON.stringify(part))
    .join("\n");
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
