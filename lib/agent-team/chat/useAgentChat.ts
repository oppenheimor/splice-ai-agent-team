"use client";

import { useChat } from "@ai-sdk/react";
import type { ChatAddToolOutputFunction, UIMessage } from "ai";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AgentConversation, AgentManifest } from "@/lib/agent-team/agents/types";
import { createId } from "@/lib/agent-team/id";
import { csrfFetch } from "@/lib/security/csrf-client";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  saveConversation,
} from "@/lib/agent-team/storage/local-conversations";

type UseAgentChatOptions = {
  conversationId?: string;
  persistence?: "local" | "database";
  requestBody?: Record<string, unknown>;
};

export type UseAgentChatResult = {
  messages: UIMessage[];
  conversations: AgentConversation[];
  activeConversation: AgentConversation | null;
  input: string;
  setInput: (value: string) => void;
  isBusy: boolean;
  error: Error | undefined;
  isLoadingConversations: boolean;
  isLoadingActiveConversation: boolean;
  sendText: (text?: string) => void;
  stop: () => void;
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
  startNewConversation: () => AgentConversation;
  openConversationById: (conversationId: string) => Promise<void>;
  switchConversation: (conversation: AgentConversation) => Promise<void>;
  removeConversation: (conversationId: string) => Promise<AgentConversation | null>;
  refreshConversations: () => Promise<void>;
  renameConversation: (conversationId: string, title: string) => Promise<void>;
};

export function useAgentChat(agent: AgentManifest, options: UseAgentChatOptions = {}): UseAgentChatResult {
  const persistence = options.persistence || "local";
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AgentConversation | null>(null);
  const [input, setInput] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(persistence === "database");
  const [isLoadingActiveConversation, setIsLoadingActiveConversation] = useState(false);
  const hasLoadedDatabaseConversationsRef = useRef(false);
  const activeConversationRequestRef = useRef(0);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/agent-team/api/agent-team/chat",
        fetch: fetchWithReadableChatError,
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            id,
            messages,
            agentId: agent.id,
            conversationId: activeConversation?.id || id,
            visitorId,
            timeZone: getClientTimeZone(),
            ...options.requestBody,
          },
        }),
      }),
    [activeConversation?.id, agent.id, options.requestBody, visitorId],
  );

  const { messages, sendMessage, setMessages, status, stop, error, addToolOutput } = useChat<UIMessage>({
    id: activeConversation?.id,
    messages: activeConversation?.messages || [],
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onFinish: ({ messages: finishedMessages }) => {
      notifyCreditsChanged();

      if (!activeConversation) return;

      if (persistence === "database") {
        const next = {
          ...activeConversation,
          messages: finishedMessages,
          updatedAt: new Date().toISOString(),
        };
        setActiveConversation(next);
        setConversations((current) => mergeConversationSummary(current, next));
        void refreshDatabaseConversationList(agent.id, next, setConversations);
        return;
      }

      const saved = saveConversation({ ...activeConversation, messages: finishedMessages });
      setActiveConversation(saved);
      setConversations(listConversations(agent.id));
    },
    onError: (chatError) => {
      notifyCreditsChanged();

      if (!activeConversation) return;
      const fallback: UIMessage = {
        id: createId("msg"),
        role: "assistant",
        parts: [{ type: "text", text: chatError?.message || "生成失败，请稍后再试。" }],
      };

      if (persistence === "database") {
        const next = {
          ...activeConversation,
          messages: [...messages, fallback],
          updatedAt: new Date().toISOString(),
        };
        setActiveConversation(next);
        setConversations((current) => mergeConversationSummary(current, next));
        return;
      }

      const saved = saveConversation({ ...activeConversation, messages: [...messages, fallback] });
      setActiveConversation(saved);
      setConversations(listConversations(agent.id));
    },
  });

  const isBusy = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (persistence === "database") return;

    queueMicrotask(() => {
      setVisitorId(getVisitorId());
      const existing = listConversations(agent.id);
      const initial =
        (options.conversationId ? getConversation(agent.id, options.conversationId) : undefined) ||
        (options.conversationId ? saveConversation(createConversation(agent.id, options.conversationId)) : undefined) ||
        existing[0] ||
        saveConversation(createConversation(agent.id));
      setConversations(listConversations(agent.id));
      setActiveConversation(initial);
      setMessages(initial.messages || []);
    });
  }, [agent.id, options.conversationId, persistence, setMessages]);

  useEffect(() => {
    if (persistence !== "database") return;

    let cancelled = false;

    async function initializeDatabaseConversation() {
      setIsLoadingConversations(!hasLoadedDatabaseConversationsRef.current);
      setIsLoadingActiveConversation(false);
      setVisitorId(getVisitorId());
      const summaries = await fetchDatabaseConversations(agent.id);
      const selectedSummary = options.conversationId
        ? summaries.find((conversation) => conversation.id === options.conversationId)
        : summaries[0];
      const selected = await resolveInitialDatabaseConversation({
        agentId: agent.id,
        conversationId: options.conversationId,
        selectedSummary,
        setIsLoadingActiveConversation,
      });
      const initial = selected ||
        (options.conversationId
          ? await createDatabaseConversation(agent.id, options.conversationId)
          : createConversation(agent.id));

      if (cancelled) return;
      hasLoadedDatabaseConversationsRef.current = true;
      setConversations(mergeConversationSummary(summaries, initial));
      setActiveConversation(initial);
      setMessages(initial.messages || []);
      setIsLoadingActiveConversation(false);
      setIsLoadingConversations(false);
    }

    initializeDatabaseConversation().catch(() => {
      if (cancelled) return;
      const fallback = createConversation(agent.id, options.conversationId);
      hasLoadedDatabaseConversationsRef.current = true;
      setConversations([]);
      setActiveConversation(fallback);
      setMessages([]);
      setIsLoadingActiveConversation(false);
      setIsLoadingConversations(false);
    });

    return () => {
      cancelled = true;
    };
  }, [agent.id, options.conversationId, persistence, setMessages]);

  useEffect(() => {
    if (!activeConversation) return;
    setMessages(activeConversation.messages || []);
  }, [activeConversation, setMessages]);

  useEffect(() => {
    if (persistence === "database") return;
    if (!activeConversation || !isBusy) return;
    const timer = window.setTimeout(() => {
      saveConversation({ ...activeConversation, messages });
      setConversations(listConversations(agent.id));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [activeConversation, agent.id, isBusy, messages, persistence]);

  function startNewConversation() {
    if (isBusy) stop();

    if (persistence === "database") {
      const next = createConversation(agent.id);
      setInput("");
      setActiveConversation(next);
      setConversations((current) => mergeConversationSummary(current, next));
      setMessages([]);
      setIsLoadingActiveConversation(false);
      void createDatabaseConversation(agent.id, next.id).then((created) => {
        setActiveConversation(created);
        setConversations((current) => mergeConversationSummary(current, created));
      });
      return next;
    }

    const next = saveConversation(createConversation(agent.id));
    setInput("");
    setActiveConversation(next);
    setConversations(listConversations(agent.id));
    setMessages([]);
    return next;
  }

  async function switchConversation(conversation: AgentConversation) {
    if (isBusy) stop();

    if (persistence === "database") {
      const requestId = activeConversationRequestRef.current + 1;
      activeConversationRequestRef.current = requestId;
      setInput("");
      setActiveConversation(conversation);
      setMessages([]);
      const expectedMessageCount = getConversationMessageCount(conversation);
      setIsLoadingActiveConversation(expectedMessageCount > 0);

      if (expectedMessageCount === 0) {
        return;
      }

      const detail = await fetchDatabaseConversation(agent.id, conversation.id);
      if (activeConversationRequestRef.current !== requestId) return;

      const next = detail || conversation;

      setActiveConversation(next);
      setConversations((current) => mergeConversationSummary(current, next));
      setMessages(next.messages || []);
      setIsLoadingActiveConversation(false);
      return;
    }

    setActiveConversation(conversation);
    setMessages(conversation.messages || []);
    setIsLoadingActiveConversation(false);
  }

  async function openConversationById(conversationId: string) {
    const existing = conversations.find((conversation) => conversation.id === conversationId);

    if (existing) {
      await switchConversation(existing);
      return;
    }

    if (persistence !== "database") return;

    const requestId = activeConversationRequestRef.current + 1;
    activeConversationRequestRef.current = requestId;
    setInput("");
    setMessages([]);
    setIsLoadingActiveConversation(true);

    const detail = await fetchDatabaseConversation(agent.id, conversationId);
    if (activeConversationRequestRef.current !== requestId) return;

    if (!detail) {
      setIsLoadingActiveConversation(false);
      return;
    }

    setActiveConversation(detail);
    setConversations((current) => mergeConversationSummary(current, detail));
    setMessages(detail.messages || []);
    setIsLoadingActiveConversation(false);
  }

  async function removeConversation(conversationId: string) {
    if (isBusy) stop();

    if (persistence === "database") {
      await deleteDatabaseConversation(agent.id, conversationId);
      const rest = await fetchDatabaseConversations(agent.id);
      const nextSummary = rest[0] || null;
      const next = nextSummary ? await fetchDatabaseConversation(agent.id, nextSummary.id) || nextSummary : null;
      setConversations(rest);
      setActiveConversation(next);
      setMessages(next?.messages || []);
      setIsLoadingActiveConversation(false);
      return next;
    }

    deleteConversation(conversationId);
    const rest = listConversations(agent.id);
    const next = rest[0] || null;
    setConversations(rest);
    setActiveConversation(next);
    setMessages(next?.messages || []);
    setIsLoadingActiveConversation(false);
    return next;
  }

  function sendText(content = input) {
    const text = content.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  async function refreshConversations() {
    if (persistence !== "database") {
      setConversations(listConversations(agent.id));
      return;
    }

    const summaries = await fetchDatabaseConversations(agent.id);
    setConversations(
      activeConversation ? mergeConversationSummary(summaries, activeConversation) : summaries,
    );
  }

  async function renameConversation(conversationId: string, title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (persistence === "database") {
      const updated = await updateDatabaseConversationTitle(agent.id, conversationId, trimmedTitle);
      if (!updated) return;
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
              ...conversation,
              title: updated.title,
              updatedAt: updated.updatedAt,
            }
            : conversation,
        ),
      );
      setActiveConversation((current) =>
        current?.id === conversationId
          ? {
            ...current,
            title: updated.title,
            updatedAt: updated.updatedAt,
          }
          : current,
      );
      return;
    }

    const conversation = getConversation(agent.id, conversationId);
    if (!conversation) return;
    const saved = saveConversation({ ...conversation, title: trimmedTitle });
    setConversations(listConversations(agent.id));
    setActiveConversation((current) => (current?.id === conversationId ? saved : current));
  }

  return {
    messages,
    conversations,
    activeConversation,
    input,
    setInput,
    isBusy,
    error,
    isLoadingConversations,
    isLoadingActiveConversation,
    sendText,
    stop,
    addToolOutput,
    startNewConversation,
    openConversationById,
    switchConversation,
    removeConversation,
    refreshConversations,
    renameConversation,
  };
}

async function fetchWithReadableChatError(input: RequestInfo | URL, init?: RequestInit) {
  const response = await csrfFetch(input, init);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.clone().json() as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // 流式接口失败时可能返回纯文本，解析失败后继续读取文本即可。
  }

  const text = await response.text().catch(() => "");
  return text.trim() || `请求失败：${response.status}`;
}

function notifyCreditsChanged() {
  window.dispatchEvent(new Event("credits:changed"));
}

async function fetchDatabaseConversations(agentId: string): Promise<AgentConversation[]> {
  const response = await fetch(`/agent-team/api/agent-team/conversations?agentId=${encodeURIComponent(agentId)}`, {
    cache: "no-store",
  });

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

async function fetchDatabaseConversation(agentId: string, conversationId: string): Promise<AgentConversation | null> {
  const response = await fetch(
    `/agent-team/api/agent-team/conversations/${encodeURIComponent(conversationId)}?agentId=${encodeURIComponent(agentId)}`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;

  const payload = await response.json() as {
    conversation?: {
      id: string;
      agentId: string;
      title: string;
      messages: UIMessage[];
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
    messages: payload.conversation.messages || [],
    createdAt: payload.conversation.createdAt,
    updatedAt: payload.conversation.lastMessageAt || payload.conversation.updatedAt,
    metadata: { messageCount: payload.conversation.messageCount },
  };
}

async function createDatabaseConversation(agentId: string, conversationId: string): Promise<AgentConversation> {
  const response = await csrfFetch("/agent-team/api/agent-team/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId,
      conversationId,
      title: "新的 Agent 会话",
    }),
  });

  if (!response.ok) {
    return createConversation(agentId, conversationId);
  }

  const payload = await response.json() as {
    conversation?: {
      id: string;
      agentId: string;
      title: string;
      messages?: UIMessage[];
      messageCount: number;
      createdAt: string;
      updatedAt: string;
      lastMessageAt: string;
    };
  };

  if (!payload.conversation) {
    return createConversation(agentId, conversationId);
  }

  return {
    id: payload.conversation.id,
    agentId: payload.conversation.agentId,
    title: payload.conversation.title,
    messages: payload.conversation.messages || [],
    createdAt: payload.conversation.createdAt,
    updatedAt: payload.conversation.lastMessageAt || payload.conversation.updatedAt,
    metadata: { messageCount: payload.conversation.messageCount },
  };
}

async function updateDatabaseConversationTitle(
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

async function deleteDatabaseConversation(agentId: string, conversationId: string): Promise<void> {
  await csrfFetch(
    `/agent-team/api/agent-team/conversations/${encodeURIComponent(conversationId)}?agentId=${encodeURIComponent(agentId)}`,
    { method: "DELETE" },
  );
}

function mergeConversationSummary(
  summaries: AgentConversation[],
  activeConversation: AgentConversation,
): AgentConversation[] {
  const existing = summaries.find((conversation) => conversation.id === activeConversation.id);
  const activeSummary = {
    ...activeConversation,
    messages: activeConversation.messages || [],
    title: existing?.title || activeConversation.title,
    updatedAt: existing?.updatedAt || activeConversation.updatedAt,
    metadata: existing?.metadata || activeConversation.metadata,
  };

  if (existing) {
    return summaries.map((conversation) =>
      conversation.id === activeConversation.id ? activeSummary : conversation,
    );
  }

  return [activeSummary, ...summaries];
}

function getConversationMessageCount(conversation: AgentConversation): number {
  const metadataCount = conversation.metadata?.messageCount;
  if (typeof metadataCount === "number") return metadataCount;
  return conversation.messages?.length || 0;
}

async function resolveInitialDatabaseConversation({
  agentId,
  conversationId,
  selectedSummary,
  setIsLoadingActiveConversation,
}: {
  agentId: string;
  conversationId?: string;
  selectedSummary?: AgentConversation;
  setIsLoadingActiveConversation: (isLoading: boolean) => void;
}): Promise<AgentConversation | null | undefined> {
  if (selectedSummary && getConversationMessageCount(selectedSummary) === 0) {
    return selectedSummary;
  }

  if (!conversationId) return selectedSummary;

  setIsLoadingActiveConversation(true);
  return fetchDatabaseConversation(agentId, conversationId);
}

async function refreshDatabaseConversationList(
  agentId: string,
  activeConversation: AgentConversation,
  setConversations: (conversations: AgentConversation[]) => void,
): Promise<void> {
  const summaries = await fetchDatabaseConversations(agentId);
  setConversations(mergeConversationSummary(summaries, activeConversation));
}

function getVisitorId(): string {
  const key = "agent-team.visitor.v1";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = createId("visitor");
  window.localStorage.setItem(key, next);
  return next;
}

function getClientTimeZone(): string | undefined {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
