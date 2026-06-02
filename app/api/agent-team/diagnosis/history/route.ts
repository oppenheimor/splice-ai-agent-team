import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { fromDiagnosisRecord } from "@/lib/requirements-diagnosis/persistence";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "未登录。" }, { status: 401 });
  }

  const results = await prisma.diagnosisQuizResult.findMany({
    where: { userId: user.id },
    include: {
      chatSession: {
        select: {
          id: true,
          conversationId: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ results: results.map(fromDiagnosisRecord) });
}
