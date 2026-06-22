import type { DeepDiagnosisDecision } from "./types";

export function formatDeepDiagnosisDecisionForPrompt(decision: DeepDiagnosisDecision): string {
  return [
    "【Deep Diagnosis 决策策略层】",
    "以下是运行时策略层对本轮对话的硬决策。它优先于通用 prompt 文案。",
    `本轮允许动作：${decision.nextAction}`,
    `本轮输入形态：${decision.inputMode}`,
    `最高报告级别：${decision.maxReportLevel}`,
    `是否可提系统化方向：${decision.canMentionCustomization ? "可以" : "不可以"}`,
    `是否可推荐系统 / Agent 定制：${decision.canRecommendCustomization ? "可以" : "不可以"}`,
    decision.allowedLabels.length ? `允许选项文案：${decision.allowedLabels.join("、")}` : "",
    decision.forbiddenPhrases.length ? `禁止表达：${decision.forbiddenPhrases.join("、")}` : "",
    decision.hardBlocks.length ? `硬阻塞：${decision.hardBlocks.join("；")}` : "",
    decision.warnings.length ? `警告：${decision.warnings.join("；")}` : "",
    decision.missingFacts.length ? `缺失事实：${decision.missingFacts.join("、")}` : "",
    decision.requiredNextSteps.length ? `必须执行的下一步：${decision.requiredNextSteps.join("；")}` : "",
    `决策原因：${decision.reason}`,
    "执行纪律：如果策略层限制本轮只能追问、确认事实、输出专项方案或假设简报，不得自行升级为完整方案。",
  ].filter(Boolean).join("\n");
}
