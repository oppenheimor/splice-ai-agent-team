import type { UIMessage } from "ai";
import { extractDeepDiagnosisRuntimeEvents } from "./runtime-events";

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
  const events = extractDeepDiagnosisRuntimeEvents(messages);
  const transcript = events.allText;
  const sourceTitles = extractSourceTitles(events.webSearchOutputs);
  const hasToolFailure = events.webSearchOutputs.some(hasWebSearchFailure)
    || /工具失败|无法联网|搜索结果不足|空结果/i.test(transcript);
  const hasCoverage = events.webSearchOutputs.some(hasCompiledCoverage)
    || /搜索覆盖范围|覆盖了哪些来源/.test(transcript);
  const hasCounterEvidence = events.webSearchOutputs.some(hasCompiledCounterEvidence)
    || /反例|相反证据|不适配|失败案例/.test(transcript);
  const externalResearchRequired = events.webSearchOutputs.length > 0
    || hasAffirmativeExternalResearchRequest(events.userText)
    || /行业分析报告|外部资料覆盖范围|原始引用链/.test(events.assistantText);
  const unverifiedGaps = [];

  if (externalResearchRequired && !hasCoverage) unverifiedGaps.push("缺少搜索 coverage 声明");
  if (externalResearchRequired && !hasCounterEvidence) unverifiedGaps.push("缺少反例或不适配条件");
  if (externalResearchRequired && !sourceTitles.length) unverifiedGaps.push("缺少可展示来源标题");
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

function extractSourceTitles(outputs: Record<string, unknown>[]): string[] {
  const titles = new Set<string>();

  for (const output of outputs) {
    for (const result of readRecordArray(output, "results")) {
      addTitle(titles, readString(result, "title"));
    }

    const compiledEvidence = readRecord(output, "compiledEvidence");
    if (!compiledEvidence) continue;
    for (const item of [
      ...readRecordArray(compiledEvidence, "evidence"),
      ...readRecordArray(compiledEvidence, "counterEvidence"),
    ]) {
      addTitle(titles, readString(item, "sourceTitle"));
    }
  }

  return Array.from(titles).slice(0, 8);
}

function hasWebSearchFailure(output: Record<string, unknown>): boolean {
  const warning = readString(output, "warning");
  return Boolean(warning) || readRecordArray(output, "results").length === 0;
}

function hasCompiledCoverage(output: Record<string, unknown>): boolean {
  const compiledEvidence = readRecord(output, "compiledEvidence");
  const coverage = compiledEvidence ? readRecord(compiledEvidence, "coverage") : undefined;
  return Boolean(coverage && readStringArray(coverage, "coveredSourceTypes").length > 0);
}

function hasCompiledCounterEvidence(output: Record<string, unknown>): boolean {
  const compiledEvidence = readRecord(output, "compiledEvidence");
  if (!compiledEvidence) return false;
  return readRecordArray(compiledEvidence, "counterEvidence").length > 0;
}

function hasAffirmativeExternalResearchRequest(text: string): boolean {
  if (/不要.*(行业|外部|竞品|案例|趋势|市场)|不用.*(行业|外部|竞品|案例|趋势|市场)/.test(text)) {
    return false;
  }

  return /行业|外部资料|竞品|案例|趋势|市场数据|同类企业|webSearch/.test(text);
}

function addTitle(titles: Set<string>, title: string | undefined): void {
  if (!title || /^(暂无|没有|未命名来源|null|undefined)$/i.test(title)) return;
  titles.add(title.slice(0, 80));
}

function readRecord(source: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = source[key];
  return isRecord(value) ? value : undefined;
}

function readRecordArray(source: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const value = source[key];
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readStringArray(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
