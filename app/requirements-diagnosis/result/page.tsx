import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { fromDiagnosisRecord } from "@/lib/requirements-diagnosis/persistence";
import { RequirementsResultClient } from "./page-client";

type RequirementsResultPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function RequirementsResultPage({ searchParams }: RequirementsResultPageProps) {
  const user = await requireUser();
  const { id } = await searchParams;
  const record = await prisma.diagnosisQuizResult.findFirst({
    where: id ? { id, userId: user.id } : { userId: user.id },
    include: {
      chatSession: {
        select: {
          id: true,
          conversationId: true,
          status: true,
        },
      },
    },
    orderBy: id ? undefined : { createdAt: "desc" },
  });

  return <RequirementsResultClient initialRecord={record ? fromDiagnosisRecord(record) : null} />;
}
