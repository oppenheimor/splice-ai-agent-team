import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { prisma } from "@/lib/db/prisma";
import { fromDiagnosisRecord } from "@/lib/requirements-diagnosis/persistence";
import { DiagnosisChatShell } from "@/components/requirements-diagnosis/DiagnosisChatShell";

type DeepDiagnosisChatPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    sourceResultId?: string;
  }>;
};

export default async function DeepDiagnosisChatPage({ params, searchParams }: DeepDiagnosisChatPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { sourceResultId } = await searchParams;
  const agent = getAgentById("deep-diagnosis");

  if (!agent) {
    throw new Error("Deep diagnosis agent is not registered.");
  }

  const record = sourceResultId
    ? await prisma.diagnosisQuizResult.findFirst({
        where: { id: sourceResultId, userId: user.id },
        include: {
          chatSession: {
            select: {
              id: true,
              conversationId: true,
              status: true,
            },
          },
        },
      })
    : null;

  if (sourceResultId && !record) {
    notFound();
  }

  return (
    <DiagnosisChatShell
      agent={agent}
      conversationId={id}
      sourceDiagnosis={record ? fromDiagnosisRecord(record) : null}
    />
  );
}
