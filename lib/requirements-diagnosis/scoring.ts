import { quizQuestions } from "./quiz";
import type {
  AiBlocker,
  AiConcern,
  AiLandingPreference,
  AiReadinessProfile,
  DiagnosisNarrative,
  DiagnosisResult,
  DimensionCode,
  DimensionScore,
  LandingPriority,
  QuizAnswerValue,
  QuizAnswers,
  QuizOptionValue,
  QuestionId,
  ReadinessAxis,
  ReadinessAxisScore,
} from "./types";

// ─── 经营维度配置 ────────────────────────────────────────────────

type RawDimensionScore = { left: number; right: number };

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
  { code: "V", label: "商业视野", leftLabel: "深耕", rightLabel: "拓展", leftLetter: "D", rightLetter: "E", questions: ["q1", "q2", "q14"] },
  { code: "D", label: "判断方式", leftLabel: "经验判断", rightLabel: "数据验证", leftLetter: "G", rightLetter: "P", questions: ["q3", "q15", "q16"] },
  { code: "E", label: "组织落地", leftLabel: "系统重构", rightLabel: "快速试水", leftLetter: "R", rightLetter: "A", questions: ["q4", "q13", "q17"] },
  { code: "A", label: "投入心智", leftLabel: "成本优先", rightLabel: "长期投入", leftLetter: "C", rightLetter: "L", questions: ["q5", "q18", "q19"] },
  { code: "B", label: "风险策略", leftLabel: "风险防守", rightLabel: "创新进攻", leftLetter: "S", rightLetter: "I", questions: ["q6", "q7", "q20"] },
];

// ─── 用户类型映射 ────────────────────────────────────────────────

const userTypeMap = {
  A: { code: "TE", label: "技术探索者", english: "Tech Explorer" },
  B: { code: "EP", label: "企业家实用派", english: "Entrepreneurial Pragmatist" },
  C: { code: "AP", label: "应用实践者", english: "Application Practitioner" },
} as const;

// ─── AI 刚需方向 ─────────────────────────────────────────────────

const justNeedMap: Record<string, string> = {
  A: "重复性执行工作",
  B: "内容与创意产出",
  C: "客户转化与服务",
  D: "经营分析与决策",
  E: "复杂系统与流程",
};

// ─── AI 认知盲区 ─────────────────────────────────────────────────

const q11BlindSpotMap = {
  A: "让 AI 接住资料整理、邮件处理和通用方案初稿，省下你的基础执行时间",
  B: "让 AI 承担内容创作和宣传素材，把灵感变成稳定产能",
  C: "让 AI 做市场调研、竞品分析和数据整理，减少拍脑袋决策",
  D: "让 AI 参与客服、私域和社群运营，让服务响应更稳定",
  E: "让 AI 管理订单、库存和排期，把零散流程接成系统",
  F: "让 AI 辅助商业方向、产品选择和定价策略，补上决策推演层",
} as const;

// ─── 经营人格类型 ─────────────────────────────────────────────────

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

// diff 相同时按此优先级决定主导维度
const operatorTieBreakPriority: DimensionCode[] = ["E", "A", "B", "D", "V"];

// ─── AI 落地阶段标签 ─────────────────────────────────────────────

export const aiAdoptionStageLabels: Record<string, string> = {
  L1: "小白观望层",
  L2: "基础试用层",
  L3: "单点应用层",
  L4: "工具瓶颈层",
  L5: "全域刚需层",
};

// ─── AI 关注偏好 / 落地方式 / 阻力映射 ──────────────────────────

const aiConcernMap: Record<string, AiConcern> = {
  A: { code: "A", label: "技术前沿关注", description: "你更关注 AI 的技术可能性与新能力边界，适合在深度诊断中探讨把技术转化为业务价值的路径。" },
  B: { code: "B", label: "商业落地关注", description: "你更关注 AI 能带来哪些可量化的业务结果，适合在深度诊断中直接聚焦场景 ROI 和交付方案。" },
  C: { code: "C", label: "学习成长关注", description: "你想系统地上手 AI，适合在深度诊断中梳理从工具熟悉到场景落地的完整学习路径。" },
};

const aiLandingPreferenceMap: Record<string, AiLandingPreference> = {
  A: { code: "A", label: "自主上手", description: "你更倾向自己先学会工具，深度诊断适合从工具入门路径和自学资源开始。" },
  B: { code: "B", label: "模板复用", description: "你更倾向套用已验证的做法，深度诊断适合从行业模板和最佳实践案例切入。" },
  C: { code: "C", label: "小流程验证", description: "你更倾向先跑通一个小场景，深度诊断适合直接定位第一个可落地的自动化流程。" },
  D: { code: "D", label: "团队导入", description: "你更倾向团队整体导入，深度诊断适合讨论组织变更和统一工作流设计。" },
  E: { code: "E", label: "定制方案", description: "你更倾向有人帮你对接结果，深度诊断可以直接进入场景定制和方案交付环节。" },
};

const aiBlockerMap: Record<string, AiBlocker> = {
  A: { code: "A", label: "场景不清晰", description: "不知道从哪个业务场景开始——深度诊断会帮你定位 3 个最值得试点的优先场景。" },
  B: { code: "B", label: "方法论缺失", description: "缺少工具方法——深度诊断会梳理适合你现状的工具组合和落地 SOP。" },
  C: { code: "C", label: "数据与流程混乱", description: "现有数据和流程比较混乱——深度诊断会帮你先做最小化梳理，再确定 AI 切入点。" },
  D: { code: "D", label: "团队执行阻力", description: "团队接受度和习惯是瓶颈——深度诊断会讨论如何降低阻力、从最容易接受的环节开始。" },
  E: { code: "E", label: "ROI 不确定", description: "担心投入产出不清晰——深度诊断会帮你建立可量化的验收指标，先跑通最小验证环。" },
};

// ─── AI 落地优先场景 ─────────────────────────────────────────────

const landingPriorityMap: Record<string, LandingPriority> = {
  A: { code: "A", label: "重复执行提效", description: "从规则明确、重复度高的执行类工作入手，是风险最低、见效最快的 AI 切入点。", firstStep: "列出每周最耗时的 3 个重复动作，选最能被 AI 替代的那一个先跑一轮。" },
  B: { code: "B", label: "内容与创意产出", description: "内容创作是 AI 当前落地最成熟的方向之一，适合快速出产品原型和验证效果。", firstStep: "选一种内容类型（如小红书稿/视频脚本），用 AI 跑完从输入到可用草稿的完整流程。" },
  C: { code: "C", label: "客户转化与服务", description: "客服、销售和私域运营是人力密集型场景，AI 能显著提升响应速度和覆盖密度。", firstStep: "梳理一条客户跟进流程，把重复性回复和阶段推进动作提取出来交给 AI 辅助。" },
  D: { code: "D", label: "经营分析与复盘", description: "AI 能大幅降低数据整理和分析的门槛，让经营决策更快有数据支撑。", firstStep: "选一个最常拍脑袋决策的场景，用 AI 帮你先做一版竞品或数据分析。" },
  E: { code: "E", label: "流程自动化", description: "多环节流程自动化是 AI 带来杠杆效应最大的方向，适合有一定组织基础的团队。", firstStep: "选一条从输入到交付有 3 个以上环节的流程，先画出流程图，再逐步引入 AI 节点。" },
};

// ─── 主要导出函数 ─────────────────────────────────────────────────

export function normalizeQuizAnswers(input: QuizAnswers): Required<QuizAnswers> {
  const normalized: Partial<Record<QuestionId, QuizAnswerValue>> = {};

  for (const question of quizQuestions) {
    const answer = input[question.id];
    if (question.type === "multiple") {
      const values = Array.isArray(answer)
        ? answer.filter((v) => hasOption(question.id, v))
        : [];
      if (values.length === 0) throw new Error(`MISSING_${question.id.toUpperCase()}`);
      // q10"还没有任何工具"和其他工具互斥，避免 AI 落地阶段被脏组合误判。
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
  const operatorType = buildOperatorType(Object.values(dimensionScores));
  const aiAdoptionStage = calculateAiAdoptionStage(answers);
  const aiAdoptionStageLabel = aiAdoptionStageLabels[aiAdoptionStage];
  const aiReadiness = buildAiReadiness(answers, aiAdoptionStage);
  const aiConcern = aiConcernMap[answers.q8 as string] || aiConcernMap.B;
  const aiLandingPreference = aiLandingPreferenceMap[answers.q23 as string] || aiLandingPreferenceMap.C;
  const aiBlocker = aiBlockerMap[answers.q24 as string] || aiBlockerMap.A;
  const landingPriority = landingPriorityMap[answers.q12 as string] || landingPriorityMap.A;
  const selectedCognition = answers.q11 as QuizOptionValue[];
  const cognitiveWidth = calculateCognitiveWidth(selectedCognition.length);
  const blindSpots = buildBlindSpots(selectedCognition);
  const justNeedLabel = justNeedMap[answers.q12 as string] || justNeedMap.A;
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
    aiReadiness,
    aiConcern,
    aiLandingPreference,
    aiBlocker,
    landingPriority,
    userType: userType.code,
    userTypeLabel: userType.label,
    cognitiveWidth,
    blindSpots,
    justNeed: String(answers.q12),
    justNeedLabel,
    crowdType,
    recommendation,
    narrative: buildFallbackNarrative(Object.values(dimensionScores), operatorType.name, justNeedLabel, aiReadiness, landingPriority),
  };
}

export function mergeNarrative(
  base: DiagnosisResult,
  narrative: Partial<DiagnosisNarrative> | null | undefined,
): DiagnosisResult {
  if (!narrative) return base;
  return {
    ...base,
    narrative: {
      ...base.narrative,
      actionInsights: narrative.actionInsights?.length ? narrative.actionInsights : base.narrative.actionInsights,
      actionPlan: { ...base.narrative.actionPlan, ...narrative.actionPlan },
      closing: { ...base.narrative.closing, ...narrative.closing },
      ...(narrative.dimensionInsights ? { dimensionInsights: { ...base.narrative.dimensionInsights, ...narrative.dimensionInsights } } : {}),
      ...(narrative.readinessInsights ? { readinessInsights: { ...base.narrative.readinessInsights, ...narrative.readinessInsights } } : {}),
    },
  };
}

// ─── 经营维度评分 ─────────────────────────────────────────────────

function calculateDimensionScores(answers: Required<QuizAnswers>): Record<DimensionCode, DimensionScore> {
  const entries = dimensionConfigs.map((config) => {
    const raw = config.questions.reduce<RawDimensionScore>(
      (acc, qId) => {
        const c = scoreFiveOption(answers[qId] as QuizOptionValue);
        return { left: acc.left + c.left, right: acc.right + c.right };
      },
      { left: 0, right: 0 },
    );
    const total = config.questions.length;
    const left = Math.round((raw.left / total) * 100);
    const right = Math.round((raw.right / total) * 100);
    const diff = Math.abs(left - right);
    const dominantSide = getDominantSide(diff, left, right);
    return [
      config.code,
      {
        ...config,
        left,
        right,
        diff,
        dominantLetter: getDominantLetter(config, dominantSide),
        dominantLabel: getDominantLabel(config, dominantSide),
        // stars 越少代表倾向越强，UI 应标注"倾向强度"语义
        stars: getStars(diff),
      },
    ] as const;
  });

  return Object.fromEntries(entries) as unknown as Record<DimensionCode, DimensionScore>;
}

// 五档映射：A 强左 → E 强右，C 为正中间
function scoreFiveOption(answer: QuizOptionValue): RawDimensionScore {
  if (answer === "A") return { left: 1, right: 0 };
  if (answer === "B") return { left: 0.75, right: 0.25 };
  if (answer === "C") return { left: 0.5, right: 0.5 };
  if (answer === "D") return { left: 0.25, right: 0.75 };
  if (answer === "E") return { left: 0, right: 1 };
  return { left: 0.5, right: 0.5 };
}

// diff < 15% 时按平衡处理（三题取平均后阈值适当收窄）
function getDominantSide(diff: number, left: number, right: number): "left" | "right" | "balanced" {
  if (diff < 15) return "balanced";
  return left >= right ? "left" : "right";
}

function getDominantLetter(config: DimensionConfig, side: "left" | "right" | "balanced"): string {
  if (side === "balanced") return "B";
  return side === "left" ? config.leftLetter : config.rightLetter;
}

function getDominantLabel(config: DimensionConfig, side: "left" | "right" | "balanced"): string {
  if (side === "balanced") return "平衡";
  return side === "left" ? config.leftLabel : config.rightLabel;
}

// 倾向强度：diff 越大星越少（1 星 = 极端显著倾向）
function getStars(diff: number): number {
  if (diff >= 50) return 1;
  if (diff >= 25) return 2;
  if (diff >= 15) return 3;
  return 4;
}

// ─── 经营代码 & 人格 ─────────────────────────────────────────────

function buildFeatureCode(scores: DimensionScore[]): string {
  // 取 diff 最大的两个显著维度，diff 相同时按业务优先级 tie-break
  const prominent = scores
    .filter((s) => s.diff >= 15)
    .sort(compareOperatorPriority);
  if (prominent.length === 0) return "VB";
  if (prominent.length === 1) return prominent[0].dominantLetter.repeat(2);
  return prominent.slice(0, 2).map((s) => s.dominantLetter).join("");
}

function buildOperatorType(scores: DimensionScore[]): DiagnosisResult["operatorType"] {
  const prominent = scores.filter((s) => s.diff >= 15);
  if (!prominent.length) {
    const t = operatorTypeMap.VB;
    return { code: "VB", name: t.name, definition: t.definition, primaryTrait: t.trait, secondaryTrait: null };
  }
  const [primary, secondary] = [...prominent].sort(compareOperatorPriority);
  const primaryCfg = operatorTypeMap[primary.dominantLetter] || operatorTypeMap.VB;
  const secondaryTrait = secondary?.dominantLetter
    ? (operatorTypeMap[secondary.dominantLetter]?.trait ?? secondary.dominantLabel)
    : null;
  const definition = secondaryTrait
    ? `${primaryCfg.definition} 你的辅助倾向是「${secondaryTrait}」，适合把主优势和第二优势组合成一个可落地的小切口。`
    : primaryCfg.definition;
  return { code: primary.dominantLetter, name: primaryCfg.name, definition, primaryTrait: primaryCfg.trait, secondaryTrait };
}

function compareOperatorPriority(a: DimensionScore, b: DimensionScore): number {
  if (b.diff !== a.diff) return b.diff - a.diff;
  return operatorTieBreakPriority.indexOf(a.code) - operatorTieBreakPriority.indexOf(b.code);
}

// ─── AI 落地阶段 ─────────────────────────────────────────────────

function calculateAiAdoptionStage(answers: Required<QuizAnswers>): string {
  const q8 = answers.q8 as string;
  const q9 = answers.q9 as string;
  const q10 = new Set(answers.q10 as QuizOptionValue[]);
  const q22 = answers.q22 as string;

  const hasNoTool = q10.has("E");
  const hasChatTool = q10.has("A");
  const hasBuilderTool = q10.has("B");
  const hasCodeTool = q10.has("C");
  const hasAgentTool = q10.has("D");
  const hasAdvancedTool = hasBuilderTool || hasCodeTool || hasAgentTool;
  const toolCount = hasNoTool ? 0 : q10.size;
  const isHighUsage = q9 === "C" || q9 === "D";
  const isMidUsage = q9 === "B";
  // q22 反映工作流真实融合程度，补充工具数量判断的不足
  const workflowLevel = { A: 0, B: 1, C: 2, D: 3, E: 4 }[q22] ?? 0;

  if (hasNoTool || (q9 === "A" && workflowLevel === 0)) return "L1";

  // L5：高强度使用 + 多种高阶工具 + 工作流真正融合 + 商业结果导向
  if (q8 === "B" && isHighUsage && hasChatTool && hasAdvancedTool && toolCount >= 3 && workflowLevel >= 3) return "L5";
  // L4：高频使用且有高阶工具，但工作流融合不够深
  if (isHighUsage && hasAdvancedTool) return "L4";
  // L3：中频使用 + 有聊天工具 + 工作流已进入固定场景
  if ((isMidUsage || isHighUsage) && hasChatTool && workflowLevel >= 2) return "L3";
  // L2：有聊天工具但使用较浅或工作流融合弱
  if (hasChatTool) return "L2";

  return "L1";
}

// ─── AI 成熟度四轴 ───────────────────────────────────────────────

function buildAiReadiness(answers: Required<QuizAnswers>, stage: string): AiReadinessProfile {
  const attitudeScore = { A: 10, B: 30, C: 55, D: 75, E: 95 }[answers.q21 as string] ?? 50;
  const usageScore = { A: 10, B: 40, C: 65, D: 90 }[answers.q9 as string] ?? 30;
  const workflowScore = { A: 5, B: 25, C: 55, D: 75, E: 95 }[answers.q22 as string] ?? 30;
  const toolSet = new Set(answers.q10 as QuizOptionValue[]);
  const toolingScore = toolSet.has("E")
    ? 5
    : Math.min(95, (toolSet.has("C") || toolSet.has("D") ? 40 : 0) + (toolSet.has("B") ? 20 : 0) + (toolSet.has("A") ? 15 : 0) + toolSet.size * 5);

  const total = Math.round((attitudeScore + usageScore + workflowScore + toolingScore) / 4);

  function axisLevel(score: number): "低" | "中" | "高" {
    if (score >= 65) return "高";
    if (score >= 35) return "中";
    return "低";
  }

  const axes: Record<"attitude" | "usage" | "workflow" | "tooling", ReadinessAxisScore> = {
    attitude: {
      code: "attitude",
      label: "AI 态度",
      score: attitudeScore,
      level: axisLevel(attitudeScore),
      insight: buildAttitudeInsight(answers.q21 as string),
    },
    usage: {
      code: "usage",
      label: "使用强度",
      score: usageScore,
      level: axisLevel(usageScore),
      insight: buildUsageInsight(answers.q9 as string),
    },
    workflow: {
      code: "workflow",
      label: "工作流融合",
      score: workflowScore,
      level: axisLevel(workflowScore),
      insight: buildWorkflowInsight(answers.q22 as string),
    },
    tooling: {
      code: "tooling",
      label: "工具成熟度",
      score: toolingScore,
      level: axisLevel(toolingScore),
      insight: buildToolingInsight(toolSet),
    },
  };

  const stageLevel = { L1: "L1", L2: "L2", L3: "L3", L4: "L4", L5: "L5" }[stage] as AiReadinessProfile["level"];
  const summary = buildReadinessSummary(stageLevel, total, axes);

  return { total, level: stageLevel, label: aiAdoptionStageLabels[stage] || stage, summary, axes };
}

function buildAttitudeInsight(q21: string): string {
  const map: Record<string, string> = {
    A: "目前处于观望阶段，对 AI 效果还有疑虑。深度诊断可以先从一个低风险场景建立信心。",
    B: "有兴趣但需要更多案例支撑。深度诊断适合先看看同类业务的落地案例。",
    C: "已有初步体验，正在寻找更值得深入的场景。",
    D: "认可 AI 价值，准备系统化落地。深度诊断可以直接规划工作流。",
    E: "已把 AI 视为核心变量，深度诊断可以直接进入业务系统化升级阶段。",
  };
  return map[q21] || map.C;
}

function buildUsageInsight(q9: string): string {
  const map: Record<string, string> = {
    A: "日常工作中 AI 使用极少，还没形成使用习惯。",
    B: "每天有 1-2 小时 AI 使用，正在建立使用节奏。",
    C: "每天 2-4 小时，AI 已经进入工作流的重要部分。",
    D: "4 小时以上，AI 是你日常工作的核心工具之一。",
  };
  return map[q9] || map.A;
}

function buildWorkflowInsight(q22: string): string {
  const map: Record<string, string> = {
    A: "AI 尚未融入工作流，仍停留在偶尔了解阶段。",
    B: "个人临时使用阶段，还没有固定场景。",
    C: "已有一个固定使用场景，这是很好的起点。",
    D: "多个场景有固定用法，下一步是形成系统闭环。",
    E: "AI 已进入团队协作和业务流程，开始影响交付方式。",
  };
  return map[q22] || map.A;
}

function buildToolingInsight(toolSet: Set<QuizOptionValue>): string {
  if (toolSet.has("E")) return "目前还没有工具进入日常工作，从聊天工具开始是最低门槛的入口。";
  const labels: string[] = [];
  if (toolSet.has("A")) labels.push("聊天工具");
  if (toolSet.has("B")) labels.push("低代码搭建工具");
  if (toolSet.has("C")) labels.push("代码类 AI 工具");
  if (toolSet.has("D")) labels.push("专业 Agent 工具");
  return `已使用 ${labels.join("、")}，工具覆盖度${toolSet.size >= 3 ? "较广，可考虑整合成系统工作流" : "还有提升空间，可以针对刚需场景补充更专业的工具"}。`;
}

function buildReadinessSummary(
  level: AiReadinessProfile["level"],
  total: number,
  axes: Record<ReadinessAxis, ReadinessAxisScore>,
): string {
  const weakAxes = (Object.values(axes) as ReadinessAxisScore[]).filter((a) => a.level === "低").map((a) => a.label);
  const stageDesc: Record<string, string> = {
    L1: "你目前处于 AI 起步期，最重要的是先找到一个低门槛、高频率的场景建立信心。",
    L2: "你已经开始使用 AI 工具，下一步是把好用的场景固定下来，形成稳定习惯。",
    L3: "你已有稳定的 AI 使用场景，是时候把单点体验扩展成系统化工作方式。",
    L4: "你有丰富的工具经验，但工作流整合还有提升空间——这是从「会用」到「用好」的关键节点。",
    L5: "你已进入 AI 深度融合阶段，接下来的重点是系统化、组织化和持续优化。",
  };
  const base = stageDesc[level] || stageDesc.L2;
  if (weakAxes.length === 0) return base;
  return `${base} 重点补齐的方向：${weakAxes.join("、")}。`;
}

// ─── 其他辅助函数 ─────────────────────────────────────────────────

function calculateCognitiveWidth(count: number): string {
  if (count >= 5) return "全景认知";
  if (count >= 3) return "拓展认知";
  return "聚焦认知";
}

function buildBlindSpots(selected: QuizOptionValue[]): string[] {
  if (selected.length >= 5) return [];
  const selectedSet = new Set(selected);
  // 盲区最多取前三，避免结果页变成负面清单
  return (Object.keys(q11BlindSpotMap) as Array<keyof typeof q11BlindSpotMap>)
    .filter((k) => !selectedSet.has(k))
    .slice(0, 3)
    .map((k) => q11BlindSpotMap[k]);
}

function calculateCrowdType(userType: "TE" | "EP" | "AP", stage: string): string {
  const isEarly = stage === "L1" || stage === "L2";
  if (userType === "TE") return isEarly ? "技术敏感型经营者" : "技术驱动型经营者";
  if (userType === "EP" && stage === "L5") return "全域刚需企业决策人";
  if (userType === "EP" && stage === "L4") return "有基础遇瓶颈企业主";
  if (userType === "EP") return "浅层企业家实用派";
  if (userType === "AP") return isEarly ? "学习转型型经营者" : "实践升级型经营者";
  return "企业家实用派";
}

function buildRecommendation(userType: "TE" | "EP" | "AP", stage: string): DiagnosisResult["recommendation"] {
  const tier = stage === "L5" ? "high" : stage === "L3" || stage === "L4" ? "mid" : "low";
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

function buildFallbackNarrative(
  scores: DimensionScore[],
  operatorTypeName: string,
  justNeedLabel: string,
  aiReadiness: AiReadinessProfile,
  landingPriority: LandingPriority,
): DiagnosisNarrative {
  return {
    actionInsights: scores.map((s) => {
      const lead = s.left >= s.right ? `${s.left}% ${s.leftLabel}` : `${s.right}% ${s.rightLabel}`;
      const opposite = s.left >= s.right ? s.rightLabel : s.leftLabel;
      return `${s.label}呈现 ${lead} 倾向。下一步可以刻意补上「${opposite}」视角，让决策更稳。`;
    }),
    actionPlan: {
      week: landingPriority.firstStep,
      month: `把跑通的流程沉淀成模板，记录节省的时间、成本或新增产出。`,
      ongoing: `围绕「${operatorTypeName}」的优势，把工具使用升级为可复用的业务方法。`,
    },
    closing: {
      technology: "AI 不只是替你加速，它会放大你原本的判断结构。",
      philosophy: aiReadiness.level === "L1" || aiReadiness.level === "L2"
        ? "先从一个你每天都会碰到的场景试起，别等准备好了才行动。"
        : "先看见自己的默认路径，再决定什么时候顺着走、什么时候换一条路。",
      quote: `送给${operatorTypeName}一句话：你不止一种可能，但此刻的选择已经给了你第一张地图。`,
    },
  };
}

// ─── 内部工具函数 ─────────────────────────────────────────────────

function hasOption(questionId: QuestionId, value: QuizOptionValue): boolean {
  return Boolean(
    quizQuestions.find((q) => q.id === questionId)?.options.some((o) => o.value === value),
  );
}
