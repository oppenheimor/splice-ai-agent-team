import { requireUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { TreasureHuntChatPageClient } from "./page-client";

type TreasureHuntChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TreasureHuntChatPage({ params }: TreasureHuntChatPageProps) {
  await requireUser();
  const agent = getAgentById("treasure-hunt");
  const { id } = await params;

  if (!agent) {
    throw new Error("Treasure hunt agent is not registered.");
  }

  return <TreasureHuntChatPageClient agent={agent} conversationId={id} />;
}
