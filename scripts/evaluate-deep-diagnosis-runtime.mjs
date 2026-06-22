import { readFileSync } from "node:fs";

const toolGuardSource = readFileSync(new URL("../lib/deep-diagnosis/tool-guard.ts", import.meta.url), "utf8");
const outputValidatorSource = readFileSync(new URL("../lib/deep-diagnosis/output-validator.ts", import.meta.url), "utf8");
const reportQualitySource = readFileSync(new URL("../lib/deep-diagnosis/report-quality.ts", import.meta.url), "utf8");
const runtimeStateSource = readFileSync(new URL("../lib/deep-diagnosis/runtime-state.ts", import.meta.url), "utf8");
const decisionStateSource = readFileSync(new URL("../lib/deep-diagnosis/decision/state.ts", import.meta.url), "utf8");
const contextManagerSource = readFileSync(new URL("../lib/deep-diagnosis/context-manager.ts", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../app/api/agent-team/chat/route.ts", import.meta.url), "utf8");

const checks = [
  {
    name: "text 输入模式会禁用 askUserChoice",
    passed: toolGuardSource.includes("decision.inputMode === \"text\"")
      && toolGuardSource.includes("toolNames.filter((name) => name !== \"askUserChoice\")"),
    missing: ["text 模式禁用 askUserChoice"],
  },
  {
    name: "choice 动作白名单集中管理",
    passed: toolGuardSource.includes("CHOICE_ACTIONS")
      && toolGuardSource.includes("\"ask_scope_route\"")
      && toolGuardSource.includes("\"offer_complete_report\""),
    missing: ["CHOICE_ACTIONS", "ask_scope_route", "offer_complete_report"],
  },
  {
    name: "输出裁判能识别报告级别越权",
    passed: outputValidatorSource.includes("report_level_overreach")
      && outputValidatorSource.includes("decision.maxReportLevel === \"hypothesis_brief\"")
      && outputValidatorSource.includes("COMPLETE_REPORT_PATTERNS"),
    missing: ["report_level_overreach", "hypothesis_brief", "COMPLETE_REPORT_PATTERNS"],
  },
  {
    name: "输出裁判能识别待确认事实越权",
    passed: outputValidatorSource.includes("pending_facts_complete_report")
      && outputValidatorSource.includes("factCard.pendingFacts.length > 0"),
    missing: ["pending_facts_complete_report", "factCard.pendingFacts"],
  },
  {
    name: "输出裁判能识别质量 Gate 未通过",
    passed: outputValidatorSource.includes("quality_gate_failed")
      && outputValidatorSource.includes("!reportJudge.canCallCompleteReport"),
    missing: ["quality_gate_failed", "canCallCompleteReport"],
  },
  {
    name: "Report Judge 输出 verdict 与修订建议",
    passed: reportQualitySource.includes("DeepDiagnosisJudgeVerdict")
      && reportQualitySource.includes("verdict")
      && reportQualitySource.includes("revisionHints")
      && reportQualitySource.includes("resolveJudgeVerdict"),
    missing: ["DeepDiagnosisJudgeVerdict", "verdict", "revisionHints", "resolveJudgeVerdict"],
  },
  {
    name: "Report Judge 具备空洞话术反模式",
    passed: reportQualitySource.includes("EMPTY_REPORT_ANTI_PATTERNS")
      && reportQualitySource.includes("形成闭环")
      && reportQualitySource.includes("根据实际情况")
      && reportQualitySource.includes("matchedAntiPatterns"),
    missing: ["EMPTY_REPORT_ANTI_PATTERNS", "形成闭环", "根据实际情况", "matchedAntiPatterns"],
  },
  {
    name: "API 保存前写入 validation metadata",
    passed: routeSource.includes("withDeepDiagnosisValidationMetadata")
      && outputValidatorSource.includes("deepDiagnosisValidation")
      && routeSource.includes("recordChatMessages"),
    missing: ["withDeepDiagnosisValidationMetadata", "deepDiagnosisValidation", "recordChatMessages"],
  },
  {
    name: "运行状态快照有可机读门禁",
    passed: runtimeStateSource.includes("DeepDiagnosisRuntimeStateSnapshot")
      && runtimeStateSource.includes("stateGates")
      && runtimeStateSource.includes("blockingGates")
      && runtimeStateSource.includes("status: \"complete\" | \"blocked\" | \"pending\""),
    missing: ["RuntimeStateSnapshot", "stateGates", "blockingGates", "gate status"],
  },
  {
    name: "运行状态快照聚合事实证据就绪质量",
    passed: runtimeStateSource.includes("buildDeepDiagnosisFactCard")
      && runtimeStateSource.includes("buildDeepDiagnosisEvidenceView")
      && runtimeStateSource.includes("evaluateDeepDiagnosisReportReadiness")
      && runtimeStateSource.includes("buildDeepDiagnosisRuntimeQualityGate"),
    missing: ["fact card", "evidence view", "report readiness", "quality gate"],
  },
  {
    name: "Decision State 从结构化状态派生",
    passed: decisionStateSource.includes("buildDeepDiagnosisRuntimeState")
      && decisionStateSource.includes("runtimeState")
      && decisionStateSource.includes("entryRoute")
      && decisionStateSource.includes("progress"),
    missing: ["buildDeepDiagnosisRuntimeState", "runtimeState", "entryRoute", "progress"],
  },
  {
    name: "上下文管理注入结构化状态",
    passed: contextManagerSource.includes("formatDeepDiagnosisRuntimeStateForPrompt")
      && contextManagerSource.includes("runtimeState.factCard")
      && contextManagerSource.includes("runtimeState.evidenceView")
      && contextManagerSource.includes("runtimeState.qualityGate"),
    missing: ["format runtime state", "fact card from runtime", "evidence from runtime", "quality from runtime"],
  },
];

for (const check of checks) {
  if (check.passed) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ ${check.name}：缺少 ${check.missing.join("、")}`);
  }
}

if (checks.some((check) => !check.passed)) {
  process.exitCode = 1;
}
