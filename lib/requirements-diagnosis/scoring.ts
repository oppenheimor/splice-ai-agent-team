import { quizQuestions } from "./quiz";
import type {
  DiagnosisNarrative,
  DiagnosisResult,
  DimensionCode,
  DimensionScore,
  QuizAnswerValue,
  QuizAnswers,
  QuizOptionValue,
  QuestionId,
} from "./types";

type RawDimensionScore = {
  left: number;
  right: number;
};

type DimensionConfig = {
  code: DimensionCode;
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftLetter: string;
  rightLetter: string;
  questions: QuestionId[];
};

const dimensionConfigs: DimensionConfig[] = [
  { code: "V", label: "商业视野", leftLabel: "深耕", rightLabel: "拓展", leftLetter: "D", rightLetter: "E", questions: ["q1", "q2"] },
  { code: "D", label: "判断方式", leftLabel: "经验判断", rightLabel: "数据验证", leftLetter: "G", rightLetter: "P", questions: ["q3"] },
  { code: "E", label: "组织落地", leftLabel: "系统重构", rightLabel: "快速试水", leftLetter: "R", rightLetter: "A", questions: ["q4", "q13"] },
  { code: "A", label: "投入心智", leftLabel: "成本优先", rightLabel: "长期投入", leftLetter: "C", rightLetter: "L", questions: ["q5"] },
  { code: "B", label: "风险策略", leftLabel: "风险防守", rightLabel: "创新进攻", leftLetter: "S", rightLetter: "I", questions: ["q6", "q7"] },
];

const userTypeMap = {
  A: { code: "TE", label: "技术探索者", english: "Tech Explorer" },
  B: { code: "EP", label: "企业家实用派", english: "Entrepreneurial Pragmatist" },
  C: { code: "AP", label: "应用实践者", english: "Application Practitioner" },
} as const;

const justNeedMap = {
  A: "重复性机械工作",
  B: "创意产出工作",
  C: "复杂系统工作",
} as const;

const q11BlindSpotMap = {
  A: "让 AI 接住资料整理、邮件处理和通用方案初稿，省下你的基础执行时间",
  B: "让 AI 承担内容创作和宣传素材，把灵感变成稳定产能",
  C: "让 AI 做市场调研、竞品分析和数据整理，减少拍脑袋决策",
  D: "让 AI 参与客服、私域和社群运营，让服务响应更稳定",
  E: "让 AI 管理订单、库存和排期，把零散流程接成系统",
  F: "让 AI 辅助商业方向、产品选择和定价策略，补上决策推演层",
} as const;

const operatorTypeMap: Record<string, { name: string; definition: string; trait: string }> = {
  D: { name: "稳健深耕型", trait: "深耕", definition: "更适合先在熟悉业务里找 AI 提效点，不急着跨领域扩张。" },
  E: { name: "增长探索型", trait: "拓展", definition: "对新机会敏感，适合用 AI 快速验证新渠道、新产品或新业务线。" },
  G: { name: "经验判断型", trait: "经验判断", definition: "决策依赖经验和商业直觉，AI 应先作为信息补充和复盘工具。" },
  P: { name: "数据验证型", trait: "数据验证", definition: "重视拆解、数据和可复制性，适合从流程指标和自动化看板切入。" },
  R: { name: "系统重构型", trait: "系统重构", definition: "倾向重建流程和组织能力，适合规划跨部门 AI 工作流。" },
  A: { name: "快速试水型", trait: "快速试水", definition: "愿意先跑 MVP，用小试点换反馈，适合轻量工具和短周期实验。" },
  C: { name: "成本优先型", trait: "成本优先", definition: "投入前先看 ROI，适合从降本、节省人力、减少重复劳动切入。" },
  L: { name: "长期投入型", trait: "长期投入", definition: "能接受阶段性投入，适合建设模板、数据资产和可复用系统。" },
  S: { name: "风险防守型", trait: "风险防守", definition: "关注稳定和边界，适合低风险场景、权限清晰、可控试点。" },
  I: { name: "创新进攻型", trait: "创新进攻", definition: "愿意主动试错，适合探索新获客、内容、产品或交付模式。" },
  VB: { name: "平衡统筹型", trait: "平衡统筹", definition: "各维度没有明显极端倾向，适合先明确业务优先级，再选 AI 切入点。" },
};

const operatorTieBreakPriority: DimensionCode[] = ["E", "A", "B", "D", "V"];

export function normalizeQuizAnswers(input: QuizAnswers): Required<QuizAnswers> {
  const normalized: Partial<Record<QuestionId, QuizAnswerValue>> = {};

  for (const question of quizQuestions) {
    const answer = input[question.id];
    if (question.type === "multiple") {
      const values = Array.isArray(answer) ? answer.filter((value) => hasOption(question.id, value)) : [];
      if (values.length === 0) {
        throw new Error(`MISSING_${question.id.toUpperCase()}`);
      }
      if (question.id === "q10" && values.includes("E")) {
        normalized[question.id] = ["E"];
        continue;
      }
      normalized[question.id] = [...new Set(values)] as QuizOptionValue[];
      continue;
    }

    if (!answer || Array.isArray(answer) || !hasOption(question.id, answer)) {
      throw new Error(`MISSING_${question.id.toUpperCase()}`);
    }

    normalized[question.id] = answer;
  }

  return normalized as Required<QuizAnswers>;
}

export function calculateDiagnosis(input: QuizAnswers): DiagnosisResult {
  const answers = normalizeQuizAnswers(input);
  const dimensionScores = calculateDimensionScores(answers);
  const featureCode = buildFeatureCode(Object.values(dimensionScores));
  const userType = userTypeMap[answers.q8 as "A" | "B" | "C"];
  const operatorCode = `${featureCode}-${userType.code}`;
  const operatorType = buildOperatorType(Object.values(dimensionScores), featureCode);
  const aiAdoptionStage = calculateAiAdoptionStage(answers);
  const aiAdoptionStageLabel = aiAdoptionStageLabels[aiAdoptionStage];
  const selectedCognition = answers.q11 as QuizOptionValue[];
  const cognitiveWidth = calculateCognitiveWidth(selectedCognition.length);
  const blindSpots = buildBlindSpots(selectedCognition);
  const justNeedLabel = justNeedMap[answers.q12 as "A" | "B" | "C"];
  const crowdType = calculateCrowdType(userType.code, aiAdoptionStage);
  const recommendation = buildRecommendation(userType.code, aiAdoptionStage);

  return {
    answers,
    dimensionScores,
    featureCode,
    operatorCode,
    operatorTypeName: operatorType.name,
    operatorTypeDefinition: operatorType.definition,
    operatorType,
    aiAdoptionStage,
    aiAdoptionStageLabel,
    userType: userType.code,
    userTypeLabel: userType.label,
    cognitiveWidth,
    blindSpots,
    justNeed: String(answers.q12),
    justNeedLabel,
    crowdType,
    recommendation,
    narrative: buildFallbackNarrative(Object.values(dimensionScores), operatorType.name, justNeedLabel),
  };
}

export function mergeNarrative(base: DiagnosisResult, narrative: Partial<DiagnosisNarrative> | null | undefined): DiagnosisResult {
  if (!narrative) return base;
  return {
    ...base,
    narrative: {
      actionInsights: narrative.actionInsights?.length ? narrative.actionInsights : base.narrative.actionInsights,
      actionPlan: {
        ...base.narrative.actionPlan,
        ...narrative.actionPlan,
      },
      closing: {
        ...base.narrative.closing,
        ...narrative.closing,
      },
    },
  };
}

function calculateDimensionScores(answers: Required<QuizAnswers>): Record<DimensionCode, DimensionScore> {
  const entries = dimensionConfigs.map((config) => {
    const raw = config.questions.reduce<RawDimensionScore>(
      (score, questionId) => {
        const contribution = scoreQuestion(questionId, answers[questionId] as QuizOptionValue);
        return { left: score.left + contribution.left, right: score.right + contribution.right };
      },
      { left: 0, right: 0 },
    );
    const total = config.questions.length;
    const left = Math.round((raw.left / total) * 100);
    const right = Math.round((raw.right / total) * 100);
    const diff = Math.abs(left - right);
    const dominantSide = getDominantSide(left, right, diff);

    return [
      config.code,
      {
        ...config,
        left,
        right,
        diff,
        dominantLetter: getDominantLetter(config, dominantSide),
        dominantLabel: getDominantLabel(config, dominantSide),
        stars: getStars(diff),
      },
    ];
  });

  return Object.fromEntries(entries) as unknown as Record<DimensionCode, DimensionScore>;
}

function getDominantSide(left: number, right: number, diff: number): "left" | "right" | "balanced" {
  // 偏差小于 20% 时按“平衡”处理，不把微弱差异误判成经营主导倾向。
  if (diff < 20) return "balanced";
  return left >= right ? "left" : "right";
}

function getDominantLetter(config: DimensionConfig, dominantSide: "left" | "right" | "balanced"): string {
  if (dominantSide === "balanced") return "B";
  if (dominantSide === "left") return config.leftLetter;
  return config.rightLetter;
}

function getDominantLabel(config: DimensionConfig, dominantSide: "left" | "right" | "balanced"): string {
  if (dominantSide === "balanced") return "平衡";
  if (dominantSide === "left") return config.leftLabel;
  return config.rightLabel;
}

function scoreQuestion(questionId: QuestionId, answer: QuizOptionValue): RawDimensionScore {
  if (answer === "A") return { left: 1, right: 0 };
  if (answer === "B") return { left: 0, right: 1 };
  if (answer === "C") return { left: 0.5, right: 0.5 };
  return { left: 0, right: 0 };
}

function buildFeatureCode(scores: DimensionScore[]): string {
  // 经营代码保留 top2 倾向，标题展示只取主倾向，避免组合名难以理解。
  const prominent = scores
    .filter((score) => score.diff >= 20)
    .sort((a, b) => b.diff - a.diff);

  if (prominent.length === 0) return "VB";
  if (prominent.length === 1) return prominent[0].dominantLetter.repeat(2);
  return prominent.slice(0, 2).map((score) => score.dominantLetter).join("");
}

function calculateAiAdoptionStage(answers: Required<QuizAnswers>): string {
  const q8 = answers.q8;
  const q9 = answers.q9;
  const q10 = new Set(answers.q10 as QuizOptionValue[]);
  const toolCount = q10.size;
  const hasChatTool = q10.has("A");
  const hasBuilderTool = q10.has("B");
  const hasCodeTool = q10.has("C");
  const hasAgentTool = q10.has("D");
  const hasAdvancedTool = hasBuilderTool || hasCodeTool || hasAgentTool;
  const hasHighIntensityUsage = q9 === "C" || q9 === "D";

  if (q10.has("E")) return "L1";

  // L5 判断不能只依赖低代码工具：代码类和 Agent 类工具代表更强的系统化落地能力。
  if (q8 === "B" && hasHighIntensityUsage && hasChatTool && hasAdvancedTool && toolCount >= 3) return "L5";
  if (hasHighIntensityUsage && hasAdvancedTool) return "L4";
  if ((q9 === "B" || q9 === "C") && hasChatTool) return "L3";
  if ((q9 === "A" || q9 === "B") && hasChatTool) return "L2";
  if (q9 === "A" && (q10.has("D") || q10.size === 0)) return "L1";
  return "L2";
}

function calculateCognitiveWidth(count: number): string {
  if (count >= 5) return "全景认知";
  if (count >= 3) return "拓展认知";
  return "聚焦认知";
}

function buildBlindSpots(selected: QuizOptionValue[]): string[] {
  if (selected.length >= 5) return [];
  const selectedSet = new Set(selected);
  // 盲区只取前三个未选方向，避免把结果页变成“你没做到什么”的负面清单。
  return (Object.keys(q11BlindSpotMap) as Array<keyof typeof q11BlindSpotMap>)
    .filter((key) => !selectedSet.has(key))
    .slice(0, 3)
    .map((key) => q11BlindSpotMap[key]);
}

function calculateCrowdType(userType: "TE" | "EP" | "AP", aiAdoptionStage: string): string {
  if (userType === "TE") return aiAdoptionStage === "L1" || aiAdoptionStage === "L2" ? "技术敏感型经营者" : "技术驱动型经营者";
  if (userType === "EP" && aiAdoptionStage === "L5") return "全域刚需企业决策人";
  if (userType === "EP" && aiAdoptionStage === "L4") return "有基础遇瓶颈企业主";
  if (userType === "EP") return "浅层企业家实用派";
  if (userType === "AP") return aiAdoptionStage === "L1" || aiAdoptionStage === "L2" ? "学习转型型经营者" : "实践升级型经营者";
  return "企业家实用派";
}

function buildOperatorType(scores: DimensionScore[], featureCode: string): DiagnosisResult["operatorType"] {
  const prominent = scores.filter((score) => score.diff >= 20);
  if (!prominent.length) {
    const balanced = operatorTypeMap.VB;
    return {
      code: "VB",
      name: balanced.name,
      definition: balanced.definition,
      primaryTrait: balanced.trait,
      secondaryTrait: null,
    };
  }

  const [primary, secondary] = [...prominent].sort(compareOperatorPriority);
  const primaryConfig = operatorTypeMap[primary.dominantLetter] || operatorTypeMap.VB;
  const secondaryTrait = secondary?.dominantLetter ? operatorTypeMap[secondary.dominantLetter]?.trait || secondary.dominantLabel : null;
  const definition = secondaryTrait
    ? `${primaryConfig.definition} 你的辅助倾向是「${secondaryTrait}」，适合把主优势和第二优势组合成一个可落地的小切口。`
    : primaryConfig.definition;

  return {
    code: primary.dominantLetter,
    name: primaryConfig.name,
    definition,
    primaryTrait: primaryConfig.trait,
    secondaryTrait,
  };
}

function compareOperatorPriority(a: DimensionScore, b: DimensionScore): number {
  if (b.diff !== a.diff) return b.diff - a.diff;
  return operatorTieBreakPriority.indexOf(a.code) - operatorTieBreakPriority.indexOf(b.code);
}

function buildRecommendation(userType: "TE" | "EP" | "AP", aiAdoptionStage: string): DiagnosisResult["recommendation"] {
  const tier = getRecommendationTier(aiAdoptionStage);
  const table = {
    TE: {
      low: ["AI创业入门方案", "从技术好奇走向商业验证，先找到一个足够小、足够真实的切入场景。", "领取 AI 创业第一步清单"],
      mid: ["AI创业升级方案", "把散落的工具能力组装成能跑通需求、交付和变现的闭环。", "领取 AI 创业加速路径"],
      high: ["AI创业全链路方案", "从技术底座到商业化落地，设计一条能持续复利的产品化路线。", "领取 AI 创业全链路规划"],
    },
    EP: {
      low: ["企业AI降本清单", "先从重复、耗时、规则明确的环节切入，找到 3 个低风险提效点。", "预约免费诊断"],
      mid: ["企业AI转型路线图", "从单点提效走到流程自动化，再逐步补齐数据、组织和系统能力。", "预约企业 AI 路线图诊断"],
      high: ["企业AI定制方案", "通用工具已经不够，需要结合行业流程和团队结构定制专属方案。", "预约定制方案沟通"],
    },
    AP: {
      low: ["AI学习+就业路线", "先建立稳定的工具使用习惯，再用项目作品证明你的应用能力。", "领取 AI 学习路线图"],
      mid: ["AI职业升级方案", "把现有技能映射到 AI 时代的岗位需求，找到溢价更高的方向。", "领取 AI 职业升级方案"],
      high: ["AI专家变现路径", "把你的工具经验、案例和方法论打包成可交付的服务资产。", "领取 AI 专家变现路径"],
    },
  } as const;
  const [title, description, hook] = table[userType][tier];
  return { title, description, hook };
}

function getRecommendationTier(aiAdoptionStage: string): "low" | "mid" | "high" {
  if (aiAdoptionStage === "L5") return "high";
  if (aiAdoptionStage === "L3" || aiAdoptionStage === "L4") return "mid";
  return "low";
}

function buildFallbackNarrative(scores: DimensionScore[], operatorTypeName: string, justNeedLabel: string): DiagnosisNarrative {
  return {
    actionInsights: scores.map((score) => {
      const lead = score.left >= score.right ? `${score.left}% ${score.leftLabel}` : `${score.right}% ${score.rightLabel}`;
      return `${score.label}呈现 ${lead} 倾向。你已经有清晰的默认判断方式，下一步可以刻意补上「${score.left >= score.right ? score.rightLabel : score.leftLabel}」视角，让决策更稳。`;
    }),
    actionPlan: {
      week: `选一个${justNeedLabel}场景，用 AI 跑完一次从输入到输出的完整流程。`,
      month: "把有效流程沉淀成模板，并记录每次节省的时间、成本或新增产出。",
      ongoing: `围绕「${operatorTypeName}」的优势，把工具使用升级为可复用的方法。`,
    },
    closing: {
      technology: "AI 不只是替你加速，它会放大你原本的判断结构。",
      philosophy: "先看见自己的默认路径，再决定什么时候顺着走、什么时候换一条路。",
      quote: `送给${operatorTypeName}一句话：你不止一种可能，但此刻的选择已经给了你第一张地图。`,
    },
  };
}

function getStars(diff: number): 1 | 2 | 3 {
  if (diff >= 60) return 1;
  if (diff >= 20) return 2;
  return 3;
}

function hasOption(questionId: QuestionId, value: QuizOptionValue): boolean {
  return Boolean(quizQuestions.find((question) => question.id === questionId)?.options.some((option) => option.value === value));
}

const aiAdoptionStageLabels: Record<string, string> = {
  L1: "小白观望层",
  L2: "基础试用层",
  L3: "单点应用层",
  L4: "工具瓶颈层",
  L5: "全域刚需层",
};
