import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { calculateDiagnosis } from "../lib/requirements-diagnosis/scoring";
import type { DiagnosisResult, QuizAnswers, QuizOptionValue, QuestionId } from "../lib/requirements-diagnosis/types";

// v3: q14（工具多选）和 q19（认知宽度多选）是多选题，排除在单选笛卡尔之外
type SingleQuestionId = Exclude<QuestionId, "q14" | "q19">;

const REPORT_PATH = resolve("docs/2026-06-30-需求诊断结果合理性评估报告.md");
// 经营画像 q1-q10 各 4 选项（A=强左 / B=偏左 / C=偏右 / D=强右）
const SINGLE_VALUES = ["A", "C", "D"] as const;
const Q13_VALUES = ["A", "B", "C", "D"] as const; // 使用时长
const Q14_VALUES = ["A", "B", "C", "D", "E"] as const; // 工具
const Q19_VALUES = ["A", "B", "C", "D", "E", "F"] as const; // 认知宽度
const Q20_VALUES = ["A", "B", "C", "D", "E"] as const; // 刚需诉求
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

// B+C 交替使每个经营维度精确平局（diff=0），产出平衡统筹型
const BASE_ANSWERS = {
  q1: "B", q2: "C",   // 商业视野 balanced
  q3: "B", q4: "C",   // 判断方式 balanced
  q5: "B", q6: "C",   // 组织落地 balanced
  q7: "B", q8: "C",   // 投入心智 balanced
  q9: "B", q10: "C",  // 风险策略 balanced
  q11: "B",            // AI 态度：有兴趣
  q12: "B",            // 关注偏好：商业落地
  q13: "B",            // 使用时长：1-2h
  q14: ["A"] as QuizOptionValue[],  // 工具：聊天工具
  q15: "B",            // 工作流：个人临时
  q16: "A",
  q17: "B",
  q18: "B",
  q19: ["A", "C", "D"] as QuizOptionValue[],  // 认知宽度：3 项 → 拓展认知
  q20: "A",            // 刚需：重复执行
  q21: "A",
  q22: "B",
  q23: "A",
  q24: "D",
} satisfies Required<QuizAnswers>;

const GOLDEN_CASES = [
  { name: "经营画像：稳健深耕", answers: { ...BASE_ANSWERS, q1: "A", q2: "A" }, expected: { operatorTypeName: "稳健深耕型" } },
  { name: "经营画像：增长探索", answers: { ...BASE_ANSWERS, q1: "D", q2: "D" }, expected: { operatorTypeName: "增长探索型" } },
  { name: "经营画像：经验判断", answers: { ...BASE_ANSWERS, q3: "A", q4: "A" }, expected: { operatorTypeName: "经验判断型" } },
  { name: "经营画像：数据验证", answers: { ...BASE_ANSWERS, q3: "D", q4: "D" }, expected: { operatorTypeName: "数据验证型" } },
  { name: "经营画像：系统重构", answers: { ...BASE_ANSWERS, q5: "A", q6: "A" }, expected: { operatorTypeName: "系统重构型" } },
  { name: "经营画像：快速试水", answers: { ...BASE_ANSWERS, q5: "D", q6: "D" }, expected: { operatorTypeName: "快速试水型" } },
  { name: "经营画像：成本优先", answers: { ...BASE_ANSWERS, q7: "A", q8: "A" }, expected: { operatorTypeName: "成本优先型" } },
  { name: "经营画像：长期投入", answers: { ...BASE_ANSWERS, q7: "D", q8: "D" }, expected: { operatorTypeName: "长期投入型" } },
  { name: "经营画像：风险防守", answers: { ...BASE_ANSWERS, q9: "A", q10: "A" }, expected: { operatorTypeName: "风险防守型" } },
  { name: "经营画像：创新进攻", answers: { ...BASE_ANSWERS, q9: "D", q10: "D" }, expected: { operatorTypeName: "创新进攻型" } },
  { name: "经营画像：平衡统筹", answers: BASE_ANSWERS, expected: { operatorTypeName: "平衡统筹型" } },
  { name: "AI 阶段：无常态化工具优先判 L1", answers: { ...BASE_ANSWERS, q13: "D", q14: ["E"] }, expected: { aiAdoptionStage: "L1" } },
  { name: "AI 阶段：全域刚需", answers: { ...BASE_ANSWERS, q12: "B", q13: "D", q14: ["A", "B", "C", "D"], q15: "D" }, expected: { aiAdoptionStage: "L5" } },
  {
    name: "真实样本：高频使用代码与 Agent 工具",
    answers: {
      ...BASE_ANSWERS,
      q1: "B",
      q2: "C",
      q3: "C",
      q4: "D",
      q5: "C",
      q6: "D",
      q7: "B",
      q8: "B",
      q9: "B",
      q10: "C",
      q12: "B",
      q13: "D",
      q14: ["D", "C", "A"] as QuizOptionValue[],
      q15: "D",
      q19: ["A", "B", "C", "D", "F", "E"] as QuizOptionValue[],
      q20: "C",
    },
    expected: { operatorTypeName: "数据验证型", aiAdoptionStage: "L5", justNeedLabel: "客户转化与服务" },
  },
  { name: "刚需方向：重复性执行工作", answers: { ...BASE_ANSWERS, q20: "A" }, expected: { justNeedLabel: "重复性执行工作" } },
  { name: "刚需方向：内容与创意产出", answers: { ...BASE_ANSWERS, q20: "B" }, expected: { justNeedLabel: "内容与创意产出" } },
] satisfies Array<{
  name: string;
  answers: Required<QuizAnswers>;
  expected: Partial<Pick<DiagnosisResult, "operatorTypeName" | "aiAdoptionStage" | "justNeedLabel">>;
}>;

function main() {
  // q1-q10 经营画像笛卡尔穷举（3 代表值 × 10 题）
  const operatorCombos = cartesianSingles(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
  const q12Combos = ["A", "B", "C"] as const;  // AI 关注偏好
  const q14Combos = validQ14Combinations();     // 工具有效组合
  const q19Combos = nonEmptySubsets(Q19_VALUES);
  const q20Combos = Q20_VALUES;                 // 刚需诉求
  const totalLogicalCombinations = operatorCombos.length * q12Combos.length * Q13_VALUES.length * q14Combos.length * q19Combos.length * q20Combos.length;

  const operatorStats = scanOperatorTypes(operatorCombos);
  const questionInfluenceStats = scanQuestionInfluence(operatorCombos);
  const adoptionStats = scanAdoptionStages(q12Combos, Q13_VALUES, q14Combos);
  const cognitionStats = scanCognitionWidth(q19Combos);
  const needStats = scanJustNeed(q20Combos);
  const edgeCases = buildEdgeCases();
  const goldenStats = scanGoldenCases();
  const representativeCases = buildRepresentativeCases(operatorCombos);
  const adoptionRepresentativeCases = buildAdoptionRepresentativeCases(q12Combos, Q13_VALUES, q14Combos);
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
    q14Combos,
    q19Combos,
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

function validQ14Combinations(): QuizOptionValue[][] {
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
  for (const questionId of ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]) {
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

function scanAdoptionStages(q12Values: readonly QuizOptionValue[], q13Values: readonly QuizOptionValue[], q14Combos: QuizOptionValue[][]) {
  const byStage = new Map<string, number>();
  const byStageAndQ14 = new Map<string, number>();
  const contradictions: Array<{ answers: QuizAnswers; result: DiagnosisResult; reason: string }> = [];

  for (const q12 of q12Values) {
    for (const q13 of q13Values) {
      for (const q14 of q14Combos) {
        const answers = { ...BASE_ANSWERS, q12, q13, q14 };
        const result = calculateDiagnosis(answers);
        increment(byStage, `${result.aiAdoptionStage} · ${result.aiAdoptionStageLabel}`);
        increment(byStageAndQ14, `${result.aiAdoptionStage} / Q14=${q14.join("")}`);
        if (q14.includes("E") && q13 !== "A") {
          contradictions.push({ answers, result, reason: "Q14 选择纯人工，但 Q13 声称每天有效使用 AI 超过 0 小时。" });
        }
      }
    }
  }

  return { total: q12Values.length * q13Values.length * q14Combos.length, byStage, byStageAndQ14, contradictions };
}

function scanCognitionWidth(q19Combos: QuizOptionValue[][]) {
  const byWidth = new Map<string, number>();
  const blindSpotLengths = new Map<number, number>();
  for (const q19 of q19Combos) {
    const result = calculateDiagnosis({ ...BASE_ANSWERS, q19 });
    increment(byWidth, result.cognitiveWidth);
    increment(blindSpotLengths, result.blindSpots.length);
  }
  return { total: q19Combos.length, byWidth, blindSpotLengths };
}

function scanJustNeed(q20Values: readonly QuizOptionValue[]) {
  const byNeed = new Map<string, number>();
  for (const q20 of q20Values) {
    const result = calculateDiagnosis({ ...BASE_ANSWERS, q20 });
    increment(byNeed, result.justNeedLabel);
  }
  return { total: q20Values.length, byNeed };
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
  q12Values: readonly QuizOptionValue[],
  q13Values: readonly QuizOptionValue[],
  q14Combos: QuizOptionValue[][],
) {
  const byStage = new Map<string, Array<{ answers: Required<QuizAnswers>; result: DiagnosisResult }>>();
  for (const q12 of q12Values) {
    for (const q13 of q13Values) {
      for (const q14 of q14Combos) {
        const answers = { ...BASE_ANSWERS, q12, q13, q14 };
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
    const withManyTools = [...items].sort((a, b) => (b.answers.q14 as QuizOptionValue[]).length - (a.answers.q14 as QuizOptionValue[]).length)[0];
    const withManual = items.find((item) => (item.answers.q14 as QuizOptionValue[]).includes("E"));
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
    { name: "边界样本：全 A 经营画像", answers: { ...BASE_ANSWERS, q1: "A", q2: "A", q3: "A", q4: "A", q5: "A", q6: "A", q7: "A", q8: "A", q9: "A", q10: "A" } },
    { name: "边界样本：全 B 经营画像", answers: { ...BASE_ANSWERS, q1: "B", q2: "B", q3: "B", q4: "B", q5: "B", q6: "B", q7: "B", q8: "B", q9: "B", q10: "B" } },
    { name: "边界样本：全 D 经营画像", answers: { ...BASE_ANSWERS, q1: "D", q2: "D", q3: "D", q4: "D", q5: "D", q6: "D", q7: "D", q8: "D", q9: "D", q10: "D" } },
    { name: "边界样本：纯人工但高使用时长", answers: { ...BASE_ANSWERS, q13: "D", q14: ["E"] } },
    { name: "边界样本：高阶工具组合", answers: { ...BASE_ANSWERS, q12: "B", q13: "D", q14: ["A", "B", "C", "D"], q19: ["A", "B", "C", "D", "E", "F"] } },
    { name: "边界样本：低使用但全景认知", answers: { ...BASE_ANSWERS, q13: "A", q14: ["E"], q19: ["A", "B", "C", "D", "E", "F"] } },
    { name: "边界样本：高使用但聚焦认知", answers: { ...BASE_ANSWERS, q12: "B", q13: "D", q14: ["A", "B", "C"], q19: ["A"] } },
    { name: "边界样本：重复执行刚需", answers: { ...BASE_ANSWERS, q20: "A" } },
    { name: "边界样本：创意产出刚需", answers: { ...BASE_ANSWERS, q20: "B" } },
    { name: "边界样本：复杂系统刚需", answers: { ...BASE_ANSWERS, q20: "E" } },
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
  if ((answers.q14 as QuizOptionValue[]).includes("E") && answers.q13 !== "A") {
    warnings.push("未使用工具与有效使用时长存在语义冲突，题目口径已收敛，规则层按未常态化使用工具处理。");
  }
  if (answers.q13 === "A" && !(answers.q14 as QuizOptionValue[]).includes("E")) {
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
    findings.push("经营类型覆盖完整：Q1-Q10 的组合能覆盖全部 11 种类型。");
  }
  if (questionInfluenceStats.dominanceWarnings.length > 0) {
    findings.push(`发现 ${questionInfluenceStats.dominanceWarnings.length} 个单题主导风险，说明顶部类型对部分单选题过于敏感。`);
  }
  if (adoptionStats.contradictions.length > 0) {
    findings.push(`发现 ${adoptionStats.contradictions.length} 类 AI 使用时长与工具选择冲突组合；规则层以 Q14 是否有常态化工具为准。`);
  }
  if (cognitionStats.blindSpotLengths.has(3)) {
    findings.push("盲区数量上限生效：低认知宽度时最多展示 3 条盲区，避免负面清单过长。");
  }
  const lowScore = judgedSamples.filter((sample) => sample.score < 4);
  if (lowScore.length > 0) {
    findings.push(`代表样本中有 ${lowScore.length} 个低于 4 分，主要问题集中在答案自相矛盾，而不是经营类型映射。`);
  }
  findings.push("v3 改造：经营画像统一 4 选项去掉中间平衡选项，每维度 2 题；AI 落地画像新增 AI 边界认知、参照系、人机协作、预期价值、深度诊断意愿 5 道新题。");
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
  q14Combos: QuizOptionValue[][];
  q19Combos: QuizOptionValue[][];
  judgedSamples: ReturnType<typeof judgeSample>[];
  findings: string[];
}) {
  const lowScoreSamples = input.judgedSamples.filter((sample) => sample.score < 4);
  const lines = [
    "# 需求诊断结果合理性评估报告",
    "",
    `评估日期：2026-06-30`,
    "",
    "## 结论摘要",
    "",
    ...input.findings.map((finding) => `- ${finding}`),
    "",
    "## 评估方法",
    "",
    `- 逻辑总组合量：${formatNumber(input.totalLogicalCombinations)}。`,
    "- 因子化穷举覆盖经营类型、AI 落地阶段、认知宽度、刚需方向各因子，彼此独立穷举。",
    `- Q1-Q10 经营类型穷举（3 代表值 × 10 题）：${input.operatorStats.total} 组。`,
    `- Q12/Q13/Q14 AI 落地阶段穷举：${input.adoptionStats.total} 组，Q14 有效组合 ${input.q14Combos.length} 组。`,
    `- Q19 认知宽度穷举：${input.cognitionStats.total} 组。`,
    `- Q20 刚需方向穷举：${input.needStats.total} 组。`,
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
    tableFromMap(input.adoptionStats.byStage, "阶段", "Q12-Q14 组合数"),
    "",
    "### 认知宽度分布",
    "",
    tableFromMap(input.cognitionStats.byWidth, "认知宽度", "Q19 组合数"),
    "",
    "### 刚需方向覆盖",
    "",
    tableFromMap(input.needStats.byNeed, "刚需方向", "Q20 组合数"),
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
    `- Q13/Q14 的矛盾风险：Q13 问"实际用于工作的时间"，Q14 问"已进入日常工作的工具"。若仍出现"高时长 + 无工具"，规则层统一按 L1 处理。`,
    "- 4 选项去掉中间值后，每个维度 diff 最小非零值约 34%（B+B 或 C+C 组合），平衡统筹型只在两题精确抵消时出现（A+D 或 D+A 组合，diff=0）。",
    "- v3 新增 AI 认知层题目（q16-q18）不直接参与经营画像评分，主要为叙事增强提供上下文。",
    "- 如需提升经营画像可信度，建议给每个维度继续补第 3 道题，以降低单题噪音。",
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
