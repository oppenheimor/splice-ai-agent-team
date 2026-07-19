import type { Prisma } from "@prisma/client";
import { WISH_INTAKE_AGENT_ID } from "@/constants/wish-intake";
import { createAgentConversation, getAgentConversationDetail } from "@/lib/agent-team/conversations/database-conversations";
import { prisma } from "@/lib/db/prisma";
import { analyzeWish, generateWishSummary } from "@/lib/wish-intake/ai";
import { toWishListItem } from "@/lib/wish-intake/list-items";
import { extractWishMessageText } from "@/lib/wish-intake/messages";
import { wishSummarySchema, type WishSummaryInput } from "@/lib/wish-intake/schema";
import type { WishCapabilityGapId, WishListItem, WishRecord, WishSummary } from "@/types/wish-intake";

export async function ensureWishConversation(userId: string, conversationId: string) {
  assertConversationId(conversationId);
  return createAgentConversation({
    userId,
    agentId: WISH_INTAKE_AGENT_ID,
    conversationId,
    title: "说出一个愿望",
  });
}

export async function createWishSummaryDraft(userId: string, conversationId: string): Promise<WishSummary> {
  const conversation = await getOwnedWishConversation(userId, conversationId);
  const hasUserMessage = conversation.messages.some(
    (message) => message.role === "user" && extractWishMessageText(message),
  );

  if (!hasUserMessage) {
    throw new Error("请先说说你的想法。");
  }

  await assertWishNotSubmitted(userId, conversationId);
  return generateWishSummary(conversation.messages);
}

export async function submitWish(input: {
  userId: string;
  conversationId: string;
  summary: WishSummaryInput;
}): Promise<WishRecord> {
  const summary = wishSummarySchema.parse(input.summary);
  const conversation = await getOwnedWishConversation(input.userId, input.conversationId);
  const hasUserMessage = conversation.messages.some(
    (message) => message.role === "user" && extractWishMessageText(message),
  );

  if (!hasUserMessage) {
    throw new Error("请先说说你的想法。");
  }

  await assertWishNotSubmitted(input.userId, input.conversationId);
  const analysis = await analyzeWish(summary);
  const agentConversation = await prisma.agentConversation.findFirstOrThrow({
    where: {
      userId: input.userId,
      conversationId: input.conversationId,
      agentId: WISH_INTAKE_AGENT_ID,
    },
    select: { id: true },
  });

  const wish = await prisma.wishCreatorWish.create({
    data: {
      userId: input.userId,
      agentConversationId: agentConversation.id,
      conversationId: input.conversationId,
      ...summary,
      constraints: summary.constraints || null,
      capabilityGaps: analysis.capabilityGaps,
      analysisRationale: analysis.rationale,
      analysisVersion: analysis.version,
    },
  });

  return toWishRecord(wish);
}

export async function listWishItems(userId: string): Promise<WishListItem[]> {
  const conversations = await prisma.agentConversation.findMany({
    where: {
      userId,
      agentId: WISH_INTAKE_AGENT_ID,
      status: "active",
      firstUserText: { not: null },
    },
    orderBy: { lastMessageAt: "desc" },
    select: {
      conversationId: true,
      title: true,
      firstUserText: true,
      lastMessageAt: true,
      wishCreatorWish: {
        select: {
          id: true,
          title: true,
          goal: true,
          submittedAt: true,
          userRemovedAt: true,
        },
      },
    },
  });
  return conversations.flatMap((conversation) => {
    const item = toWishListItem(conversation);
    return item ? [item] : [];
  });
}

export async function getVisibleWish(userId: string, wishId: string): Promise<WishRecord | null> {
  const wish = await prisma.wishCreatorWish.findFirst({
    where: { id: wishId, userId, userRemovedAt: null },
  });
  return wish ? toWishRecord(wish) : null;
}

export async function getWishByConversation(userId: string, conversationId: string) {
  const wish = await prisma.wishCreatorWish.findFirst({
    where: { userId, conversationId },
    select: { id: true, userRemovedAt: true },
  });
  return wish ? { id: wish.id, visibleToUser: wish.userRemovedAt === null } : null;
}

export async function hasSubmittedWish(userId: string, conversationId: string): Promise<boolean> {
  return Boolean(await prisma.wishCreatorWish.findFirst({
    where: { userId, conversationId },
    select: { id: true },
  }));
}

export async function removeWishFromUserView(userId: string, wishId: string): Promise<boolean> {
  const result = await prisma.wishCreatorWish.updateMany({
    where: { id: wishId, userId, userRemovedAt: null },
    data: { userRemovedAt: new Date() },
  });
  return result.count > 0;
}

export async function recordWishContactClick(userId: string, wishId: string): Promise<boolean> {
  const result = await prisma.wishCreatorWish.updateMany({
    where: { id: wishId, userId },
    data: {
      contactClickCount: { increment: 1 },
      lastContactClickedAt: new Date(),
    },
  });
  return result.count > 0;
}

async function getOwnedWishConversation(userId: string, conversationId: string) {
  assertConversationId(conversationId);
  const conversation = await getAgentConversationDetail({
    userId,
    agentId: WISH_INTAKE_AGENT_ID,
    conversationId,
  });

  if (!conversation) {
    throw new Error("愿望对话不存在或无权访问。");
  }
  return conversation;
}

async function assertWishNotSubmitted(userId: string, conversationId: string) {
  if (await hasSubmittedWish(userId, conversationId)) {
    throw new Error("这条愿望已经提交过了。");
  }
}

function assertConversationId(conversationId: string) {
  if (!/^[a-zA-Z0-9_-]{8,120}$/.test(conversationId)) {
    throw new Error("愿望对话 ID 不正确。");
  }
}

type WishPersistenceRecord = {
  id: string;
  conversationId: string;
  title: string;
  goal: string;
  usageScenario: string;
  currentProblem: string;
  idealResult: string;
  constraints: string | null;
  capabilityGaps: Prisma.JsonValue;
  contactClickCount: number;
  submittedAt: Date;
};

function toWishRecord(wish: WishPersistenceRecord): WishRecord {
  return {
    id: wish.id,
    conversationId: wish.conversationId,
    title: wish.title,
    goal: wish.goal,
    usageScenario: wish.usageScenario,
    currentProblem: wish.currentProblem,
    idealResult: wish.idealResult,
    constraints: wish.constraints || "",
    capabilityGaps: Array.isArray(wish.capabilityGaps)
      ? wish.capabilityGaps.filter((item): item is WishCapabilityGapId => typeof item === "string") as WishCapabilityGapId[]
      : [],
    contactClickCount: wish.contactClickCount,
    submittedAt: wish.submittedAt.toISOString(),
  };
}
