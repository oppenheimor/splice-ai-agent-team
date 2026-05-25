"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTreasureAnalytics } from "@/lib/analytics/useTreasureAnalytics";
import type { AgentConversation, AgentManifest } from "@/lib/agent-team/agents/types";
import {
  createConversation,
  deleteConversation,
  listConversations,
  saveConversation,
} from "@/lib/agent-team/storage/local-conversations";
import { setPendingPrompt } from "@/lib/agent-team/storage/pending-prompts";
import {
  TreasureHuntHistoryButton,
  TreasureHuntHistoryDrawer,
} from "@/components/treasure-hunt/TreasureHuntConversationHistory";
import { TreasureHuntHero } from "@/components/treasure-hunt/TreasureHuntHero";
import {
  treasureIconButton,
  treasureShell,
  treasureSky,
} from "@/components/treasure-hunt/styles";

export function TreasureHuntPageClient({ agent }: { agent: AgentManifest }) {
  const router = useRouter();
  useTreasureAnalytics();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setConversations(listConversations(agent.id));
    });
  }, [agent.id]);

  function startFromPrompt(prompt: string) {
    const conversation = saveConversation(createConversation(agent.id));
    setPendingPrompt(conversation.id, prompt);
    router.push(`/treasure/hunt/chat/${conversation.id}`);
  }

  function removeConversation(conversationId: string) {
    deleteConversation(conversationId);
    const next = listConversations(agent.id);
    setConversations(next);
    if (next.length === 0) {
      setHistoryOpen(false);
    }
  }

  function openConversation(conversation: AgentConversation) {
    setHistoryOpen(false);
    router.push(`/treasure/hunt/chat/${conversation.id}`);
  }

  return (
    <main className={`${treasureShell} relative`}>
      <div className={treasureSky} />
      {conversations.length > 0 ? (
        <TreasureHuntHistoryButton
          className={`${treasureIconButton} absolute right-4 top-4 z-[60]`}
          onClick={() => setHistoryOpen(true)}
        />
      ) : null}
      <TreasureHuntHistoryDrawer
        open={historyOpen}
        conversations={conversations}
        onOpen={openConversation}
        onDelete={removeConversation}
        onClose={() => setHistoryOpen(false)}
      />
      <section className="relative z-10 grid h-screen overflow-auto px-4 py-4 sm:px-6 md:px-8">
        <div className="mx-auto grid w-full max-w-4xl content-start pt-3 sm:content-center sm:pt-0">
          <TreasureHuntHero agent={agent} onStart={startFromPrompt} />
        </div>
      </section>
    </main>
  );
}
