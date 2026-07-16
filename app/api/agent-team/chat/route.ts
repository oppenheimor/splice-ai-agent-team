import { deepseek } from "@ai-sdk/deepseek";
import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { getCurrentUser } from "@/lib/auth/session";
import { recordTreasureChatMessages } from "@/lib/analytics/treasure-hunt";
import { pickAguiTools } from "@/lib/agent-team/agui/tools";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { buildSystemPrompt } from "@/lib/agent-team/agents/prompts";
import { buildAgentStopCondition, resolveAgentLoopConfig } from "@/lib/agent-team/chat/loop-engine";
import {
  finishAgentRun,
  recordAgentConversationSnapshot,
  startAgentRun,
} from "@/lib/agent-team/evaluation/recording";
import { pickExternalTools } from "@/lib/agent-team/external-tools";
import { buildRuntimeContext } from "@/lib/agent-team/runtime-context";
import { buildDeepDiagnosisManagedContext } from "@/lib/deep-diagnosis/context-manager";
import {
  attachRunToCreditCharge,
  chargeCreditsForAgentRequest,
  InsufficientCreditsError,
  markCreditChargeCompleted,
  refundCreditCharge,
  type ChargedCreditUsage,
} from "@/lib/credits/service";
import { decideNextDeepDiagnosisAction } from "@/lib/deep-diagnosis/decision";
import {
  attachDeepDiagnosisValidationMetadata,
  validateDeepDiagnosisOutput,
} from "@/lib/deep-diagnosis/output-validator";
import { resolveDeepDiagnosisToolGuard } from "@/lib/deep-diagnosis/tool-guard";
import { recordDiagnosisChatMessages } from "@/lib/requirements-diagnosis/chat-messages";
import {
  resolveDiagnosisContext,
  type DiagnosisResolution,
} from "@/lib/requirements-diagnosis/chat-session";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatRequestBody = {
  id?: string;
  agentId?: string;
  conversationId?: string;
  visitorId?: string;
  timeZone?: string;
  quizResultId?: string;
  messages?: UIMessage[];
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "未登录。" }, { status: 401 });
  }

  let input: ChatRequestBody;

  try {
    input = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const agent = getAgentById(input.agentId);
  const messages = Array.isArray(input.messages) ? input.messages : [];

  if (!agent) {
    return Response.json({ error: "未知 Agent。" }, { status: 404 });
  }

  if (!messages.some((message) => message.role === "user")) {
    return Response.json({ error: "请输入消息。" }, { status: 400 });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: "服务端缺少 DEEPSEEK_API_KEY，请先配置环境变量。" }, { status: 500 });
  }

  let runId: string | null = null;
  let creditCharge: ChargedCreditUsage | null = null;

  try {
    const diagnosis = agent.id === "deep-diagnosis" && input.quizResultId
      ? await resolveDiagnosisContext(user.id, input.quizResultId, input.conversationId || input.id)
      : null;
    const conversationId = diagnosis?.conversationId || input.conversationId || input.id;
    const sessionId = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    if (!conversationId) {
      return Response.json({ error: "缺少 conversationId。" }, { status: 400 });
    }

    creditCharge = await chargeCreditsForAgentRequest({
      userId: user.id,
      agentId: agent.id,
      conversationId,
      model,
      messages,
    });

    await recordChatMessages({
      agent,
      userId: user.id,
      sessionId,
      visitorId: input.visitorId,
      conversationId,
      diagnosis,
      model,
      messages,
    });

    const loopConfig = resolveAgentLoopConfig(agent.id);
    const managedContext = loopConfig.contextManagement ? buildDeepDiagnosisManagedContext(messages) : "";
    const tools = {
      ...pickAguiTools(agent.tools),
      ...pickExternalTools(agent.externalTools),
    };
    const deepDiagnosisDecision = agent.id === "deep-diagnosis" ? decideNextDeepDiagnosisAction(messages) : null;
    const deepDiagnosisToolGuard = deepDiagnosisDecision
      ? resolveDeepDiagnosisToolGuard(tools, deepDiagnosisDecision)
      : null;
    runId = await startAgentRun({
      userId: user.id,
      sessionId,
      visitorId: input.visitorId,
      conversationId,
      agent,
      model,
      inputMessageCount: messages.length,
      decision: deepDiagnosisDecision,
    });
    if (runId) {
      await attachRunToCreditCharge({
        usageRecordId: creditCharge.usageRecordId,
        ledgerEntryId: creditCharge.ledgerEntryId,
        agentRunId: runId,
      });
    }
    const systemMessages = [
      { role: "system" as const, content: buildSystemPrompt(agent, diagnosis?.context) },
      { role: "system" as const, content: buildRuntimeContext({ timeZone: input.timeZone }) },
    ];

    if (managedContext) {
      systemMessages.push({ role: "system", content: managedContext });
    }

    const result = streamText({
      model: deepseek(model),
      instructions: systemMessages,
      messages: await convertToModelMessages(compactUIMessages(messages), {
        tools,
        ignoreIncompleteToolCalls: true,
      }),
      tools,
      activeTools: deepDiagnosisToolGuard?.activeTools,
      prepareStep: deepDiagnosisToolGuard
        ? () => ({ activeTools: deepDiagnosisToolGuard.activeTools })
        : undefined,
      stopWhen: buildAgentStopCondition(agent.id),
      abortSignal: request.signal,
      temperature: 0.72,
      providerOptions: {
        deepseek: {
          thinking: { type: model.includes("v4") || model.includes("reasoner") ? "enabled" : "disabled" },
          reasoningEffort: "high",
        },
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onEnd: async ({ messages: finishedMessages }) => {
        const messagesToPersist = deepDiagnosisDecision
          ? withDeepDiagnosisValidationMetadata(finishedMessages, deepDiagnosisDecision)
          : finishedMessages;

        await recordChatMessages({
          agent,
          userId: user.id,
          sessionId,
          visitorId: input.visitorId,
          conversationId,
          diagnosis,
          model,
          messages: messagesToPersist,
        });

        if (runId) {
          await finishAgentRun({
            runId,
            outputMessageCount: messagesToPersist.length,
            status: "completed",
          });
        }

        if (creditCharge) {
          await markCreditChargeCompleted(creditCharge.usageRecordId);
        }
      },
      consumeSseStream: consumeStream,
    });
  } catch (error) {
    if (creditCharge) {
      await refundCreditCharge({
        userId: user.id,
        ledgerEntryId: creditCharge.ledgerEntryId,
        usageRecordId: creditCharge.usageRecordId,
        reason: "Agent 生成失败，退回本次预扣积分",
      });
    }

    if (runId) {
      await finishAgentRun({
        runId,
        outputMessageCount: 0,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "生成失败",
      });
    }

    if (error instanceof InsufficientCreditsError) {
      return Response.json(
        {
          error: `积分余额不足，本次预计需要 ${error.requiredCredits} 积分，当前余额 ${error.currentBalance} 积分。`,
          requiredCredits: error.requiredCredits,
          currentBalance: error.currentBalance,
        },
        { status: 402 },
      );
    }

    console.error("[agent-team] chat generation failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "生成失败，请稍后再试。" }, { status: 500 });
  }
}

async function recordChatMessages(input: {
  agent: NonNullable<ReturnType<typeof getAgentById>>;
  userId: string;
  sessionId: string | undefined;
  visitorId: string | undefined;
  conversationId: string | undefined;
  diagnosis: DiagnosisResolution | null;
  model: string | undefined;
  messages: UIMessage[];
}): Promise<void> {
  if (!input.conversationId) {
    return;
  }

  await recordAgentConversationSnapshot({
    userId: input.userId,
    sessionId: input.sessionId,
    visitorId: input.visitorId,
    conversationId: input.conversationId,
    agent: input.agent,
    model: input.model,
    messages: input.messages,
  });

  if (input.diagnosis) {
    await recordDiagnosisChatMessages({
      userId: input.userId,
      chatSessionId: input.diagnosis.chatSessionId,
      conversationId: input.conversationId,
      messages: input.messages,
    });
    return;
  }

  if (input.agent.id !== "treasure-hunt") {
    return;
  }

  await recordTreasureChatMessages({
    userId: input.userId,
    sessionId: input.sessionId,
    visitorId: input.visitorId,
    conversationId: input.conversationId,
    messages: input.messages,
  });
}

function compactUIMessages(messages: UIMessage[]): UIMessage[] {
  return messages.slice(-14).map((message) => ({
    ...message,
    parts: Array.isArray(message.parts)
      ? message.parts.map((part) => (part.type === "text" ? { ...part, text: String(part.text || "").slice(0, 5000) } : part))
      : message.parts,
  }));
}

function withDeepDiagnosisValidationMetadata(
  messages: UIMessage[],
  decision: ReturnType<typeof decideNextDeepDiagnosisAction>,
): UIMessage[] {
  const lastAssistantIndex = messages.findLastIndex((message) => message.role === "assistant");

  if (lastAssistantIndex === -1) {
    return messages;
  }

  const validation = validateDeepDiagnosisOutput({
    responseMessage: messages[lastAssistantIndex],
    decision,
    conversationMessages: messages,
  });

  if (!validation.passed) {
    console.warn("[deep-diagnosis] output validation failed", {
      score: validation.score,
      violations: validation.violations,
    });
  }

  return messages.map((message, index) => (
    index === lastAssistantIndex
      ? attachDeepDiagnosisValidationMetadata(message, validation)
      : message
  ));
}
