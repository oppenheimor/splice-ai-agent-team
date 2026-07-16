import type { Prisma } from "@prisma/client";
import type { HandleMessageStreamEvent, SessionState } from "eve/client";
import type { EveMessage } from "eve/react";
import { WISH_CREATOR_AGENT_ID, WISH_CREATOR_DEFAULT_TITLE } from "../../constants/wish-creator";
import { prisma } from "../db/prisma";
import type { WishCreatorInitialState, WishCreatorPublicationResult } from "../../types/wish-creator";

type WishCreatorMetadata = {
  readonly eveEvents?: readonly HandleMessageStreamEvent[];
  readonly eveSessionId?: string;
  readonly eveSessionState?: SessionState;
};

export async function ensureWishCreatorConversation(input: {
  readonly conversationId: string;
  readonly userId: string;
}): Promise<WishCreatorInitialState> {
  const existing = await prisma.agentConversation.findUnique({
    where: { conversationId: input.conversationId },
  });

  if (existing && (existing.userId !== input.userId || existing.agentId !== WISH_CREATOR_AGENT_ID)) {
    throw new Error("会话已存在或无权访问。");
  }

  const conversation = existing
    ? await prisma.agentConversation.update({
        where: { id: existing.id },
        data: { status: "active" },
      })
    : await prisma.agentConversation.create({
        data: {
          userId: input.userId,
          conversationId: input.conversationId,
          agentId: WISH_CREATOR_AGENT_ID,
          agentVersion: "eve-0.24.3",
          model: "deepseek-chat",
          title: WISH_CREATOR_DEFAULT_TITLE,
        },
      });

  const latestPublication = await prisma.wishCreatorPublication.findFirst({
    where: { agentConversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    select: { url: true },
  });
  const metadata = readWishCreatorMetadata(conversation.metadata);

  return {
    ...(metadata.eveSessionId ? { eveSessionId: metadata.eveSessionId } : {}),
    events: metadata.eveEvents ?? [],
    session: metadata.eveSessionState ?? { streamIndex: 0 },
    title: conversation.title || WISH_CREATOR_DEFAULT_TITLE,
    ...(latestPublication ? { latestPublishedUrl: latestPublication.url } : {}),
  };
}

export async function saveWishCreatorSnapshot(input: {
  readonly conversationId: string;
  readonly events: readonly HandleMessageStreamEvent[];
  readonly messages: readonly EveMessage[];
  readonly session: SessionState;
  readonly userId: string;
}): Promise<void> {
  const conversation = await prisma.agentConversation.findFirst({
    where: {
      userId: input.userId,
      conversationId: input.conversationId,
      agentId: WISH_CREATOR_AGENT_ID,
      status: "active",
    },
  });
  if (!conversation) throw new Error("会话不存在或无权访问。");

  const firstUserText = extractFirstUserText(input.messages);
  const title = firstUserText?.slice(0, 36) || conversation.title || WISH_CREATOR_DEFAULT_TITLE;
  const previousMetadata = toRecord(conversation.metadata);
  const wishCreatorMetadata = readWishCreatorMetadata(conversation.metadata);
  const metadata: Prisma.InputJsonObject = {
    ...toInputJsonObject(previousMetadata),
    wishCreator: {
      ...toInputJsonObject(wishCreatorMetadata),
      eveEvents: toInputJson(input.events),
      eveSessionId: input.session.sessionId ?? wishCreatorMetadata.eveSessionId ?? null,
      eveSessionState: toInputJson(input.session),
    },
  };

  await prisma.$transaction(async (transaction) => {
    await transaction.agentMessage.deleteMany({
      where: { agentConversationId: conversation.id },
    });

    if (input.messages.length > 0) {
      await transaction.agentMessage.createMany({
        data: input.messages.map((message, messageIndex) => ({
          userId: input.userId,
          agentConversationId: conversation.id,
          conversationId: input.conversationId,
          agentId: WISH_CREATOR_AGENT_ID,
          messageId: message.id,
          messageIndex,
          role: message.role,
          text: extractMessageText(message),
          parts: toInputJson(message.parts),
          metadata: message.metadata ? toInputJson(message.metadata) : undefined,
        })),
      });
    }

    await transaction.agentConversation.update({
      where: { id: conversation.id },
      data: {
        title,
        firstUserText: firstUserText ?? conversation.firstUserText,
        metadata,
        lastMessageAt: new Date(),
      },
    });
  });
}

export async function recordWishCreatorPublication(input: {
  readonly conversationId: string;
  readonly result: WishCreatorPublicationResult;
  readonly userId: string;
}): Promise<void> {
  const conversation = await prisma.agentConversation.findFirst({
    where: {
      userId: input.userId,
      conversationId: input.conversationId,
      agentId: WISH_CREATOR_AGENT_ID,
      status: "active",
    },
    select: { id: true },
  });
  if (!conversation) throw new Error("发布对应的会话不存在或无权访问。");

  await prisma.wishCreatorPublication.create({
    data: {
      userId: input.userId,
      agentConversationId: conversation.id,
      conversationId: input.conversationId,
      artifactPath: input.result.artifactPath,
      publishPath: input.result.publishPath,
      url: input.result.primaryUrl,
      bytes: input.result.bytes,
      status: input.result.status,
      verification: input.result.verification,
    },
  });
}

export function readWishCreatorMetadata(value: unknown): WishCreatorMetadata {
  const root = toRecord(value);
  const metadata = toRecord(root.wishCreator);
  return metadata as WishCreatorMetadata;
}

function extractFirstUserText(messages: readonly EveMessage[]): string | undefined {
  const firstUserMessage = messages.find((message) => message.role === "user");
  return firstUserMessage ? extractMessageText(firstUserMessage) ?? undefined : undefined;
}

function extractMessageText(message: EveMessage): string | null {
  const text = message.parts
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
  return text || null;
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function toInputJsonObject(value: unknown): Prisma.InputJsonObject {
  return toInputJson(toRecord(value)) as Prisma.InputJsonObject;
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
