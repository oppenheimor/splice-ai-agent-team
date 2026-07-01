import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { fromDiagnosisRecord, toDiagnosisJson } from "@/lib/requirements-diagnosis/persistence";
import { calculateDiagnosis } from "@/lib/requirements-diagnosis/scoring";
import type { DiagnosisNarrative, QuizAnswers } from "@/lib/requirements-diagnosis/types";

export type DiagnosisNarrativePatch =
  | { type: "actionInsight"; index: number; text: string }
  | { type: "actionPlan"; key: keyof DiagnosisNarrative["actionPlan"]; text: string }
  | { type: "closing"; key: keyof DiagnosisNarrative["closing"]; text: string };

export async function createDiagnosis(userId: string, answers: QuizAnswers | undefined) {
  if (!answers) {
    throw new Error("缺少问卷答案。");
  }

  const result = calculateDiagnosis(answers);
  return prisma.diagnosisQuizResult.create({
    data: {
      userId,
      ...toDiagnosisJson(result),
    },
    include: buildDiagnosisRecordInclude(),
  });
}

export async function retryDiagnosisNarrative(userId: string, quizResultId: string | undefined) {
  if (!quizResultId) {
    throw new Error("缺少评测结果 ID。");
  }

  // 重试叙事只读取既有评测结果，不重复写入 DiagnosisQuizResult，避免刷新/重试制造重复历史。
  const record = await prisma.diagnosisQuizResult.findFirst({
    where: { id: quizResultId, userId },
    include: buildDiagnosisRecordInclude(),
  });

  if (!record) {
    throw new Error("评测结果不存在。");
  }

  return record;
}

export async function saveEnhancedNarrative(input: {
  userId: string;
  recordId: string;
  narrative: DiagnosisNarrative;
}) {
  await prisma.diagnosisQuizResult.update({
    where: { id: input.recordId, userId: input.userId },
    data: { enhancedNarrative: input.narrative as unknown as Prisma.InputJsonValue },
  });
}

export function buildNarrativeSystemPrompt(): string {
  return [
    "你是需求诊断报告的叙事增强器。",
    "只输出 JSONL，不要 Markdown，不要代码块，不要解释。",
    "每一行必须是一个独立 JSON 对象，字段顺序按下面要求输出，方便前端逐段展示。",
    "必须先连续输出 5 行 actionInsight，每行结构：",
    '{"type":"actionInsight","index":0,"text":"第一条，对应第 1 个经营维度"}',
    "index 必须从 0 到 4，分别对应输入里的五个经营维度。",
    "然后输出 3 行 actionPlan，key 只能是 week、month、ongoing：",
    '{"type":"actionPlan","key":"week","text":"..."}',
    "最后输出 3 行 closing，key 只能是 technology、philosophy、quote：",
    '{"type":"closing","key":"technology","text":"..."}',
    "要求：中文、专业、积极、克制。不要编造外部数据。",
    "每条 actionInsights 使用「数据陈述 -> 客观判断 -> 积极引导」的语气，结合该维度的主导倾向，给出能指导下一步行动的建议。",
    "actionPlan 要结合用户的 AI 落地画像（当前阶段、落地方式偏好、主要阻力）给出具体可执行的行动方向，而不是泛泛的建议。",
    "closing 的 quote 是给这个经营人格类型量身写的一句话，不要直接重复 operatorTypeName。",
    "这是初步诊断，叙事不要假装已经掌握全部信息，而是明确指向：通过深度诊断可以进一步明确场景和方案。",
    "tone：像一位懂商业、懂 AI 落地的顾问在跟用户说话，而不是像推销 AI 产品。",
  ].join("\n");
}

export function createEmptyNarrative(): DiagnosisNarrative {
  return {
    actionInsights: ["", "", "", "", ""],
    actionPlan: {
      week: "",
      month: "",
      ongoing: "",
    },
    closing: {
      technology: "",
      philosophy: "",
      quote: "",
    },
  };
}

export function applyNarrativePatch(
  narrative: DiagnosisNarrative,
  patch: DiagnosisNarrativePatch,
): DiagnosisNarrative {
  if (patch.type === "actionInsight") {
    const actionInsights = [...narrative.actionInsights];
    actionInsights[patch.index] = patch.text;
    return { ...narrative, actionInsights };
  }
  if (patch.type === "actionPlan") {
    return {
      ...narrative,
      actionPlan: {
        ...narrative.actionPlan,
        [patch.key]: patch.text,
      },
    };
  }
  return {
    ...narrative,
    closing: {
      ...narrative.closing,
      [patch.key]: patch.text,
    },
  };
}

export function parseNarrativePatch(line: string): DiagnosisNarrativePatch | null {
  try {
    const parsed = JSON.parse(line.trim()) as Partial<DiagnosisNarrativePatch>;
    const actionInsightIndex = parsed.type === "actionInsight" ? parsed.index : undefined;
    if (typeof actionInsightIndex === "number" && Number.isInteger(actionInsightIndex) && actionInsightIndex >= 0 && actionInsightIndex < 5 && isNonEmptyString(parsed.text)) {
      return { type: "actionInsight", index: actionInsightIndex, text: parsed.text };
    }
    if (parsed.type === "actionPlan" && isActionPlanKey(parsed.key) && isNonEmptyString(parsed.text)) {
      return { type: "actionPlan", key: parsed.key, text: parsed.text };
    }
    if (parsed.type === "closing" && isClosingKey(parsed.key) && isNonEmptyString(parsed.text)) {
      return { type: "closing", key: parsed.key, text: parsed.text };
    }
    return null;
  } catch {
    return null;
  }
}

export function parseNarrative(text: string): DiagnosisNarrative | null {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    const parsed = JSON.parse(trimmed) as Partial<DiagnosisNarrative>;
    if (!isCompleteNarrative(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function toDiagnosisDto(record: Awaited<ReturnType<typeof createDiagnosis>>) {
  return fromDiagnosisRecord(record);
}

function buildDiagnosisRecordInclude() {
  return {
    chatSession: {
      select: {
        id: true,
        conversationId: true,
        status: true,
      },
    },
  } satisfies Prisma.DiagnosisQuizResultInclude;
}

export function isCompleteNarrative(narrative: Partial<DiagnosisNarrative>): narrative is DiagnosisNarrative {
  return (
    Array.isArray(narrative.actionInsights)
    && narrative.actionInsights.length === 5
    && narrative.actionInsights.every(isNonEmptyString)
    && isNonEmptyString(narrative.actionPlan?.week)
    && isNonEmptyString(narrative.actionPlan?.month)
    && isNonEmptyString(narrative.actionPlan?.ongoing)
    && isNonEmptyString(narrative.closing?.technology)
    && isNonEmptyString(narrative.closing?.philosophy)
    && isNonEmptyString(narrative.closing?.quote)
  );
}

function isActionPlanKey(value: unknown): value is keyof DiagnosisNarrative["actionPlan"] {
  return value === "week" || value === "month" || value === "ongoing";
}

function isClosingKey(value: unknown): value is keyof DiagnosisNarrative["closing"] {
  return value === "technology" || value === "philosophy" || value === "quote";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
