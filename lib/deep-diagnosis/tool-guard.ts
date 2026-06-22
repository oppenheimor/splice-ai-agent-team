import type { ToolSet } from "ai";
import type { DeepDiagnosisDecision } from "./decision";

const CHOICE_ACTIONS = new Set<DeepDiagnosisDecision["nextAction"]>([
  "ask_scope_route",
  "ask_multi_problem_selection",
  "confirm_key_facts",
  "ask_missing_facts",
  "offer_special_report",
  "offer_complete_report",
]);

export type DeepDiagnosisToolGuardResult = {
  activeTools: string[];
  disabledTools: string[];
  reason: string;
};

export function resolveDeepDiagnosisToolGuard(
  tools: ToolSet,
  decision: DeepDiagnosisDecision,
): DeepDiagnosisToolGuardResult {
  const toolNames = Object.keys(tools);
  const shouldDisableChoice = !canUseChoiceTool(decision);
  const activeTools = shouldDisableChoice
    ? toolNames.filter((name) => name !== "askUserChoice")
    : toolNames;

  return {
    activeTools,
    disabledTools: toolNames.filter((name) => !activeTools.includes(name)),
    reason: shouldDisableChoice
      ? `当前决策要求 ${decision.inputMode} 输入，禁止 askUserChoice 越权打断。`
      : `当前动作 ${decision.nextAction} 允许使用 askUserChoice。`,
  };
}

function canUseChoiceTool(decision: DeepDiagnosisDecision): boolean {
  if (decision.inputMode === "text" || decision.inputMode === "none") {
    return false;
  }

  return CHOICE_ACTIONS.has(decision.nextAction);
}
