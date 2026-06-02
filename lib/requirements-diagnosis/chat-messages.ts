import type { Prisma } from "@prisma/client";
import type { UIMessage } from "ai";
import { prisma } from "@/lib/db/prisma";

export async function recordDiagnosisChatMessages(input: {
  userId: string;
  chatSessionId: string;
  conversationId: string;
  messages: UIMessage[];
}) {
  if (!input.chatSessionId || !input.conversationId || input.messages.length === 0) {
    return;
  }

  await Promise.all(
    input.messages.map((message) =>
      prisma.diagnosisChatMessage.upsert({
        where: {
          conversationId_messageId: {
            conversationId: input.conversationId,
            messageId: message.id,
          },
        },
        update: {
          userId: input.userId,
          chatSessionId: input.chatSessionId,
          role: message.role,
          text: extractMessageText(message),
          parts: toJsonValue(message.parts),
        },
        create: {
          userId: input.userId,
          chatSessionId: input.chatSessionId,
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
