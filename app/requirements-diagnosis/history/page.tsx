import Link from "next/link";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { fromDiagnosisRecord } from "@/lib/requirements-diagnosis/persistence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  diagnosisAppSurface,
  diagnosisBadge,
  diagnosisBottomActions,
  diagnosisMutedText,
  diagnosisPanel,
  diagnosisPrimaryButton,
  diagnosisSecondaryButton,
  diagnosisSerif,
  diagnosisStage,
  diagnosisShell,
} from "@/components/requirements-diagnosis/styles";

export default async function RequirementsDiagnosisHistoryPage() {
  const user = await requireUser();
  const results = await prisma.diagnosisQuizResult.findMany({
    where: { userId: user.id },
    include: {
      chatSession: {
        select: {
          id: true,
          conversationId: true,
          status: true,
          lastMessageAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const chatSessionIds = results.flatMap((item) => (item.chatSession?.id ? [item.chatSession.id] : []));
  // Prisma 当前生成的嵌套 select 不支持 chatSession._count；单独 groupBy 更稳定，也避免 N+1 查询。
  const messageCountRows = chatSessionIds.length
    ? await prisma.diagnosisChatMessage.groupBy({
        by: ["chatSessionId"],
        where: {
          userId: user.id,
          chatSessionId: { in: chatSessionIds },
        },
        _count: { _all: true },
      })
    : [];
  const messageCountBySessionId = new Map(messageCountRows.map((row) => [row.chatSessionId, row._count._all]));
  const records = results.map(fromDiagnosisRecord);

  return (
    <main className={diagnosisShell}>
      <section className={diagnosisStage}>
        <article className={`${diagnosisAppSurface} overflow-auto`}>
          <div className="flex flex-1 flex-col">
            {records.length ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {records.map((record) => {
                  const source = results.find((item) => item.id === record.id);
                  const messageCount = source?.chatSession?.id ? (messageCountBySessionId.get(source.chatSession.id) ?? 0) : 0;
                  return (
                    <Link key={record.id} href={`/requirements-diagnosis/chat/${record.id}`} className={`block p-4 ${diagnosisPanel}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className={diagnosisBadge}>{record.result.aiAdoptionStage}</span>
                        <span className={`text-xs ${diagnosisMutedText}`}>{messageCount} 条消息</span>
                      </div>
                      <h2 className={`mt-4 text-xl font-black ${diagnosisSerif}`}>{record.result.operatorTypeName}</h2>
                      <p className={`mt-2 line-clamp-2 text-sm leading-6 ${diagnosisMutedText}`}>{record.result.operatorTypeDefinition}</p>
                      <div className="mt-4 flex items-center justify-between text-sm font-bold text-[#2e2f2d]">
                        <span>{record.chatSession ? "继续深度诊断" : "开始深度诊断"}</span>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card className={`${diagnosisPanel} mt-8 p-6 text-center shadow-none`}>
                <h2 className={`text-2xl font-black ${diagnosisSerif}`}>还没有评测记录</h2>
                <p className={`mt-3 text-sm leading-7 ${diagnosisMutedText}`}>完成一次 13 题评测后，你会在这里看到历史报告和深度诊断入口。</p>
              </Card>
            )}

            <div className={diagnosisBottomActions}>
              <Button asChild className={`h-12 text-sm font-bold ${diagnosisPrimaryButton}`}>
                <Link href="/requirements-diagnosis/quiz">
                  <Plus className="h-4 w-4" />
                  重新评测
                </Link>
              </Button>
              <Button asChild variant="outline" className={`h-12 text-sm font-bold ${diagnosisSecondaryButton}`}>
                <Link href="/requirements-diagnosis/result">
                  <FileText className="h-4 w-4" />
                  最近结果
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
