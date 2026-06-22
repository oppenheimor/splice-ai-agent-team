export type DeepDiagnosisJudgeVerdict = "pass" | "revise" | "downgrade" | "continue_diagnosis";

export type DeepDiagnosisQualityDimensionId =
  | "scope_level"
  | "horizontal_scan"
  | "primary_bottleneck"
  | "causal_chain"
  | "evidence_strength"
  | "asset_quality"
  | "grounded_reality"
  | "negative_decision"
  | "customization_fit";

export type DeepDiagnosisQualityCheck = {
  id: DeepDiagnosisQualityDimensionId;
  label: string;
  requiredSignals: string[];
  antiPatterns: RegExp[];
  score: number;
  blocker: boolean;
};

export type DeepDiagnosisQualityResult = DeepDiagnosisQualityCheck & {
  passed: boolean;
  earnedScore: number;
  missingSignals: string[];
  matchedAntiPatterns: string[];
  rationale: string;
};

export type DeepDiagnosisReportJudgeResult = {
  score: number;
  currentLevelUsabilityScore: number;
  completeReportMaturityScore: number;
  canCallCompleteReport: boolean;
  verdict: DeepDiagnosisJudgeVerdict;
  results: DeepDiagnosisQualityResult[];
  blockerLabels: string[];
  revisionHints: string[];
};

const EMPTY_REPORT_ANTI_PATTERNS = [
  /可以考虑/,
  /建议加强/,
  /提升效率/,
  /赋能/,
  /形成闭环/,
  /根据实际情况/,
  /持续优化/,
] as const;

export const DEEP_DIAGNOSIS_QUALITY_CHECKS: DeepDiagnosisQualityCheck[] = [
  {
    id: "scope_level",
    label: "诊断范围与报告级别",
    requiredSignals: ["诊断范围声明", "报告级别", "未覆盖区域"],
    antiPatterns: [/未覆盖区域[:：]?\s*(无|暂无|没有)[\s\S]*完整业务全局/],
    score: 10,
    blocker: true,
  },
  {
    id: "horizontal_scan",
    label: "横向扫描",
    requiredSignals: ["候选业务环节", "可比较评分", "为什么不是其它环节"],
    antiPatterns: [/只分析一个环节/, /没有必要比较/, /直接做.*即可/],
    score: 12,
    blocker: true,
  },
  {
    id: "primary_bottleneck",
    label: "第一瓶颈可信度",
    requiredSignals: ["第一瓶颈", "瓶颈类型", "证据来源", "当前基线"],
    antiPatterns: [/第一瓶颈[\s\S]*提升效率/, /核心问题[\s\S]*AI 能力不足/],
    score: 15,
    blocker: true,
  },
  {
    id: "causal_chain",
    label: "因果链",
    requiredSignals: ["现象", "根因", "影响", "如果不是"],
    antiPatterns: [/因为[\s\S]*所以[\s\S]*建议[\s\S]*AI/, /问题[\s\S]*解决方案/],
    score: 13,
    blocker: true,
  },
  {
    id: "evidence_strength",
    label: "证据强度",
    requiredSignals: ["搜索覆盖范围", "原始引用链", "证据等级", "反例", "未验证缺口"],
    antiPatterns: [/行业已经证明/, /权威证明/, /大量案例表明/],
    score: 15,
    blocker: true,
  },
  {
    id: "asset_quality",
    label: "可执行资产质量",
    requiredSignals: ["可用资产", "输入字段", "负责人", "验收标准", "失败后"],
    antiPatterns: [/制定计划/, /搭建体系/, /建立机制/],
    score: 15,
    blocker: true,
  },
  {
    id: "grounded_reality",
    label: "接地气程度",
    requiredSignals: ["用户现场", "当前基线", "低成本", "7 天内", "不用"],
    antiPatterns: [/全面数字化转型/, /企业级中台/, /一步到位/],
    score: 10,
    blocker: false,
  },
  {
    id: "negative_decision",
    label: "反选与暂不做判断",
    requiredSignals: ["暂不建议", "不适用", "退出标准", "重新考虑条件"],
    antiPatterns: [/所有环节都值得做/, /都可以尝试/, /没有明显风险/],
    score: 10,
    blocker: false,
  },
  {
    id: "customization_fit",
    label: "定制升级适配度",
    requiredSignals: ["自助工具版", "工作流模板版", "系统 / Agent 定制版", "定制前置条件"],
    antiPatterns: [/建议直接做系统/, /马上进入定制开发/, /无需试点/],
    score: 10,
    blocker: false,
  },
];

export function evaluateDeepDiagnosisReportText(text: string): DeepDiagnosisQualityResult[] {
  return DEEP_DIAGNOSIS_QUALITY_CHECKS.map((check) => {
    const missingSignals = check.requiredSignals.filter((signal) => !text.includes(signal));
    const matchedAntiPatterns = [
      ...check.antiPatterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source),
      ...EMPTY_REPORT_ANTI_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source),
    ];
    const passed = missingSignals.length === 0 && matchedAntiPatterns.length === 0;

    return {
      ...check,
      passed,
      earnedScore: passed ? check.score : 0,
      missingSignals,
      matchedAntiPatterns,
      rationale: buildDimensionRationale(check, missingSignals, matchedAntiPatterns),
    };
  });
}

export function judgeDeepDiagnosisReportText(text: string): DeepDiagnosisReportJudgeResult {
  const results = evaluateDeepDiagnosisReportText(text);
  const score = results.reduce((total, result) => total + result.earnedScore, 0);
  const currentLevelUsabilityScore = calculateCurrentLevelUsabilityScore(results);
  const blockerLabels = results
    .filter((result) => result.blocker && !result.passed)
    .map((result) => result.label);
  const revisionHints = results
    .filter((result) => !result.passed)
    .map((result) => `${result.label}：${result.rationale}`);
  const verdict = resolveJudgeVerdict(score, blockerLabels, results);

  return {
    score,
    currentLevelUsabilityScore,
    completeReportMaturityScore: score,
    canCallCompleteReport: verdict === "pass",
    verdict,
    results,
    blockerLabels,
    revisionHints,
  };
}

export function formatDeepDiagnosisQualityGateForPrompt(): string {
  return DEEP_DIAGNOSIS_QUALITY_CHECKS
    .map((check, index) => {
      const mode = check.blocker ? "阻塞维度" : "补强维度";
      return `${index + 1}. ${check.label}（${check.score} 分，${mode}）：必须出现 ${check.requiredSignals.join("、")}；不得出现空洞口径：${check.antiPatterns.map((pattern) => pattern.source).join(" / ")}。`;
    })
    .join("\n");
}

export function formatDeepDiagnosisReportScoreGuidanceForPrompt(): string {
  return [
    "质量分展示必须拆成两个口径：",
    "1. 当前级别可用度（100 分制）：评价当前 hypothesis_brief / 专项方案是否能指导用户下一步行动。",
    "2. 完整诊断书成熟度（110 分制）：评价距离 complete report 还缺哪些事实、证据、覆盖范围和质量门禁。",
    "如果完整诊断书成熟度低，但当前简报可执行性高，应写成「当前简报可用，但不能冒充完整诊断书」，不要只展示一个低分。",
  ].join("\n");
}

function resolveJudgeVerdict(
  score: number,
  blockerLabels: string[],
  results: DeepDiagnosisQualityResult[],
): DeepDiagnosisJudgeVerdict {
  if (blockerLabels.some((label) => ["诊断范围与报告级别", "第一瓶颈可信度", "证据强度"].includes(label))) {
    return "continue_diagnosis";
  }

  if (blockerLabels.length > 0) {
    return "downgrade";
  }

  if (score >= 90 && results.every((result) => !result.blocker || result.passed)) {
    return "pass";
  }

  return "revise";
}

function buildDimensionRationale(
  check: DeepDiagnosisQualityCheck,
  missingSignals: string[],
  matchedAntiPatterns: string[],
): string {
  if (!missingSignals.length && !matchedAntiPatterns.length) {
    return "通过";
  }

  const reasons = [];
  if (missingSignals.length) reasons.push(`缺少 ${missingSignals.join("、")}`);
  if (matchedAntiPatterns.length) reasons.push(`命中空洞/越权口径 ${matchedAntiPatterns.join("、")}`);
  return `${check.label}未通过：${reasons.join("；")}`;
}

function calculateCurrentLevelUsabilityScore(results: DeepDiagnosisQualityResult[]): number {
  const currentLevelDimensionIds: DeepDiagnosisQualityDimensionId[] = [
    "scope_level",
    "primary_bottleneck",
    "causal_chain",
    "asset_quality",
    "grounded_reality",
    "negative_decision",
  ];
  const currentResults = results.filter((result) => currentLevelDimensionIds.includes(result.id));
  const possibleScore = currentResults.reduce((total, result) => total + result.score, 0);
  const earnedScore = currentResults.reduce((total, result) => total + result.earnedScore, 0);

  if (possibleScore === 0) {
    return 0;
  }

  return Math.round((earnedScore / possibleScore) * 100);
}
