import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { fromDiagnosisRecord, toDiagnosisJson } from "@/lib/requirements-diagnosis/persistence";
import { calculateDiagnosis } from "@/lib/requirements-diagnosis/scoring";
import type { DiagnosisNarrative, QuizAnswers } from "@/lib/requirements-diagnosis/types";

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
    "只输出 JSON，不要 Markdown，不要代码块。",
    "JSON 结构必须是：",
    '{"actionInsights":["五条，每条对应一个维度"],"actionPlan":{"week":"...","month":"...","ongoing":"..."},"closing":{"technology":"...","philosophy":"...","quote":"..."}}',
    "要求：中文、专业、积极、克制。不要编造外部数据。每条 actionInsights 使用「数据陈述 -> 客观判断 -> 积极引导」的语气。",
  ].join("\n");
}

export function parseNarrative(text: string, fallback: DiagnosisNarrative): DiagnosisNarrative | null {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    const parsed = JSON.parse(trimmed) as Partial<DiagnosisNarrative>;
    // LLM 只增强叙事字段；缺字段时保留算法生成的本地报告，避免展示空段落。
    return {
      actionInsights: parsed.actionInsights?.length ? parsed.actionInsights : fallback.actionInsights,
      actionPlan: {
        ...fallback.actionPlan,
        ...parsed.actionPlan,
      },
      closing: {
        ...fallback.closing,
        ...parsed.closing,
      },
    };
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
