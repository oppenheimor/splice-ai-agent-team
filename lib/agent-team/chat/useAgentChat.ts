"use client";

import { useChat } from "@ai-sdk/react";
import type { ChatAddToolOutputFunction, UIMessage } from "ai";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useEffect, useMemo, useState } from "react";
import type { AgentConversation, AgentManifest } from "@/lib/agent-team/agents/types";
import { createId } from "@/lib/agent-team/id";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  saveConversation,
} from "@/lib/agent-team/storage/local-conversations";

type UseAgentChatOptions = {
  conversationId?: string;
};

export type UseAgentChatResult = {
  messages: UIMessage[];
  conversations: AgentConversation[];
  activeConversation: AgentConversation | null;
  input: string;
  setInput: (value: string) => void;
  isBusy: boolean;
  error: Error | undefined;
  sendText: (text?: string) => void;
  stop: () => void;
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
  startNewConversation: () => AgentConversation;
  switchConversation: (conversation: AgentConversation) => void;
  removeConversation: (conversationId: string) => AgentConversation | null;
};

export function useAgentChat(agent: AgentManifest, options: UseAgentChatOptions = {}): UseAgentChatResult {
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AgentConversation | null>(null);
  const [input, setInput] = useState("");
  const [visitorId, setVisitorId] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/agent-team/api/agent-team/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            id,
            messages,
            agentId: agent.id,
            conversationId: activeConversation?.id || id,
            visitorId,
            timeZone: getClientTimeZone(),
          },
        }),
      }),
    [activeConversation?.id, agent.id, visitorId],
  );

  const { messages, sendMessage, setMessages, status, stop, error, addToolOutput } = useChat<UIMessage>({
    id: activeConversation?.id,
    messages: activeConversation?.messages || [],
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onFinish: ({ messages: finishedMessages }) => {
      if (!activeConversation) return;
      const saved = saveConversation({ ...activeConversation, messages: finishedMessages });
      setActiveConversation(saved);
      setConversations(listConversations(agent.id));
    },
    onError: (chatError) => {
      if (!activeConversation) return;
      const fallback: UIMessage = {
        id: createId("msg"),
        role: "assistant",
        parts: [{ type: "text", text: chatError?.message || "生成失败，请稍后再试。" }],
      };
      const saved = saveConversation({ ...activeConversation, messages: [...messages, fallback] });
      setActiveConversation(saved);
      setConversations(listConversations(agent.id));
    },
  });

  const isBusy = status === "streaming" || status === "submitted";

  useEffect(() => {
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
  }, [agent.id, options.conversationId, setMessages]);

  useEffect(() => {
    if (!activeConversation) return;
    setMessages(activeConversation.messages || []);
  }, [activeConversation, setMessages]);

  useEffect(() => {
    if (!activeConversation || !isBusy) return;
    const timer = window.setTimeout(() => {
      saveConversation({ ...activeConversation, messages });
      setConversations(listConversations(agent.id));
    }, 260);
    return () => window.clearTimeout(timer);
  }, [activeConversation, agent.id, isBusy, messages]);

  function startNewConversation() {
    if (isBusy) stop();
    const next = saveConversation(createConversation(agent.id));
    setInput("");
    setActiveConversation(next);
    setConversations(listConversations(agent.id));
    setMessages([]);
    return next;
  }

  function switchConversation(conversation: AgentConversation) {
    if (isBusy) stop();
    setActiveConversation(conversation);
    setMessages(conversation.messages || []);
  }

  function removeConversation(conversationId: string) {
    if (isBusy) stop();
    deleteConversation(conversationId);
    const rest = listConversations(agent.id);
    const next = rest[0] || null;
    setConversations(rest);
    setActiveConversation(next);
    setMessages(next?.messages || []);
    return next;
  }

  function sendText(content = input) {
    const text = content.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  return {
    messages,
    conversations,
    activeConversation,
    input,
    setInput,
    isBusy,
    error,
    sendText,
    stop,
    addToolOutput,
    startNewConversation,
    switchConversation,
    removeConversation,
  };
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
