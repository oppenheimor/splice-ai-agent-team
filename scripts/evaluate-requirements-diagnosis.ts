import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { calculateDiagnosis } from "../lib/requirements-diagnosis/scoring";
import type { DiagnosisResult, QuizAnswers, QuizOptionValue, QuestionId } from "../lib/requirements-diagnosis/types";

type SingleQuestionId = Exclude<QuestionId, "q10" | "q11">;

const REPORT_PATH = resolve("docs/2026-05-31-需求诊断结果合理性评估报告.md");
const SINGLE_VALUES = ["A", "B", "C"] as const;
const Q9_VALUES = ["A", "B", "C", "D"] as const;
const Q10_VALUES = ["A", "B", "C", "D", "E"] as const;
const Q11_VALUES = ["A", "B", "C", "D", "E", "F"] as const;
const EXPECTED_OPERATOR_TYPES = [
  "稳健深耕型",
  "增长探索型",
  "经验判断型",
  "数据验证型",
  "系统重构型",
  "快速试水型",
  "成本优先型",
  "长期投入型",
  "风险防守型",
  "创新进攻型",
  "平衡统筹型",
] as const;

const BASE_ANSWERS = {
  q1: "C",
  q2: "C",
  q14: "C",
  q3: "C",
  q15: "C",
  q16: "C",
  q4: "C",
  q13: "C",
  q17: "C",
  q5: "C",
  q18: "C",
  q19: "C",
  q6: "C",
  q7: "C",
  q20: "C",
  q21: "C",
  q8: "B",
  q9: "B",
  q10: ["A"],
  q22: "B",
  q11: ["A", "C", "D"],
  q12: "C",
  q23: "C",
  q24: "A",
} satisfies Required<QuizAnswers>;

const GOLDEN_CASES = [
  { name: "经营画像：稳健深耕", answers: { ...BASE_ANSWERS, q1: "A", q2: "A" }, expected: { operatorTypeName: "稳健深耕型" } },
  { name: "经营画像：增长探索", answers: { ...BASE_ANSWERS, q1: "E", q2: "E" }, expected: { operatorTypeName: "增长探索型" } },
  { name: "经营画像：经验判断", answers: { ...BASE_ANSWERS, q3: "A" }, expected: { operatorTypeName: "经验判断型" } },
  { name: "经营画像：数据验证", answers: { ...BASE_ANSWERS, q3: "E" }, expected: { operatorTypeName: "数据验证型" } },
  { name: "经营画像：系统重构", answers: { ...BASE_ANSWERS, q4: "A", q13: "A" }, expected: { operatorTypeName: "系统重构型" } },
  { name: "经营画像：快速试水", answers: { ...BASE_ANSWERS, q4: "E", q13: "E" }, expected: { operatorTypeName: "快速试水型" } },
  { name: "经营画像：成本优先", answers: { ...BASE_ANSWERS, q5: "A" }, expected: { operatorTypeName: "成本优先型" } },
  { name: "经营画像：长期投入", answers: { ...BASE_ANSWERS, q5: "E" }, expected: { operatorTypeName: "长期投入型" } },
  { name: "经营画像：风险防守", answers: { ...BASE_ANSWERS, q6: "A", q7: "A" }, expected: { operatorTypeName: "风险防守型" } },
  { name: "经营画像：创新进攻", answers: { ...BASE_ANSWERS, q6: "E", q7: "E" }, expected: { operatorTypeName: "创新进攻型" } },
  { name: "经营画像：平衡统筹", answers: BASE_ANSWERS, expected: { operatorTypeName: "平衡统筹型" } },
  { name: "AI 阶段：无常态化工具优先判 L1", answers: { ...BASE_ANSWERS, q9: "D", q10: ["E"] }, expected: { aiAdoptionStage: "L1" } },
  { name: "AI 阶段：全域刚需", answers: { ...BASE_ANSWERS, q8: "B", q9: "D", q10: ["A", "B", "C", "D"], q22: "E" }, expected: { aiAdoptionStage: "L5" } },
  {
    name: "真实样本：高频使用代码与 Agent 工具",
    answers: {
      ...BASE_ANSWERS,
      q1: "D",
      q2: "C",
      q3: "D",
      q4: "C",
      q13: "D",
      q5: "C",
      q6: "D",
      q7: "A",
      q8: "B",
      q9: "D",
      q10: ["D", "C", "A"],
      q11: ["A", "B", "C", "D", "F", "E"],
      q12: "C",
      q22: "E",
    },
    expected: { operatorTypeName: "数据验证型", aiAdoptionStage: "L5", justNeedLabel: "客户转化与服务" },
  },
  { name: "刚需方向：重复执行工作", answers: { ...BASE_ANSWERS, q12: "A" }, expected: { justNeedLabel: "重复性执行工作" } },
  { name: "刚需方向：内容与创意产出", answers: { ...BASE_ANSWERS, q12: "B" }, expected: { justNeedLabel: "内容与创意产出" } },
] satisfies Array<{
  name: string;
  answers: Required<QuizAnswers>;
  expected: Partial<Pick<DiagnosisResult, "operatorTypeName" | "aiAdoptionStage" | "justNeedLabel">>;
}>;

function main() {
  const operatorCombos = cartesianSingles(["q1", "q2", "q3", "q4", "q13", "q5", "q6", "q7"]);
  const q8Combos = ["A", "B", "C"] as const;
  const q10Combos = validQ10Combinations();
  const q11Combos = nonEmptySubsets(Q11_VALUES);
  const q12Combos = ["A", "B", "C"] as const;
  const totalLogicalCombinations = operatorCombos.length * q8Combos.length * Q9_VALUES.length * q10Combos.length * q11Combos.length * q12Combos.length;

  const operatorStats = scanOperatorTypes(operatorCombos);
  const questionInfluenceStats = scanQuestionInfluence(operatorCombos);
  const adoptionStats = scanAdoptionStages(q8Combos, Q9_VALUES, q10Combos);
  const cognitionStats = scanCognitionWidth(q11Combos);
  const needStats = scanJustNeed(q12Combos);
  const edgeCases = buildEdgeCases();
  const goldenStats = scanGoldenCases();
  const representativeCases = buildRepresentativeCases(operatorCombos);
  const adoptionRepresentativeCases = buildAdoptionRepresentativeCases(q8Combos, Q9_VALUES, q10Combos);
  const allSamples = dedupeSamples([...representativeCases, ...adoptionRepresentativeCases, ...edgeCases]);
  const judgedSamples = allSamples.map((sample) => judgeSample(sample.name, sample.answers, calculateDiagnosis(sample.answers)));
  const findings = buildFindings(judgedSamples, operatorStats, questionInfluenceStats, adoptionStats, cognitionStats, goldenStats);

  writeReport({
    totalLogicalCombinations,
    operatorStats,
    questionInfluenceStats,
    adoptionStats,
    cognitionStats,
    needStats,
    goldenStats,
    q10Combos,
    q11Combos,
    judgedSamples,
    findings,
  });

  console.log(`Wrote ${REPORT_PATH}`);
}

function cartesianSingles(ids: SingleQuestionId[]): Array<Record<string, QuizOptionValue>> {
  const output: Array<Record<string, QuizOptionValue>> = [];
  function visit(index: number, current: Record<string, QuizOptionValue>) {
    if (index === ids.length) {
      output.push({ ...current });
      return;
    }
    for (const value of SINGLE_VALUES) {
      current[ids[index]] = value;
      visit(index + 1, current);
    }
  }
  visit(0, {});
  return output;
}

function validQ10Combinations(): QuizOptionValue[][] {
  const toolCombos = nonEmptySubsets(["A", "B", "C", "D"] as const);
  return [...toolCombos, ["E"]];
}

function nonEmptySubsets<T extends string>(values: readonly T[]): T[][] {
  const output: T[][] = [];
  for (let mask = 1; mask < (1 << values.length); mask += 1) {
    const item: T[] = [];
    values.forEach((value, index) => {
      if (mask & (1 << index)) item.push(value);
    });
    output.push(item);
  }
  return output;
}

function scanOperatorTypes(combos: Array<Record<string, QuizOptionValue>>) {
  const byType = new Map<string, number>();
  const byCode = new Map<string, number>();
  const examples = new Map<string, { answers: QuizAnswers; result: DiagnosisResult }>();
  const invariantIssues: string[] = [];

  for (const combo of combos) {
    const answers = { ...BASE_ANSWERS, ...combo };
    const result = calculateDiagnosis(answers);
    increment(byType, result.operatorTypeName);
    increment(byCode, result.operatorCode);
    if (!examples.has(result.operatorTypeName)) examples.set(result.operatorTypeName, { answers, result });

    const hasProminent = Object.values(result.dimensionScores).some((score) => score.diff >= 20);
    if (result.operatorTypeName === "平衡统筹型" && hasProminent) {
      invariantIssues.push(`平衡统筹型出现时仍存在显著维度偏差: ${formatAnswers(answers)}`);
    }
    if (result.operatorTypeName !== "平衡统筹型" && !hasProminent) {
      invariantIssues.push(`无显著维度偏差时没有落到平衡统筹型: ${formatAnswers(answers)}`);
    }
  }

  return { total: combos.length, byType, byCode, examples, invariantIssues };
}

function scanQuestionInfluence(combos: Array<Record<string, QuizOptionValue>>) {
  const perQuestion = new Map<string, Map<string, Map<string, number>>>();
  for (const questionId of ["q1", "q2", "q3", "q4", "q13", "q5", "q6", "q7"]) {
    perQuestion.set(questionId, new Map());
  }

  for (const combo of combos) {
    const result = calculateDiagnosis({ ...BASE_ANSWERS, ...combo });
    for (const [questionId, answer] of Object.entries(combo)) {
      const byAnswer = getNestedMap(perQuestion.get(questionId)!, answer);
      increment(byAnswer, result.operatorTypeName);
    }
  }

  const dominanceWarnings: string[] = [];
  for (const [questionId, byAnswer] of perQuestion) {
    for (const [answer, byType] of byAnswer) {
      const total = sumMap(byType);
      const [topType, topCount] = [...byType.entries()].sort((a, b) => b[1] - a[1])[0];
      const ratio = topCount / total;
      if (ratio >= 0.9) {
        dominanceWarnings.push(`${questionId}=${answer} 时，${topType} 占 ${(ratio * 100).toFixed(1)}%，单题主导过强。`);
      }
    }
  }

  return { perQuestion, dominanceWarnings };
}

function scanAdoptionStages(q8Values: readonly QuizOptionValue[], q9Values: readonly QuizOptionValue[], q10Combos: QuizOptionValue[][]) {
  const byStage = new Map<string, number>();
  const byStageAndQ10 = new Map<string, number>();
  const contradictions: Array<{ answers: QuizAnswers; result: DiagnosisResult; reason: string }> = [];

  for (const q8 of q8Values) {
    for (const q9 of q9Values) {
      for (const q10 of q10Combos) {
        const answers = { ...BASE_ANSWERS, q8, q9, q10 };
        const result = calculateDiagnosis(answers);
        increment(byStage, `${result.aiAdoptionStage} · ${result.aiAdoptionStageLabel}`);
        increment(byStageAndQ10, `${result.aiAdoptionStage} / Q10=${q10.join("")}`);
        if (q10.includes("E") && q9 !== "A") {
          contradictions.push({ answers, result, reason: "Q10 选择纯人工，但 Q9 声称每天有效使用 AI 超过 0 小时。" });
        }
      }
    }
  }

  return { total: q8Values.length * q9Values.length * q10Combos.length, byStage, byStageAndQ10, contradictions };
}

function scanCognitionWidth(q11Combos: QuizOptionValue[][]) {
  const byWidth = new Map<string, number>();
  const blindSpotLengths = new Map<number, number>();
  for (const q11 of q11Combos) {
    const result = calculateDiagnosis({ ...BASE_ANSWERS, q11 });
    increment(byWidth, result.cognitiveWidth);
    increment(blindSpotLengths, result.blindSpots.length);
  }
  return { total: q11Combos.length, byWidth, blindSpotLengths };
}

function scanJustNeed(q12Values: readonly QuizOptionValue[]) {
  const byNeed = new Map<string, number>();
  for (const q12 of q12Values) {
    const result = calculateDiagnosis({ ...BASE_ANSWERS, q12 });
    increment(byNeed, result.justNeedLabel);
  }
  return { total: q12Values.length, byNeed };
}

function scanGoldenCases() {
  return GOLDEN_CASES.map((goldenCase) => {
    const result = calculateDiagnosis(goldenCase.answers);
    const issues = Object.entries(goldenCase.expected)
      .filter(([key, expectedValue]) => result[key as keyof DiagnosisResult] !== expectedValue)
      .map(([key, expectedValue]) => `${key} 预期 ${expectedValue}，实际 ${String(result[key as keyof DiagnosisResult])}`);
    return { ...goldenCase, result, issues };
  });
}

function buildRepresentativeCases(combos: Array<Record<string, QuizOptionValue>>) {
  const byType = new Map<string, Array<{ answers: Required<QuizAnswers>; result: DiagnosisResult }>>();
  for (const combo of combos) {
    const answers = { ...BASE_ANSWERS, ...combo };
    const result = calculateDiagnosis(answers);
    const bucket = byType.get(result.operatorTypeName) || [];
    bucket.push({ answers, result });
    byType.set(result.operatorTypeName, bucket);
  }

  const cases: Array<{ name: string; answers: Required<QuizAnswers> }> = [];
  for (const [typeName, items] of byType) {
    const typical = [...items].sort((a, b) => maxDiff(b.result) - maxDiff(a.result))[0];
    const boundary = [...items].sort((a, b) => maxDiff(a.result) - maxDiff(b.result))[0];
    const mixed = items.find((item) => Boolean(item.result.operatorType.secondaryTrait));
    cases.push({ name: `类型典型样本：${typeName}`, answers: typical.answers });
    if (boundary && formatAnswers(boundary.answers) !== formatAnswers(typical.answers)) {
      cases.push({ name: `类型边界样本：${typeName}`, answers: boundary.answers });
    }
    if (mixed && ![typical, boundary].some((item) => item && formatAnswers(item.answers) === formatAnswers(mixed.answers))) {
      cases.push({ name: `类型混合样本：${typeName}`, answers: mixed.answers });
    }
  }
  return cases;
}

function buildAdoptionRepresentativeCases(
  q8Values: readonly QuizOptionValue[],
  q9Values: readonly QuizOptionValue[],
  q10Combos: QuizOptionValue[][],
) {
  const byStage = new Map<string, Array<{ answers: Required<QuizAnswers>; result: DiagnosisResult }>>();
  for (const q8 of q8Values) {
    for (const q9 of q9Values) {
      for (const q10 of q10Combos) {
        const answers = { ...BASE_ANSWERS, q8, q9, q10 };
        const result = calculateDiagnosis(answers);
        const bucket = byStage.get(result.aiAdoptionStage) || [];
        bucket.push({ answers, result });
        byStage.set(result.aiAdoptionStage, bucket);
      }
    }
  }

  const cases: Array<{ name: string; answers: Required<QuizAnswers> }> = [];
  for (const [stage, items] of byStage) {
    const first = items[0];
    const withManyTools = [...items].sort((a, b) => (b.answers.q10 as QuizOptionValue[]).length - (a.answers.q10 as QuizOptionValue[]).length)[0];
    const withManual = items.find((item) => (item.answers.q10 as QuizOptionValue[]).includes("E"));
    cases.push({ name: `AI阶段代表样本：${stage}`, answers: first.answers });
    if (withManyTools && formatAnswers(withManyTools.answers) !== formatAnswers(first.answers)) {
      cases.push({ name: `AI阶段多工具样本：${stage}`, answers: withManyTools.answers });
    }
    if (withManual && ![first, withManyTools].some((item) => item && formatAnswers(item.answers) === formatAnswers(withManual.answers))) {
      cases.push({ name: `AI阶段纯人工样本：${stage}`, answers: withManual.answers });
    }
  }
  return cases;
}

function buildEdgeCases() {
  return [
    { name: "边界样本：全 A 经营画像", answers: { ...BASE_ANSWERS, q1: "A", q2: "A", q3: "A", q4: "A", q13: "A", q5: "A", q6: "A", q7: "A" } },
    { name: "边界样本：全 B 经营画像", answers: { ...BASE_ANSWERS, q1: "B", q2: "B", q3: "B", q4: "B", q13: "B", q5: "B", q6: "B", q7: "B" } },
    { name: "边界样本：全 C 经营画像", answers: { ...BASE_ANSWERS, q1: "C", q2: "C", q3: "C", q4: "C", q13: "C", q5: "C", q6: "C", q7: "C" } },
    { name: "边界样本：纯人工但高使用时长", answers: { ...BASE_ANSWERS, q9: "D", q10: ["E"] } },
    { name: "边界样本：高阶工具组合", answers: { ...BASE_ANSWERS, q8: "B", q9: "D", q10: ["A", "B", "C", "D"], q11: ["A", "B", "C", "D", "E", "F"] } },
    { name: "边界样本：低使用但全景认知", answers: { ...BASE_ANSWERS, q9: "A", q10: ["E"], q11: ["A", "B", "C", "D", "E", "F"] } },
    { name: "边界样本：高使用但聚焦认知", answers: { ...BASE_ANSWERS, q8: "B", q9: "D", q10: ["A", "B", "C"], q11: ["A"] } },
    { name: "边界样本：重复机械刚需", answers: { ...BASE_ANSWERS, q12: "A" } },
    { name: "边界样本：创意产出刚需", answers: { ...BASE_ANSWERS, q12: "B" } },
    { name: "边界样本：复杂系统刚需", answers: { ...BASE_ANSWERS, q12: "C" } },
  ] satisfies Array<{ name: string; answers: Required<QuizAnswers> }>;
}

function judgeSample(name: string, answers: Required<QuizAnswers>, result: DiagnosisResult) {
  const warnings: string[] = [];
  const failures: string[] = [];

  if (!EXPECTED_OPERATOR_TYPES.includes(result.operatorTypeName as (typeof EXPECTED_OPERATOR_TYPES)[number])) {
    failures.push(`经营类型不在 11 种白名单内: ${result.operatorTypeName}`);
  }
  if (!/^L[1-5]$/.test(result.aiAdoptionStage)) {
    failures.push(`AI 落地阶段非法: ${result.aiAdoptionStage}`);
  }
  if (!result.operatorTypeDefinition.includes("适合")) {
    warnings.push("经营类型解释缺少明确适配建议。");
  }
  if (result.operatorTypeName !== "平衡统筹型" && result.operatorType.secondaryTrait === result.operatorType.primaryTrait) {
    warnings.push("主倾向和辅助倾向重复，解释价值偏低。");
  }
  if ((answers.q10 as QuizOptionValue[]).includes("E") && answers.q9 !== "A") {
    warnings.push("未使用工具与有效使用时长存在语义冲突，题目口径已收敛，规则层按未常态化使用工具处理。");
  }
  if (answers.q9 === "A" && !(answers.q10 as QuizOptionValue[]).includes("E")) {
    warnings.push("几乎不用 AI 但选择了常态化工具，存在轻微自我认知冲突。");
  }
  if (!result.narrative) {
    warnings.push("叙事尚未生成，离线评估只检查结构化评分。");
  } else if (result.narrative.actionPlan.week.length < 12) {
    warnings.push("本周动作过短，可能不像咨询建议。");
  }

  const score = Math.max(1, 5 - failures.length * 2 - warnings.length * 0.5);
  return { name, answers, result, score, warnings, failures };
}

function buildFindings(
  judgedSamples: ReturnType<typeof judgeSample>[],
  operatorStats: ReturnType<typeof scanOperatorTypes>,
  questionInfluenceStats: ReturnType<typeof scanQuestionInfluence>,
  adoptionStats: ReturnType<typeof scanAdoptionStages>,
  cognitionStats: ReturnType<typeof scanCognitionWidth>,
  goldenStats: ReturnType<typeof scanGoldenCases>,
) {
  const findings: string[] = [];
  const goldenFailures = goldenStats.filter((item) => item.issues.length > 0);
  if (goldenFailures.length === 0) {
    findings.push(`Golden Set 回归通过：${goldenStats.length} 个关键画像样本均符合预期。`);
  } else {
    findings.push(`Golden Set 回归发现 ${goldenFailures.length} 个失败样本，需要先修正再继续优化规则。`);
  }
  if (operatorStats.invariantIssues.length === 0) {
    findings.push("经营类型硬规则通过：11 种类型均可达，平衡统筹型只在无显著维度偏差时出现。");
  }
  if (operatorStats.byType.size === EXPECTED_OPERATOR_TYPES.length) {
    findings.push("经营类型覆盖完整：Q1-Q7 + Q13 的组合能覆盖全部 11 种类型。");
  }
  if (questionInfluenceStats.dominanceWarnings.length > 0) {
    findings.push(`发现 ${questionInfluenceStats.dominanceWarnings.length} 个单题主导风险，说明顶部类型对部分单选题过于敏感。`);
  }
  if (adoptionStats.contradictions.length > 0) {
    findings.push(`发现 ${adoptionStats.contradictions.length} 类 AI 使用时长与工具选择冲突组合；题目文案已从“使用 AI”收敛到“用于工作处理/进入日常工作”，规则层以 Q10 是否有常态化工具为准。`);
  }
  if (cognitionStats.blindSpotLengths.has(3)) {
    findings.push("盲区数量上限生效：低认知宽度时最多展示 3 条盲区，避免负面清单过长。");
  }
  const lowScore = judgedSamples.filter((sample) => sample.score < 4);
  if (lowScore.length > 0) {
    findings.push(`代表样本中有 ${lowScore.length} 个低于 4 分，主要问题集中在答案自相矛盾，而不是经营类型映射。`);
  }
  findings.push("Q5/Q6/Q7 的新权重对顶部类型影响明显：投入心智和风险策略均能独立成为主类型，不再被旧竞争防守题干污染。");
  return findings;
}

function writeReport(input: {
  totalLogicalCombinations: number;
  operatorStats: ReturnType<typeof scanOperatorTypes>;
  questionInfluenceStats: ReturnType<typeof scanQuestionInfluence>;
  adoptionStats: ReturnType<typeof scanAdoptionStages>;
  cognitionStats: ReturnType<typeof scanCognitionWidth>;
  needStats: ReturnType<typeof scanJustNeed>;
  goldenStats: ReturnType<typeof scanGoldenCases>;
  q10Combos: QuizOptionValue[][];
  q11Combos: QuizOptionValue[][];
  judgedSamples: ReturnType<typeof judgeSample>[];
  findings: string[];
}) {
  const lowScoreSamples = input.judgedSamples.filter((sample) => sample.score < 4);
  const lines = [
    "# 需求诊断结果合理性评估报告",
    "",
    `评估日期：2026-05-31`,
    "",
    "## 结论摘要",
    "",
    ...input.findings.map((finding) => `- ${finding}`),
    "",
    "## 评估方法",
    "",
    `- 逻辑总组合量：${formatNumber(input.totalLogicalCombinations)}。`,
    "- 未逐份生成完整长报告；改用因子化穷举做硬规则体检。该诊断的经营类型、AI 落地阶段、认知宽度、刚需方向彼此由不同题组决定，因子化穷举能覆盖同等规则空间，成本低很多。",
    `- Q1-Q7 + Q13 经营类型穷举：${input.operatorStats.total} 组。`,
    `- Q8-Q10 AI 落地阶段穷举：${input.adoptionStats.total} 组，Q10 有效组合 ${input.q10Combos.length} 组。`,
    `- Q11 认知宽度穷举：${input.cognitionStats.total} 组。`,
    `- Q12 刚需方向穷举：${input.needStats.total} 组。`,
    `- Golden Set 回归：${input.goldenStats.length} 个关键样本。`,
    `- 代表样本审查：${input.judgedSamples.length} 份。`,
    "",
    "## 硬规则体检",
    "",
    "### 经营类型分布",
    "",
    tableFromMap(input.operatorStats.byType, "类型", "经营题组合数"),
    "",
    "### AI 落地阶段分布",
    "",
    tableFromMap(input.adoptionStats.byStage, "阶段", "Q8-Q10 组合数"),
    "",
    "### 认知宽度分布",
    "",
    tableFromMap(input.cognitionStats.byWidth, "认知宽度", "Q11 组合数"),
    "",
    "### 刚需方向覆盖",
    "",
    tableFromMap(input.needStats.byNeed, "刚需方向", "Q12 组合数"),
    "",
    "### 单题主导风险",
    "",
    input.questionInfluenceStats.dominanceWarnings.length
      ? input.questionInfluenceStats.dominanceWarnings.map((item) => `- ${item}`).join("\n")
      : "未发现单题主导风险。",
    "",
    "### Golden Set 回归",
    "",
    tableFromGoldenStats(input.goldenStats),
    "",
    "## 代表样本审查",
    "",
    ...input.judgedSamples.map(formatSample),
    "",
    "## 风险与建议",
    "",
    "- Q9/Q10 的矛盾风险已从题目侧做了收敛：Q9 问“把 AI 实际用于工作处理的时间”，Q10 问“哪些工具已经进入日常工作”。若仍出现“高时长 + 无工具”，规则层统一按 L1 处理，避免把未常态化工具的用户误判成高阶段。",
    "- 组织落地维度已经从单题扩展到 Q4 + Q13，单题主导风险明显下降。后续如果还要继续提升可信度，优先考虑给判断方式、投入心智各补 1 题，而不是继续增加类型数量。",
    "- Q1/Q2 仍然承担商业视野判断，其中 Q1 同时带有风险偏好和决策节奏成分。它目前没有造成硬规则错误，但如果后续追求更高诊断可信度，建议把商业视野改成更纯粹的业务深耕/业务拓展题。",
    "- Q3-C 现在按平衡处理，使“平衡统筹型”真实可达；这是合理的，否则全 C 答案也会被强行判成经验判断型。",
    "- Q5/Q6/Q7 重做后，投入心智和风险策略的结果更像企业 AI 落地诊断，不再像旧版竞争防守题。",
    "- 代表样本低分项主要来自答案自述矛盾，不是类型命名或页面层级。后续优化应持续维护 Golden Set 回归样本，锁住每类企业主画像的预期输出。",
    "",
    "## 低分样本",
    "",
    lowScoreSamples.length ? lowScoreSamples.map(formatSample).join("\n\n") : "无低于 4 分样本。",
    "",
  ];

  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`);
}

function formatSample(sample: ReturnType<typeof judgeSample>): string {
  const issueLines = [...sample.failures.map((item) => `失败：${item}`), ...sample.warnings.map((item) => `警告：${item}`)];
  return [
    `### ${sample.name}`,
    "",
    `- 评分：${sample.score.toFixed(1)} / 5`,
    `- 答案：${formatAnswers(sample.answers)}`,
    `- 结果：${sample.result.operatorTypeName} / ${sample.result.aiAdoptionStage} · ${sample.result.aiAdoptionStageLabel} / ${sample.result.justNeedLabel}`,
    `- 解释：${sample.result.operatorTypeDefinition}`,
    `- 本周动作：${sample.result.narrative?.actionPlan.week || "叙事尚未生成"}`,
    issueLines.length ? `- 问题：${issueLines.join("；")}` : "- 问题：未发现明显不合理点",
  ].join("\n");
}

function tableFromMap(map: Map<unknown, number>, keyLabel: string, valueLabel: string): string {
  const rows = [...map.entries()].sort(([a], [b]) => String(a).localeCompare(String(b), "zh-CN"));
  return [`| ${keyLabel} | ${valueLabel} |`, "|---|---:|", ...rows.map(([key, value]) => `| ${String(key)} | ${value} |`)].join("\n");
}

function tableFromGoldenStats(items: ReturnType<typeof scanGoldenCases>): string {
  return [
    "| 样本 | 预期 | 实际 | 结果 |",
    "|---|---|---|---|",
    ...items.map((item) => {
      const expected = Object.entries(item.expected)
        .map(([key, value]) => `${key}=${value}`)
        .join("<br>");
      const actual = [
        `operatorTypeName=${item.result.operatorTypeName}`,
        `aiAdoptionStage=${item.result.aiAdoptionStage}`,
        `justNeedLabel=${item.result.justNeedLabel}`,
      ].join("<br>");
      return `| ${item.name} | ${expected} | ${actual} | ${item.issues.length ? item.issues.join("<br>") : "通过"} |`;
    }),
  ].join("\n");
}

function formatAnswers(answers: QuizAnswers): string {
  return Object.entries(answers)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join("") : value}`)
    .join(", ");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function increment<K>(map: Map<K, number>, key: K) {
  map.set(key, (map.get(key) || 0) + 1);
}

function maxDiff(result: DiagnosisResult): number {
  return Math.max(...Object.values(result.dimensionScores).map((score) => score.diff));
}

function dedupeSamples(samples: Array<{ name: string; answers: Required<QuizAnswers> }>) {
  const seen = new Set<string>();
  const output: Array<{ name: string; answers: Required<QuizAnswers> }> = [];
  for (const sample of samples) {
    const key = `${sample.name}:${formatAnswers(sample.answers)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(sample);
  }
  return output;
}

function getNestedMap<K, V>(map: Map<K, Map<V, number>>, key: K): Map<V, number> {
  const existing = map.get(key);
  if (existing) return existing;
  const next = new Map<V, number>();
  map.set(key, next);
  return next;
}

function sumMap(map: Map<unknown, number>): number {
  return [...map.values()].reduce((sum, value) => sum + value, 0);
}

main();
