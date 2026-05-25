import type { Prisma } from "@prisma/client";
import type { UIMessage } from "ai";
import { prisma } from "@/lib/db/prisma";

export type TreasureAnalyticsEventInput = {
  userId: string;
  sessionId?: string;
  visitorId?: string;
  conversationId?: string;
  type: "page_view" | "click";
  pagePath: string;
  target?: string;
  payload?: Prisma.InputJsonValue;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export async function recordTreasureAnalyticsEvent(input: TreasureAnalyticsEventInput) {
  await prisma.treasureAnalyticsEvent.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId,
      visitorId: input.visitorId,
      conversationId: input.conversationId,
      type: input.type,
      pagePath: input.pagePath,
      target: input.target,
      payload: input.payload,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    },
  });
}

export async function recordTreasureChatMessages(input: {
  userId: string;
  sessionId?: string;
  visitorId?: string;
  conversationId: string;
  messages: UIMessage[];
}) {
  if (!input.conversationId || input.messages.length === 0) {
    return;
  }

  await Promise.all(
    input.messages.map((message) =>
      prisma.treasureChatMessage.upsert({
        where: {
          conversationId_messageId: {
            conversationId: input.conversationId,
            messageId: message.id,
          },
        },
        update: {
          userId: input.userId,
          sessionId: input.sessionId,
          visitorId: input.visitorId,
          role: message.role,
          text: extractMessageText(message),
          parts: toJsonValue(message.parts),
        },
        create: {
          userId: input.userId,
          sessionId: input.sessionId,
          visitorId: input.visitorId,
          conversationId: input.conversationId,
          messageId: message.id,
          role: message.role,
          text: extractMessageText(message),
          parts: toJsonValue(message.parts),
        },
      }),
    ),
  );
}

export async function getTreasureAnalyticsSummary() {
  const [pv, uvUsers, uvVisitors, topClicks, recentMessages] = await Promise.all([
    prisma.treasureAnalyticsEvent.count({ where: { type: "page_view" } }),
    prisma.treasureAnalyticsEvent.groupBy({
      by: ["userId"],
      where: { type: "page_view" },
    }),
    prisma.treasureAnalyticsEvent.groupBy({
      by: ["visitorId"],
      where: {
        type: "page_view",
        visitorId: { not: null },
      },
    }),
    prisma.treasureAnalyticsEvent.groupBy({
      by: ["target"],
      where: {
        type: "click",
        target: { not: null },
      },
      _count: { target: true },
      orderBy: { _count: { target: "desc" } },
      take: 20,
    }),
    prisma.treasureChatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        userId: true,
        visitorId: true,
        conversationId: true,
        messageId: true,
        role: true,
        text: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    pv,
    uv: Math.max(uvUsers.length, uvVisitors.length),
    uniqueUsers: uvUsers.length,
    uniqueVisitors: uvVisitors.length,
    topClicks: topClicks.map((item) => ({
      target: item.target,
      count: item._count.target,
    })),
    recentMessages,
  };
}

export async function getTreasureAdminDashboard() {
  const [summary, recentEvents, conversations] = await Promise.all([
    getTreasureAnalyticsSummary(),
    prisma.treasureAnalyticsEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: 80,
      select: {
        id: true,
        type: true,
        pagePath: true,
        target: true,
        visitorId: true,
        conversationId: true,
        occurredAt: true,
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    }),
    prisma.treasureChatMessage.groupBy({
      by: ["conversationId", "userId", "visitorId"],
      _count: { messageId: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      take: 30,
    }),
  ]);

  const userIds = [...new Set(conversations.map((conversation) => conversation.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      name: true,
    },
  });
  const userById = new Map(users.map((user) => [user.id, user]));

  const conversationMessages = await prisma.treasureChatMessage.findMany({
    where: {
      conversationId: { in: conversations.map((conversation) => conversation.conversationId) },
    },
    orderBy: { createdAt: "asc" },
    select: {
      conversationId: true,
      messageId: true,
      role: true,
      text: true,
      createdAt: true,
    },
  });

  const messagesByConversation = new Map<string, typeof conversationMessages>();
  for (const message of conversationMessages) {
    const existing = messagesByConversation.get(message.conversationId) || [];
    existing.push(message);
    messagesByConversation.set(message.conversationId, existing);
  }

  return {
    summary,
    recentEvents,
    conversations: conversations.map((conversation) => ({
      conversationId: conversation.conversationId,
      visitorId: conversation.visitorId,
      user: userById.get(conversation.userId) || null,
      messageCount: conversation._count.messageId,
      lastMessageAt: conversation._max.createdAt,
      messages: (messagesByConversation.get(conversation.conversationId) || []).slice(-12),
    })),
  };
}

function extractMessageText(message: UIMessage): string {
  return (message.parts || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .slice(0, 20000);
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}
