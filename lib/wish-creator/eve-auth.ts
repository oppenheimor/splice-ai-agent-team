import type { AuthFn } from "eve/channels/auth";
import { ForbiddenError, UnauthenticatedError } from "eve/channels/auth";
import { WISH_CREATOR_AGENT_ID, WISH_CREATOR_CONVERSATION_HEADER } from "../../constants/wish-creator";
import { getRequestUser } from "../auth/request-session";
import { prisma } from "../db/prisma";
import { readWishCreatorMetadata } from "./persistence";

const EVE_SESSION_ROUTE_PATTERN = /\/eve\/v1\/session\/([^/]+)/u;

export function wishCreatorAppAuth(): AuthFn<Request> {
  return async (request) => {
    const user = await getRequestUser(request);
    if (!user) {
      throw new UnauthenticatedError({
        code: "authentication_required",
        message: "请先登录后再使用许愿池。",
      });
    }

    const conversationId = request.headers.get(WISH_CREATOR_CONVERSATION_HEADER)?.trim();
    if (!conversationId) {
      throw new ForbiddenError({ message: "缺少许愿池会话标识。" });
    }

    const conversation = await prisma.agentConversation.findFirst({
      where: {
        userId: user.id,
        conversationId,
        agentId: WISH_CREATOR_AGENT_ID,
        status: "active",
      },
    });
    if (!conversation) {
      throw new ForbiddenError({ message: "会话不存在或无权访问。" });
    }

    const eveSessionId = EVE_SESSION_ROUTE_PATTERN.exec(new URL(request.url).pathname)?.[1];
    if (eveSessionId) {
      await claimEveSession({
        conversationId,
        conversationRecordId: conversation.id,
        currentMetadata: conversation.metadata,
        eveSessionId,
      });
    }

    return {
      authenticator: "splice-session",
      issuer: "splice-ai-agent-team",
      principalId: user.id,
      principalType: "user",
      subject: user.id,
      attributes: { conversationId },
    };
  };
}

async function claimEveSession(input: {
  readonly conversationId: string;
  readonly conversationRecordId: string;
  readonly currentMetadata: unknown;
  readonly eveSessionId: string;
}) {
  const current = readWishCreatorMetadata(input.currentMetadata);
  if (current.eveSessionId && current.eveSessionId !== input.eveSessionId) {
    throw new ForbiddenError({ message: "Eve 会话与许愿池会话不匹配。" });
  }

  const claimed = await prisma.agentConversation.findFirst({
    where: {
      agentId: WISH_CREATOR_AGENT_ID,
      metadata: {
        path: ["wishCreator", "eveSessionId"],
        equals: input.eveSessionId,
      },
      NOT: { id: input.conversationRecordId },
    },
    select: { id: true },
  });
  if (claimed) {
    throw new ForbiddenError({ message: "Eve 会话已属于其他许愿池会话。" });
  }

  if (!current.eveSessionId) {
    const root = typeof input.currentMetadata === "object" && input.currentMetadata !== null
      ? input.currentMetadata as Record<string, unknown>
      : {};
    await prisma.agentConversation.update({
      where: { id: input.conversationRecordId },
      data: {
        metadata: JSON.parse(JSON.stringify({
          ...root,
          wishCreator: { ...current, eveSessionId: input.eveSessionId },
        })),
      },
    });
  }
}
