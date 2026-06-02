import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { prisma } from "@/lib/db/prisma";
import { fromDiagnosisRecord } from "@/lib/requirements-diagnosis/persistence";
import { DiagnosisChatShell } from "@/components/requirements-diagnosis/DiagnosisChatShell";

type DiagnosisChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DiagnosisChatPage({ params }: DiagnosisChatPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const agent = getAgentById("requirements-diagnosis");

  if (!agent) {
    throw new Error("Requirements diagnosis agent is not registered.");
  }

  const record = await prisma.diagnosisQuizResult.findFirst({
    where: { id, userId: user.id },
    include: {
      chatSession: {
        select: {
          id: true,
          conversationId: true,
          status: true,
        },
      },
    },
  });

  if (!record) {
    notFound();
  }

  return <DiagnosisChatShell agent={agent} diagnosis={fromDiagnosisRecord(record)} />;
}
