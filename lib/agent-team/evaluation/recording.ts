import type { Prisma } from "@prisma/client";
import type { UIMessage } from "ai";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { prisma } from "@/lib/db/prisma";

export const AGENT_EVAL_PROMPT_VERSION = "deep-diagnosis-eval-v1";

type EnsureAgentConversationInput = {
  userId: string;
  sessionId?: string;
  visitorId?: string;
  conversationId: string;
  agent: AgentManifest;
  model?: string;
  messages: UIMessage[];
  metadata?: unknown;
};

type RecordAgentMessagesInput = EnsureAgentConversationInput;

type StartAgentRunInput = {
  userId: string;
  sessionId?: string;
  visitorId?: string;
  conversationId: string;
  agent: AgentManifest;
  model?: string;
  inputMessageCount: number;
  decision?: unknown;
  metadata?: unknown;
};

type FinishAgentRunInput = {
  runId: string;
  outputMessageCount: number;
  status?: "completed" | "failed";
  errorMessage?: string;
  metadata?: unknown;
};

export async function recordAgentConversationSnapshot(input: RecordAgentMessagesInput) {
  if (!input.conversationId || input.messages.length === 0) return;

  const conversation = await ensureAgentConversation(input);
  await Promise.all(
    input.messages.map((message, messageIndex) =>
      prisma.agentMessage.upsert({
        where: {
          conversationId_messageId: {
            conversationId: input.conversationId,
            messageId: message.id,
          },
        },
        update: {
          userId: input.userId,
          agentConversationId: conversation.id,
          agentId: input.agent.id,
          messageIndex,
          role: message.role,
          text: redactSensitiveText(extractMessageText(message)),
          parts: toJsonValue(redactMessageParts(message.parts)),
          metadata: toJsonValue(message.metadata || null),
        },
        create: {
          userId: input.userId,
          agentConversationId: conversation.id,
          conversationId: input.conversationId,
          agentId: input.agent.id,
          messageId: message.id,
          messageIndex,
          role: message.role,
          text: redactSensitiveText(extractMessageText(message)),
          parts: toJsonValue(redactMessageParts(message.parts)),
          metadata: toJsonValue(message.metadata || null),
        },
      }),
    ),
  );
}

export async function startAgentRun(input: StartAgentRunInput): Promise<string | null> {
  if (!input.conversationId) return null;

  const conversation = await ensureAgentConversation({
    userId: input.userId,
    sessionId: input.sessionId,
    visitorId: input.visitorId,
    conversationId: input.conversationId,
    agent: input.agent,
    model: input.model,
    messages: [],
  });

  const run = await prisma.agentRun.create({
    data: {
      userId: input.userId,
      agentConversationId: conversation.id,
      conversationId: input.conversationId,
      agentId: input.agent.id,
      agentVersion: input.agent.version,
      promptVersion: AGENT_EVAL_PROMPT_VERSION,
      model: input.model,
      status: "started",
      inputMessageCount: input.inputMessageCount,
      decision: input.decision ? toJsonValue(input.decision) : undefined,
      metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
    },
  });

  return run.id;
}

export async function finishAgentRun(input: FinishAgentRunInput): Promise<void> {
  const finishedAt = new Date();
  const existing = await prisma.agentRun.findUnique({
    where: { id: input.runId },
    select: { startedAt: true },
  });

  if (!existing) return;

  await prisma.agentRun.update({
    where: { id: input.runId },
    data: {
      status: input.status || "completed",
      outputMessageCount: input.outputMessageCount,
      errorMessage: input.errorMessage,
      metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
      finishedAt,
      latencyMs: Math.max(0, finishedAt.getTime() - existing.startedAt.getTime()),
    },
  });
}

async function ensureAgentConversation(input: EnsureAgentConversationInput) {
  const firstUserText = input.messages.find((message) => message.role === "user")
    ? redactSensitiveText(extractMessageText(input.messages.find((message) => message.role === "user")!)).slice(0, 500)
    : undefined;
  const lastMessageAt = new Date();

  return prisma.agentConversation.upsert({
    where: { conversationId: input.conversationId },
    update: {
      userId: input.userId,
      sessionId: input.sessionId,
      visitorId: input.visitorId,
      agentId: input.agent.id,
      agentVersion: input.agent.version,
      promptVersion: AGENT_EVAL_PROMPT_VERSION,
      model: input.model,
      firstUserText,
      title: firstUserText ? deriveTitle(firstUserText) : undefined,
      metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
      lastMessageAt,
    },
    create: {
      userId: input.userId,
      sessionId: input.sessionId,
      visitorId: input.visitorId,
      conversationId: input.conversationId,
      agentId: input.agent.id,
      agentVersion: input.agent.version,
      promptVersion: AGENT_EVAL_PROMPT_VERSION,
      model: input.model,
      firstUserText,
      title: firstUserText ? deriveTitle(firstUserText) : "新的 Agent 会话",
      metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
      lastMessageAt,
    },
  });
}

function extractMessageText(message: UIMessage): string {
  return (message.parts || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .slice(0, 20000);
}

function redactMessageParts(parts: UIMessage["parts"] | undefined) {
  if (!Array.isArray(parts)) return parts || null;
  return parts.map((part) => {
    if (part.type !== "text") return part;
    return { ...part, text: redactSensitiveText(String(part.text || "")) };
  });
}

function redactSensitiveText(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g, "[REDACTED_PHONE]")
    .replace(/(?:sk|pk|rk|ak)-[A-Za-z0-9_-]{16,}/g, "[REDACTED_TOKEN]")
    .replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*['"]?[^'"\s,;]+/gi, "$1=[REDACTED_SECRET]");
}

function deriveTitle(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 60) || "新的 Agent 会话";
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}
