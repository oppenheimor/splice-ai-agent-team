import type { UIMessage } from "ai";
import type { DeepDiagnosisDecision } from "./decision";
import { buildDeepDiagnosisRuntimeState } from "./runtime-state";
import { judgeDeepDiagnosisReportText } from "./report-quality";

type DeepDiagnosisOutputViolationSeverity = "blocker" | "warning";

export type DeepDiagnosisOutputViolation = {
  id: string;
  severity: DeepDiagnosisOutputViolationSeverity;
  message: string;
  evidence?: string;
};

export type DeepDiagnosisOutputValidationResult = {
  passed: boolean;
  score: number;
  canPersistAsFinal: boolean;
  violations: DeepDiagnosisOutputViolation[];
};

type ValidateDeepDiagnosisOutputInput = {
  responseMessage: UIMessage;
  decision: DeepDiagnosisDecision;
  conversationMessages: UIMessage[];
};

const COMPLETE_REPORT_PATTERNS = [
  /完整诊断书(?!成熟度)/,
  /完整诊断报告/,
  /完整方案/,
  /完整分析报告/,
  /现在信息(已经)?够.*完整方案/,
] as const;

const HTML_PUBLISH_CLAIM_PATTERNS = [
  /已生成.*HTML/,
  /可访问.*链接/,
  /二维码已生成/,
  /报告链接/,
] as const;

export function validateDeepDiagnosisOutput({
  responseMessage,
  decision,
  conversationMessages,
}: ValidateDeepDiagnosisOutputInput): DeepDiagnosisOutputValidationResult {
  const text = extractMessageText(responseMessage);
  const runtimeState = buildDeepDiagnosisRuntimeState(conversationMessages);
  const { factCard, evidenceView } = runtimeState;
  const reportJudge = judgeDeepDiagnosisReportText(text);
  const violations: DeepDiagnosisOutputViolation[] = [];

  for (const phrase of decision.forbiddenPhrases) {
    if (phrase && text.includes(phrase)) {
      violations.push({
        id: "forbidden_phrase",
        severity: "blocker",
        message: `输出命中本轮禁止表达：${phrase}`,
        evidence: phrase,
      });
    }
  }

  if (decision.maxReportLevel === "hypothesis_brief" && COMPLETE_REPORT_PATTERNS.some((pattern) => pattern.test(text))) {
    violations.push({
      id: "report_level_overreach",
      severity: "blocker",
      message: "当前最高只能输出假设简报，但回复使用了完整报告 / 完整方案口径。",
      evidence: "hypothesis_brief",
    });
  }

  if (decision.hardBlocks.length > 0 && COMPLETE_REPORT_PATTERNS.some((pattern) => pattern.test(text))) {
    violations.push({
      id: "hard_block_ignored",
      severity: "blocker",
      message: `存在硬阻塞时不能承诺完整报告：${decision.hardBlocks.join("；")}`,
      evidence: decision.hardBlocks.join("；"),
    });
  }

  if (decision.inputMode === "text" && containsToolPart(responseMessage, "askUserChoice")) {
    violations.push({
      id: "choice_tool_overreach",
      severity: "blocker",
      message: "当前必须等待用户自由文本输入，不能同轮调用 askUserChoice。",
      evidence: decision.reason,
    });
  }

  if (decision.inputMode === "multiple_choice") {
    const choiceToolInputs = extractToolInputs(responseMessage, "askUserChoice");
    const hasInvalidChoiceMode = choiceToolInputs.some((input) => input.mode !== "multiple");
    const hasBlockingMaxSelections = choiceToolInputs.some((input) => Number(input.maxSelections || 0) > 0);

    if (hasInvalidChoiceMode || hasBlockingMaxSelections) {
      violations.push({
        id: "choice_mode_mismatch",
        severity: "blocker",
        message: "当前必须用多选收集候选方向，不能退化为单选或设置最多选择数量。",
        evidence: JSON.stringify(choiceToolInputs),
      });
    }
  }

  if (factCard.pendingFacts.length > 0 && COMPLETE_REPORT_PATTERNS.some((pattern) => pattern.test(text))) {
    violations.push({
      id: "pending_facts_complete_report",
      severity: "blocker",
      message: "事实卡仍有待确认事实，不能把输出称为完整报告。",
      evidence: factCard.pendingFacts.join("；"),
    });
  }

  if (factCard.uncoveredAreas.length > 0 && /完整业务全局|业务全局完整|完整方案/.test(text)) {
    violations.push({
      id: "uncovered_areas_complete_claim",
      severity: "blocker",
      message: "存在未覆盖区域时，只能称为本轮专项方案或当前范围报告。",
      evidence: factCard.uncoveredAreas.join("；"),
    });
  }

  if (HTML_PUBLISH_CLAIM_PATTERNS.some((pattern) => pattern.test(text))) {
    violations.push({
      id: "html_publish_claim",
      severity: "warning",
      message: "publishHtmlReport 真实发布仍在 TODO，不能承诺可访问 HTML 链接或二维码。",
    });
  }

  if (/外部|行业|竞品|案例|趋势|市场/.test(text) && evidenceView.unverifiedGaps.length > 0) {
    violations.push({
      id: "weak_external_evidence",
      severity: "warning",
      message: "输出使用外部分析口径，但证据视图尚未达到 ready。",
      evidence: evidenceView.coverageStatement,
    });
  }

  if (COMPLETE_REPORT_PATTERNS.some((pattern) => pattern.test(text)) && !reportJudge.canCallCompleteReport) {
    violations.push({
      id: "quality_gate_failed",
      severity: "blocker",
      message: `Report Judge 未通过，不能称为完整报告。结论：${reportJudge.verdict}，当前 ${reportJudge.score}/110，阻塞项：${reportJudge.blockerLabels.join("、") || "无"}`,
      evidence: reportJudge.revisionHints.join("；") || String(reportJudge.score),
    });
  }

  const hasBlocker = violations.some((violation) => violation.severity === "blocker");

  return {
    passed: violations.length === 0,
    score: reportJudge.score,
    canPersistAsFinal: !hasBlocker,
    violations,
  };
}

export function attachDeepDiagnosisValidationMetadata(
  message: UIMessage,
  validation: DeepDiagnosisOutputValidationResult,
): UIMessage {
  return {
    ...message,
    metadata: {
      ...(isRecord(message.metadata) ? message.metadata : {}),
      deepDiagnosisValidation: validation,
    },
  };
}

function extractMessageText(message: UIMessage): string {
  return (message.parts || [])
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? String(part.text || "") : ""))
    .join("\n");
}

function containsToolPart(message: UIMessage, toolName: string): boolean {
  return (message.parts || []).some((part) => String(part.type) === `tool-${toolName}`);
}

function extractToolInputs(message: UIMessage, toolName: string): Record<string, unknown>[] {
  return (message.parts || [])
    .filter((part) => String(part.type) === `tool-${toolName}`)
    .map((part) => {
      if ("input" in part && isRecord(part.input)) return part.input;
      return {};
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
