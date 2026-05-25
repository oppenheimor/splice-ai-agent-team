import { requireUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { TreasureHuntPageClient } from "./page-client";

export default async function TreasureHuntPage() {
  await requireUser();
  const agent = getAgentById("treasure-hunt");

  if (!agent) {
    throw new Error("Treasure hunt agent is not registered.");
  }

  return <TreasureHuntPageClient agent={agent} />;
}
