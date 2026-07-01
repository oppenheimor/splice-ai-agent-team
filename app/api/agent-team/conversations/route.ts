import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import {
  createAgentConversation,
  listAgentConversationSummaries,
} from "@/lib/agent-team/conversations/database-conversations";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  const agentId = request.nextUrl.searchParams.get("agentId") || "";
  const agent = getAgentById(agentId);

  if (!agent) {
    return NextResponse.json({ error: "未知 Agent。" }, { status: 404 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const conversations = await listAgentConversationSummaries({
    userId: user.id,
    agentId: agent.id,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit as number, 1), 500) : undefined,
  });

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  let input: {
    agentId?: string;
    conversationId?: string;
    title?: string;
  };

  try {
    input = (await request.json()) as {
      agentId?: string;
      conversationId?: string;
      title?: string;
    };
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const agent = getAgentById(input.agentId);

  if (!agent) {
    return NextResponse.json({ error: "未知 Agent。" }, { status: 404 });
  }

  if (!input.conversationId) {
    return NextResponse.json({ error: "缺少 conversationId。" }, { status: 400 });
  }

  let conversation;

  try {
    conversation = await createAgentConversation({
      userId: user.id,
      agentId: agent.id,
      conversationId: input.conversationId,
      title: input.title,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败。" },
      { status: 403 },
    );
  }

  return NextResponse.json({ conversation }, { status: 201 });
}
