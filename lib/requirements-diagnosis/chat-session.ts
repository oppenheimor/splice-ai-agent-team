import { Prisma } from "@prisma/client";
import type { DiagnosisContext } from "@/lib/agent-team/agents/prompts";
import { prisma } from "@/lib/db/prisma";

export type DiagnosisResolution = {
  chatSessionId: string;
  conversationId: string;
  context: DiagnosisContext;
};

export async function resolveDiagnosisContext(
  userId: string,
  quizResultId: string | undefined,
  conversationId: string | undefined,
): Promise<DiagnosisResolution> {
  if (!quizResultId) {
    throw new Error("需求诊断对话必须携带 quizResultId。");
  }

  const quizResult = await prisma.diagnosisQuizResult.findFirst({
    where: { id: quizResultId, userId },
    include: { chatSession: true },
  });

  if (!quizResult) {
    throw new Error("评测结果不存在或无权访问。");
  }

  const chatSession = await getOrCreateDiagnosisChatSession({
    userId,
    quizResultId,
    conversationId,
    existingSession: quizResult.chatSession,
  });

  const resolvedConversationId = conversationId || chatSession.conversationId || chatSession.id;

  // 一个评测最多一个 ChatSession；如果前端生成了新的 conversationId，只更新绑定关系而不新建会话。
  if (conversationId && chatSession.conversationId !== conversationId) {
    await updateDiagnosisChatSessionConversation(chatSession.id, conversationId);
  } else {
    await prisma.diagnosisChatSession.update({
      where: { id: chatSession.id },
      data: { lastMessageAt: new Date() },
    });
  }

  return {
    chatSessionId: chatSession.id,
    conversationId: resolvedConversationId,
    context: {
      operatorCode: quizResult.operatorCode,
      operatorTypeName: quizResult.operatorTypeName,
      dimensionScores: normalizeDimensionScores(quizResult.dimensionScores),
      aiAdoptionStage: quizResult.aiAdoptionStage,
      userType: quizResult.userType,
      cognitiveWidth: quizResult.cognitiveWidth,
      blindSpots: Array.isArray(quizResult.blindSpots) ? (quizResult.blindSpots as string[]) : [],
      justNeed: quizResult.justNeed,
      crowdType: quizResult.crowdType,
    } satisfies DiagnosisContext,
  };
}

async function updateDiagnosisChatSessionConversation(
  chatSessionId: string,
  conversationId: string,
): Promise<void> {
  try {
    await prisma.diagnosisChatSession.update({
      where: { id: chatSessionId },
      data: {
        conversationId,
        lastMessageAt: new Date(),
      },
    });
  } catch (error) {
    if (!isPrismaUniqueConstraintError(error)) {
      throw error;
    }

    // 旧浏览器本地历史可能把别的评测 conversationId 传回来；保留当前评测自己的绑定，只刷新活跃时间。
    await prisma.diagnosisChatSession.update({
      where: { id: chatSessionId },
      data: { lastMessageAt: new Date() },
    });
  }
}

async function getOrCreateDiagnosisChatSession(input: {
  userId: string;
  quizResultId: string;
  conversationId: string | undefined;
  existingSession: { id: string; conversationId: string | null } | null;
}): Promise<{ id: string; conversationId: string | null }> {
  if (input.existingSession) {
    return input.existingSession;
  }

  try {
    return await prisma.diagnosisChatSession.create({
      data: {
        userId: input.userId,
        quizResultId: input.quizResultId,
        conversationId: input.conversationId,
      },
    });
  } catch (error) {
    if (!isPrismaUniqueConstraintError(error)) {
      throw error;
    }

    // 浏览器本地历史可能复用旧 conversationId；唯一键冲突时为当前评测换一个稳定的新会话 ID。
    return prisma.diagnosisChatSession.create({
      data: {
        userId: input.userId,
        quizResultId: input.quizResultId,
        conversationId: `diagnosis-${input.quizResultId}`,
      },
    });
  }
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function normalizeDimensionScores(value: unknown): DiagnosisContext["dimensionScores"] {
  if (!value || typeof value !== "object") return {};
  // Json 字段进入 prompt 前统一压成数字，避免旧数据或手工修复数据把 NaN 注入 system prompt。
  return Object.fromEntries(
    Object.entries(value as Record<string, { left?: unknown; right?: unknown }>).map(([key, score]) => [
      key,
      {
        left: Number(score?.left) || 0,
        right: Number(score?.right) || 0,
      },
    ]),
  );
}
