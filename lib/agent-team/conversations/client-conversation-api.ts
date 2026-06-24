import type { AgentConversation } from "@/lib/agent-team/agents/types";
import { csrfFetch } from "@/lib/security/csrf-client";

export async function fetchAgentConversationSummaries(
  agentId: string,
): Promise<AgentConversation[]> {
  const response = await fetch(
    `/agent-team/api/agent-team/conversations?agentId=${encodeURIComponent(agentId)}`,
    { cache: "no-store" },
  );

  if (!response.ok) return [];

  const payload = await response.json() as {
    conversations?: Array<{
      id: string;
      agentId: string;
      title: string;
      messageCount: number;
      createdAt: string;
      updatedAt: string;
      lastMessageAt: string;
    }>;
  };

  return (payload.conversations || []).map((conversation) => ({
    id: conversation.id,
    agentId: conversation.agentId,
    title: conversation.title,
    messages: [],
    createdAt: conversation.createdAt,
    updatedAt: conversation.lastMessageAt || conversation.updatedAt,
    metadata: { messageCount: conversation.messageCount },
  }));
}

export async function deleteAgentConversation(
  agentId: string,
  conversationId: string,
) {
  await csrfFetch(
    `/agent-team/api/agent-team/conversations/${encodeURIComponent(conversationId)}?agentId=${encodeURIComponent(agentId)}`,
    { method: "DELETE" },
  );
}

export async function renameAgentConversation(
  agentId: string,
  conversationId: string,
  title: string,
): Promise<AgentConversation | null> {
  const response = await csrfFetch(
    `/agent-team/api/agent-team/conversations/${encodeURIComponent(conversationId)}?agentId=${encodeURIComponent(agentId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
  );

  if (!response.ok) return null;

  const payload = await response.json() as {
    conversation?: {
      id: string;
      agentId: string;
      title: string;
      messageCount: number;
      createdAt: string;
      updatedAt: string;
      lastMessageAt: string;
    };
  };

  if (!payload.conversation) return null;

  return {
    id: payload.conversation.id,
    agentId: payload.conversation.agentId,
    title: payload.conversation.title,
    messages: [],
    createdAt: payload.conversation.createdAt,
    updatedAt: payload.conversation.lastMessageAt || payload.conversation.updatedAt,
    metadata: { messageCount: payload.conversation.messageCount },
  };
}
