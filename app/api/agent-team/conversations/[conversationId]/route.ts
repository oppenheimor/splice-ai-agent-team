import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import {
  getAgentConversationDetail,
  softDeleteAgentConversation,
  updateAgentConversationTitle,
} from "@/lib/agent-team/conversations/database-conversations";
import { csrfErrorResponse, validateCsrfRequest } from "@/lib/security/csrf";

export const runtime = "nodejs";

type ConversationRouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(request: NextRequest, context: ConversationRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  const agent = getAgentById(request.nextUrl.searchParams.get("agentId") || "");

  if (!agent) {
    return NextResponse.json({ error: "未知 Agent。" }, { status: 404 });
  }

  const { conversationId } = await context.params;
  const conversation = await getAgentConversationDetail({
    userId: user.id,
    agentId: agent.id,
    conversationId,
  });

  if (!conversation) {
    return NextResponse.json({ error: "会话不存在。" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}

export async function PATCH(request: NextRequest, context: ConversationRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  const agent = getAgentById(request.nextUrl.searchParams.get("agentId") || "");

  if (!agent) {
    return NextResponse.json({ error: "未知 Agent。" }, { status: 404 });
  }

  let input: { title?: string };

  try {
    input = (await request.json()) as { title?: string };
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  if (!(await validateCsrfRequest(request, { jsonBody: input }))) {
    return csrfErrorResponse();
  }

  const { conversationId } = await context.params;

  try {
    const conversation = await updateAgentConversationTitle({
      userId: user.id,
      agentId: agent.id,
      conversationId,
      title: input.title || "",
    });

    if (!conversation) {
      return NextResponse.json({ error: "会话不存在。" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败。" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, context: ConversationRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  const agent = getAgentById(request.nextUrl.searchParams.get("agentId") || "");

  if (!agent) {
    return NextResponse.json({ error: "未知 Agent。" }, { status: 404 });
  }

  if (!(await validateCsrfRequest(request))) {
    return csrfErrorResponse();
  }

  const { conversationId } = await context.params;
  const deleted = await softDeleteAgentConversation({
    userId: user.id,
    agentId: agent.id,
    conversationId,
  });

  if (!deleted) {
    return NextResponse.json({ error: "会话不存在。" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
