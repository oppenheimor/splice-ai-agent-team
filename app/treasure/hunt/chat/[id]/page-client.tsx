"use client";

import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { TreasureHuntChatShell } from "@/components/treasure-hunt/TreasureHuntChatShell";

export function TreasureHuntChatPageClient({
  agent,
  conversationId,
}: {
  agent: AgentManifest;
  conversationId: string;
}) {
  return <TreasureHuntChatShell agent={agent} conversationId={conversationId} />;
}
