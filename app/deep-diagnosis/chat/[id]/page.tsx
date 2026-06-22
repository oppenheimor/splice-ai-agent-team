import { requireUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { DeepDiagnosisChatShell } from "@/components/deep-diagnosis/DeepDiagnosisChatShell";

type DeepDiagnosisChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DeepDiagnosisChatPage({ params }: DeepDiagnosisChatPageProps) {
  await requireUser();
  const { id } = await params;
  const agent = getAgentById("deep-diagnosis");

  if (!agent) {
    throw new Error("Deep diagnosis agent is not registered.");
  }

  return <DeepDiagnosisChatShell agent={agent} conversationId={id} />;
}
