import { deepseek } from "@ai-sdk/deepseek";
import { consumeStream, convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { getCurrentUser } from "@/lib/auth/session";
import { recordTreasureChatMessages } from "@/lib/analytics/treasure-hunt";
import { pickAguiTools } from "@/lib/agent-team/agui/tools";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { buildSystemPrompt } from "@/lib/agent-team/agents/prompts";
import { buildRuntimeContext } from "@/lib/agent-team/runtime-context";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatRequestBody = {
  id?: string;
  agentId?: string;
  conversationId?: string;
  visitorId?: string;
  timeZone?: string;
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

  try {
    const conversationId = input.conversationId || input.id;
    const sessionId = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (conversationId) {
      await recordTreasureChatMessages({
        userId: user.id,
        sessionId,
        visitorId: input.visitorId,
        conversationId,
        messages,
      });
    }

    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    const tools = pickAguiTools(agent.tools);
    const result = streamText({
      model: deepseek(model),
      system: [
        { role: "system", content: buildSystemPrompt(agent) },
        { role: "system", content: buildRuntimeContext({ timeZone: input.timeZone }) },
      ],
      messages: await convertToModelMessages(compactUIMessages(messages), {
        tools,
        ignoreIncompleteToolCalls: true,
      }),
      tools,
      stopWhen: stepCountIs(4),
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
      onFinish: async ({ messages: finishedMessages }) => {
        if (!conversationId) return;
        await recordTreasureChatMessages({
          userId: user.id,
          sessionId,
          visitorId: input.visitorId,
          conversationId,
          messages: finishedMessages,
        });
      },
      consumeSseStream: consumeStream,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "生成失败，请稍后再试。" }, { status: 500 });
  }
}

function compactUIMessages(messages: UIMessage[]): UIMessage[] {
  return messages.slice(-14).map((message) => ({
    ...message,
    parts: Array.isArray(message.parts)
      ? message.parts.map((part) => (part.type === "text" ? { ...part, text: String(part.text || "").slice(0, 5000) } : part))
      : message.parts,
  }));
}
