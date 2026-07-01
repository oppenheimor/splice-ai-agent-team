import type { Prisma } from "@prisma/client";
import type { UIMessage } from "ai";
import { prisma } from "@/lib/db/prisma";

export type AgentConversationSummary = {
  id: string;
  agentId: string;
  title: string;
  firstUserText: string | null;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentConversationDetail = AgentConversationSummary & {
  messages: UIMessage[];
};

export async function createAgentConversation(input: {
  userId: string;
  agentId: string;
  conversationId: string;
  title?: string;
}): Promise<AgentConversationDetail> {
  const title = input.title?.trim().slice(0, 80) || "新的 Agent 会话";
  const existing = await prisma.agentConversation.findUnique({
    where: { conversationId: input.conversationId },
    select: { id: true, userId: true, agentId: true },
  });

  if (existing && (existing.userId !== input.userId || existing.agentId !== input.agentId)) {
    throw new Error("会话已存在或无权访问。");
  }

  const conversation = existing
    ? await prisma.agentConversation.update({
      where: { id: existing.id },
      data: {
        title,
        status: "active",
        lastMessageAt: new Date(),
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    })
    : await prisma.agentConversation.create({
      data: {
        userId: input.userId,
        conversationId: input.conversationId,
        agentId: input.agentId,
        title,
        status: "active",
        lastMessageAt: new Date(),
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

  return {
    id: conversation.conversationId,
    agentId: conversation.agentId,
    title: conversation.title || "新的 Agent 会话",
    firstUserText: conversation.firstUserText,
    messageCount: conversation._count.messages,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: [],
  };
}

export async function listAgentConversationSummaries(input: {
  userId: string;
  agentId: string;
  limit?: number;
}): Promise<AgentConversationSummary[]> {
  const conversations = await prisma.agentConversation.findMany({
    where: {
      userId: input.userId,
      agentId: input.agentId,
      status: "active",
    },
    orderBy: { lastMessageAt: "desc" },
    take: input.limit,
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  return conversations.map((conversation) => ({
    id: conversation.conversationId,
    agentId: conversation.agentId,
    title: conversation.title || "新的 Agent 会话",
    firstUserText: conversation.firstUserText,
    messageCount: conversation._count.messages,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  }));
}

export async function getAgentConversationDetail(input: {
  userId: string;
  agentId: string;
  conversationId: string;
}): Promise<AgentConversationDetail | null> {
  const conversation = await prisma.agentConversation.findFirst({
    where: {
      userId: input.userId,
      agentId: input.agentId,
      conversationId: input.conversationId,
      status: "active",
    },
    include: {
      messages: {
        orderBy: [
          { messageIndex: "asc" },
          { createdAt: "asc" },
        ],
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  if (!conversation) {
    return null;
  }

  return {
    id: conversation.conversationId,
    agentId: conversation.agentId,
    title: conversation.title || "新的 Agent 会话",
    firstUserText: conversation.firstUserText,
    messageCount: conversation._count.messages,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.messageId,
      role: message.role as UIMessage["role"],
      parts: fromJsonValue<UIMessage["parts"]>(message.parts) || [],
      metadata: fromJsonValue<UIMessage["metadata"]>(message.metadata) || undefined,
    })),
  };
}

export async function softDeleteAgentConversation(input: {
  userId: string;
  agentId: string;
  conversationId: string;
}): Promise<boolean> {
  const conversation = await prisma.agentConversation.findFirst({
    where: {
      userId: input.userId,
      agentId: input.agentId,
      conversationId: input.conversationId,
    },
    select: { id: true },
  });

  if (!conversation) {
    return false;
  }

  // 用户侧删除只隐藏会话，保留 admin/agent-evals 所需的消息和运行记录。
  await prisma.agentConversation.update({
    where: { id: conversation.id },
    data: {
      status: "deleted",
    },
  });

  return true;
}

export async function updateAgentConversationTitle(input: {
  userId: string;
  agentId: string;
  conversationId: string;
  title: string;
}): Promise<AgentConversationSummary | null> {
  const title = input.title.trim().slice(0, 80);

  if (!title) {
    throw new Error("标题不能为空。");
  }

  const existing = await prisma.agentConversation.findFirst({
    where: {
      userId: input.userId,
      agentId: input.agentId,
      conversationId: input.conversationId,
      status: "active",
    },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const conversation = await prisma.agentConversation.update({
    where: { id: existing.id },
    data: { title },
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  return {
    id: conversation.conversationId,
    agentId: conversation.agentId,
    title: conversation.title || "新的 Agent 会话",
    firstUserText: conversation.firstUserText,
    messageCount: conversation._count.messages,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

function fromJsonValue<T>(value: Prisma.JsonValue | null): T | null {
  if (value === null) return null;
  return JSON.parse(JSON.stringify(value)) as T;
}
