import { requireUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { DeepDiagnosisLanding } from "@/components/deep-diagnosis/DeepDiagnosisLanding";

export default async function DeepDiagnosisPage() {
  await requireUser();
  const agent = getAgentById("deep-diagnosis");

  if (!agent) {
    throw new Error("Deep diagnosis agent is not registered.");
  }

  return <DeepDiagnosisLanding agent={agent} />;
}
