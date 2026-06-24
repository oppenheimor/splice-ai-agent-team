"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentConversation, AgentManifest } from "@/lib/agent-team/agents/types";
import { csrfFetch } from "@/lib/security/csrf-client";
import { cn } from "@/lib/utils";
import { MobileConversationHistoryButton } from "./DeepDiagnosisMobileNavbar";
import {
  MobileConversationDrawer,
  SidebarConversationList,
} from "./DeepDiagnosisNavigation";

export function DeepDiagnosisLandingHistory({
  agent,
}: {
  agent: AgentManifest;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const refreshConversations = useCallback(async () => {
    setLoading(true);
    setConversations(await fetchConversationSummaries(agent.id));
    setLoading(false);
  }, [agent.id]);

  function handleOpen() {
    setOpen(true);
    void refreshConversations();
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleDeleteConversation(conversationIdToDelete: string) {
    await deleteConversation(agent.id, conversationIdToDelete);
    await refreshConversations();
  }

  async function handleRenameConversation(conversationIdToRename: string, title: string) {
    const updated = await renameConversation(agent.id, conversationIdToRename, title);
    if (!updated) return;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationIdToRename
          ? { ...conversation, title: updated.title, updatedAt: updated.updatedAt }
          : conversation,
      ),
    );
  }

  return (
    <>
      <MobileConversationHistoryButton onOpen={handleOpen} />
      <DesktopConversationHistoryPopover
        ref={popoverRef}
        open={open}
        conversations={conversations}
        loading={loading}
        onOpen={(conversation) => {
          setOpen(false);
          router.push(`/deep-diagnosis/chat/${conversation.id}`);
        }}
        onDelete={(id) => void handleDeleteConversation(id)}
        onRename={(id, title) => void handleRenameConversation(id, title)}
      />
      <MobileConversationDrawer
        open={open}
        conversations={conversations}
        loading={loading}
        onClose={() => setOpen(false)}
        onOpen={(conversation) => {
          setOpen(false);
          router.push(`/deep-diagnosis/chat/${conversation.id}`);
        }}
        onDelete={(id) => void handleDeleteConversation(id)}
        onRename={(id, title) => void handleRenameConversation(id, title)}
      />
    </>
  );
}

function DesktopConversationHistoryPopover({
  ref,
  open,
  conversations,
  loading,
  onOpen,
  onDelete,
  onRename,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  conversations: AgentConversation[];
  loading: boolean;
  onOpen: (conversation: AgentConversation) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, title: string) => void;
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed right-4 top-16 z-50 hidden h-[min(520px,calc(100vh-5rem))] w-80 rounded-xl border border-[#e6e6e6] bg-[#f7f7f7] p-3 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_24px_60px_-32px_rgba(0,0,0,0.38)] lg:grid",
        "motion-safe:transition-[opacity,transform] motion-safe:duration-150 motion-safe:ease-out motion-reduce:transition-none",
        open
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-1 opacity-0",
      )}
    >
      <SidebarConversationList
        conversations={conversations}
        loading={loading}
        onOpen={onOpen}
        onDelete={onDelete}
        onRename={onRename}
      />
    </div>
  );
}

async function fetchConversationSummaries(agentId: string): Promise<AgentConversation[]> {
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

async function deleteConversation(agentId: string, conversationId: string) {
  await csrfFetch(
    `/agent-team/api/agent-team/conversations/${encodeURIComponent(conversationId)}?agentId=${encodeURIComponent(agentId)}`,
    { method: "DELETE" },
  );
}

async function renameConversation(
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
