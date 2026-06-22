import type { UIMessage } from "ai";
import { judgeDeepDiagnosisReportText, type DeepDiagnosisReportJudgeResult } from "./report-quality";

export type DeepDiagnosisRuntimeQualityGate = DeepDiagnosisReportJudgeResult & {
  hasReportLikeOutput: boolean;
  enforcedReportLevel: "hypothesis_brief" | "complete_report_allowed";
  instruction: string;
};

export function buildDeepDiagnosisRuntimeQualityGate(messages: UIMessage[]): DeepDiagnosisRuntimeQualityGate {
  const transcript = extractAssistantText(messages);
  const hasReportLikeOutput = /诊断书|完整方案|报告质量 Gate|完整性评分|7\s*\/\s*30\s*\/\s*90/.test(transcript);
  const judge = judgeDeepDiagnosisReportText(transcript);
  const completeAllowed = hasReportLikeOutput && judge.canCallCompleteReport;

  return {
    ...judge,
    hasReportLikeOutput,
    enforcedReportLevel: completeAllowed ? "complete_report_allowed" : "hypothesis_brief",
    instruction: completeAllowed
      ? "报告质量门禁通过；仍需遵守事实确认和范围边界。"
      : "报告质量门禁未通过或尚未出现报告级输出；不得称为完整诊断书。",
  };
}

export function formatDeepDiagnosisRuntimeQualityGateForPrompt(gate: DeepDiagnosisRuntimeQualityGate): string {
  return [
    "【Deep Diagnosis 运行时质量 Gate】",
    `检测到报告级输出：${gate.hasReportLikeOutput ? "是" : "否"}`,
    `当前级别可用度：${gate.currentLevelUsabilityScore}/100`,
    `完整诊断书成熟度：${gate.completeReportMaturityScore}/110`,
    `裁判结论：${gate.verdict}`,
    `是否允许完整报告称谓：${gate.canCallCompleteReport ? "允许" : "不允许"}`,
    gate.blockerLabels.length ? `阻塞项：${gate.blockerLabels.join("、")}` : "阻塞项：暂无",
    gate.revisionHints.length ? `修订建议：${gate.revisionHints.slice(0, 5).join("；")}` : "修订建议：暂无",
    `强制报告级别：${gate.enforcedReportLevel}`,
    `执行纪律：${gate.instruction}`,
  ].join("\n");
}

function extractAssistantText(messages: UIMessage[]): string {
  return messages
    .filter((message) => message.role === "assistant")
    .flatMap((message) => message.parts || [])
    .filter((part) => part.type === "text" && "text" in part)
    .map((part) => String(part.text || ""))
    .join("\n");
}
