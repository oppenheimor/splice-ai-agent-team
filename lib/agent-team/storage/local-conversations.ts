"use client";

import type { UIMessage } from "ai";
import type { AgentConversation, ConversationStore } from "@/lib/agent-team/agents/types";

export const STORAGE_KEY = "agent-team.chat.v1";

export function createConversation(agentId: string, conversationId?: string): AgentConversation {
  const now = new Date().toISOString();
  return {
    id: conversationId || `${agentId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    agentId,
    title: "新的 Agent 会话",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function readStore(): ConversationStore {
  if (typeof window === "undefined") return { conversations: [] };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: [] };
    const parsed = JSON.parse(raw) as Partial<ConversationStore>;
    if (!Array.isArray(parsed.conversations)) return { conversations: [] };
    return { conversations: parsed.conversations };
  } catch {
    return { conversations: [] };
  }
}

export function writeStore(store: ConversationStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function listConversations(agentId: string): AgentConversation[] {
  return readStore()
    .conversations.filter((conversation) => conversation.agentId === agentId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getConversation(agentId: string, conversationId: string): AgentConversation | undefined {
  return readStore().conversations.find(
    (conversation) => conversation.agentId === agentId && conversation.id === conversationId,
  );
}

export function saveConversation(conversation: AgentConversation): AgentConversation {
  const store = readStore();
  const next = {
    ...conversation,
    title: deriveTitle(conversation),
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = store.conversations.findIndex((item) => item.id === conversation.id);
  if (existingIndex >= 0) {
    store.conversations[existingIndex] = next;
  } else {
    store.conversations.push(next);
  }
  writeStore(store);
  return next;
}

export function deleteConversation(conversationId: string): void {
  const store = readStore();
  writeStore({
    conversations: store.conversations.filter((conversation) => conversation.id !== conversationId),
  });
}

function deriveTitle(conversation: AgentConversation): string {
  const firstUserMessage = conversation.messages.find((message) => message.role === "user");
  const text = getMessageText(firstUserMessage);
  if (!text) return conversation.title || "新的 Agent 会话";
  return text.trim().slice(0, 18) || "新的 Agent 会话";
}

export function getMessageText(message: UIMessage | undefined): string {
  if (!message) return "";
  return (message.parts || [])
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text || "" : ""))
    .join("");
}
