import type { UIMessage } from "ai";
import { buildDeepDiagnosisReportReadinessContext } from "./report-readiness";
import { decideNextDeepDiagnosisAction, formatDeepDiagnosisDecisionForPrompt } from "./decision";
import { formatDeepDiagnosisEvidenceViewForPrompt } from "./evidence-view";
import { formatDeepDiagnosisFactCardForPrompt } from "./fact-card";
import { formatDeepDiagnosisRuntimeQualityGateForPrompt } from "./runtime-quality-gate";
import { buildDeepDiagnosisRuntimeState, formatDeepDiagnosisRuntimeStateForPrompt } from "./runtime-state";

const MAX_CONTEXT_CHARS = 9000;
const MAX_USER_FACTS = 18;
const MAX_TOOL_EVIDENCE = 10;

type ExtractedToolEvidence = {
  toolName: string;
  title: string;
  url?: string;
  warning?: string;
};

export function buildDeepDiagnosisManagedContext(messages: UIMessage[]): string {
  const userFacts = extractUserFacts(messages);
  const toolEvidence = extractToolEvidence(messages);
  const runtimeState = buildDeepDiagnosisRuntimeState(messages);
  const reportReadinessContext = buildDeepDiagnosisReportReadinessContext(messages);
  const decisionContext = formatDeepDiagnosisDecisionForPrompt(decideNextDeepDiagnosisAction(messages));
  const runtimeStateContext = formatDeepDiagnosisRuntimeStateForPrompt(runtimeState);
  const factCardContext = formatDeepDiagnosisFactCardForPrompt(runtimeState.factCard);
  const evidenceViewContext = formatDeepDiagnosisEvidenceViewForPrompt(runtimeState.evidenceView);
  const runtimeQualityContext = formatDeepDiagnosisRuntimeQualityGateForPrompt(runtimeState.qualityGate);

  if (!userFacts.length && !toolEvidence.length) {
    return [
      decisionContext,
      "",
      runtimeStateContext,
      "",
      factCardContext,
      "",
      evidenceViewContext,
      "",
      runtimeQualityContext,
      "",
      reportReadinessContext,
    ].join("\n");
  }

  const content = [
    "【Deep Diagnosis 上下文管理层】",
    "以下是系统从完整对话中抽取的工作记忆，用于降低长对话压缩导致的关键事实丢失风险。",
    "使用规则：原始用户输入优先于画像推断；工具结果必须保留来源和失败状态；派生摘要只能作为线索，不能伪装成已确认事实。",
    "",
    userFacts.length ? "已抽取的用户事实候选：" : "",
    ...userFacts.map((fact, index) => `${index + 1}. ${fact}`),
    "",
    toolEvidence.length ? "已抽取的外部证据 / 工具状态：" : "",
    ...toolEvidence.map((item, index) => formatToolEvidence(item, index + 1)),
    "",
    "报告生成前必须把关键事实分成「已确认事实 / 待确认事实 / 未覆盖区域」，并让用户确认或显式跳过确认。",
    "",
    decisionContext,
    "",
    runtimeStateContext,
    "",
    factCardContext,
    "",
    evidenceViewContext,
    "",
    runtimeQualityContext,
    "",
    reportReadinessContext,
  ]
    .filter(Boolean)
    .join("\n");

  return content.slice(0, MAX_CONTEXT_CHARS);
}

function extractUserFacts(messages: UIMessage[]): string[] {
  return messages
    .filter((message) => message.role === "user")
    .flatMap((message) => extractTextParts(message))
    .map((text) => normalizeWhitespace(text).slice(0, 420))
    .filter(Boolean)
    .slice(-MAX_USER_FACTS);
}

function extractToolEvidence(messages: UIMessage[]): ExtractedToolEvidence[] {
  return messages
    .flatMap((message) => message.parts || [])
    .filter((part) => String(part.type).startsWith("tool-"))
    .flatMap<ExtractedToolEvidence>((part) => {
      const toolName = String(part.type).replace(/^tool-/, "");
      const output = "output" in part ? part.output : undefined;
      if (!output || typeof output !== "object") return [];
      const outputRecord = output as Record<string, unknown>;

      const warning = readString(outputRecord, "warning");
      const results = Array.isArray(outputRecord.results)
        ? (outputRecord.results.filter(isRecord) as Record<string, unknown>[])
        : [];

      if (!results.length && warning) {
        return [{ toolName, title: "工具返回警告", url: undefined, warning }];
      }

      return results.slice(0, 3).map((result) => ({
        toolName,
        title: readString(result, "title") || "未命名来源",
        url: readString(result, "url"),
        warning,
      }));
    })
    .slice(-MAX_TOOL_EVIDENCE);
}

function extractTextParts(message: UIMessage): string[] {
  return (message.parts || [])
    .filter((part) => part.type === "text" && "text" in part)
    .map((part) => String(part.text || ""));
}

function formatToolEvidence(item: ExtractedToolEvidence, index: number): string {
  const pieces = [`${index}. ${item.toolName}: ${item.title}`];
  if (item.url) pieces.push(`来源：${item.url}`);
  if (item.warning) pieces.push(`警告：${item.warning}`);
  return pieces.join("；");
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
