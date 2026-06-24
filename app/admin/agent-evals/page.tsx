import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, ChevronLeft, ChevronRight, Clock3, Database, FileDown, MessageSquareText, Sparkles, TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAgentEvalDashboard } from "@/lib/agent-team/evaluation/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{ runsPage?: string; conversationsPage?: string }>;

export default async function AgentEvalAdminPage({ searchParams }: { searchParams: PageSearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const dashboard = await getAgentEvalDashboard({
    runsPage: parsePage(params.runsPage),
    conversationsPage: parsePage(params.conversationsPage),
  });

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
        <header className="flex flex-col gap-4 border-b border-[#eaeaea] pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-[#eaeaea] bg-white font-normal text-[#666666]">
                Agent Eval
              </Badge>
              <span className="text-sm text-[#666666]">当前用户：{user.displayName}</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">Agent 评测后台</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666666]">查看真实会话、运行轨迹、版本与失败样本，用来回测 prompt 变化。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full border-[#eaeaea] bg-white shadow-none">
              <Link href="/deep-diagnosis">
                打开前台
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-[#171717] !text-white shadow-none hover:bg-black">
              <Link href="#export-command">
                导出样本
                <FileDown className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="会话" value={dashboard.summary.conversationCount} description="已记录 conversation" icon={<MessageSquareText className="h-4 w-4" />} />
          <MetricCard title="消息" value={dashboard.summary.messageCount} description="用户与 assistant" icon={<Database className="h-4 w-4" />} />
          <MetricCard title="运行" value={dashboard.summary.runCount} description="Agent run 总数" icon={<Activity className="h-4 w-4" />} />
          <MetricCard title="完成率" value={`${dashboard.summary.completionRate}%`} description={`${dashboard.summary.failedRunCount} 次失败`} icon={<Sparkles className="h-4 w-4" />} />
          <MetricCard title="平均耗时" value={formatDuration(dashboard.summary.averageLatencyMs)} description="已完成 run 平均值" icon={<Clock3 className="h-4 w-4" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <Card className="rounded-xl border-[#eaeaea] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
            <CardHeader className="border-b border-[#f0f0f0] p-5">
              <CardTitle className="text-base font-semibold tracking-normal">运行记录</CardTitle>
              <CardDescription>按 startedAt 倒序，优先看失败、耗时和版本。</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {dashboard.recentRuns.rows.length ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left text-sm">
                      <thead className="border-b border-[#f0f0f0] bg-[#fafafa] text-xs text-[#666666]">
                        <tr>
                          <Th>时间</Th>
                          <Th>状态</Th>
                          <Th>用户</Th>
                          <Th>模型</Th>
                          <Th>Prompt</Th>
                          <Th>消息</Th>
                          <Th>耗时</Th>
                          <Th>错误</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recentRuns.rows.map((run) => (
                          <tr key={run.id} className="border-b border-[#f5f5f5] align-top last:border-0">
                            <Td className="whitespace-nowrap font-mono text-xs text-[#666666]">{formatDate(run.startedAt)}</Td>
                            <Td>
                              <StatusBadge status={run.status} />
                            </Td>
                            <Td>{run.user.name || run.user.username}</Td>
                            <Td className="max-w-[150px] truncate font-mono text-xs text-[#666666]">{run.model || "-"}</Td>
                            <Td className="max-w-[190px] truncate font-mono text-xs text-[#666666]">{run.promptVersion || "-"}</Td>
                            <Td className="font-mono text-xs text-[#666666]">
                              {run.inputMessageCount} / {run.outputMessageCount}
                            </Td>
                            <Td className="font-mono text-xs text-[#666666]">{formatDuration(run.latencyMs)}</Td>
                            <Td className="max-w-[210px] truncate text-[#8a1f11]">{run.errorMessage || "-"}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    label="运行"
                    page={dashboard.recentRuns.page}
                    total={dashboard.recentRuns.total}
                    totalPages={dashboard.recentRuns.totalPages}
                    paramName="runsPage"
                    preserve={{ conversationsPage: dashboard.conversations.page }}
                  />
                </>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>

          <Card id="export-command" className="rounded-xl border-[#eaeaea] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
            <CardHeader className="p-5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-normal">
                <FileDown className="h-4 w-4" />
                回测样本导出
              </CardTitle>
              <CardDescription>后台用于浏览，批量分析仍走 JSONL 导出。</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <code className="block rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3 font-mono text-xs leading-5 text-[#171717]">
                pnpm eval:export -- --agent deep-diagnosis --limit 20
              </code>
              <div className="mt-4 rounded-lg border border-[#f0f0f0] bg-[#fafafa] p-3 text-sm leading-6 text-[#666666]">
                下一步可以接人工评分、失败归因和 prompt 版本对比。
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-xl border-[#eaeaea] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-[#f0f0f0] p-5">
            <CardTitle className="text-base font-semibold tracking-normal">会话入口</CardTitle>
            <CardDescription>表格只做索引，点击一行查看完整对话与运行详情。</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard.conversations.rows.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="border-b border-[#f0f0f0] bg-[#fafafa] text-xs text-[#666666]">
                      <tr>
                        <Th>标题</Th>
                        <Th>用户</Th>
                        <Th>Agent</Th>
                        <Th>最近运行</Th>
                        <Th>消息</Th>
                        <Th>Runs</Th>
                        <Th>更新时间</Th>
                        <Th>详情</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.conversations.rows.map((conversation) => {
                        const latestRun = conversation.runs[0];

                        return (
                          <tr key={conversation.id} className="border-b border-[#f5f5f5] align-top transition-colors hover:bg-[#fafafa] last:border-0">
                            <Td className="max-w-[360px]">
                              <Link className="block" href={`/admin/agent-evals/conversations/${conversation.conversationId}`}>
                                <span className="block truncate font-medium">{conversation.title || conversation.conversationId}</span>
                                <span className="mt-1 block truncate text-xs text-[#7d7d7d]">{conversation.firstUserText || conversation.conversationId}</span>
                              </Link>
                            </Td>
                            <Td>{conversation.user.name || conversation.user.username}</Td>
                            <Td>
                              <Badge variant="secondary" className="rounded-full bg-[#f2f2f2] font-normal">
                                {conversation.agentId}
                              </Badge>
                            </Td>
                            <Td>{latestRun ? <StatusBadge status={latestRun.status} label={`${latestRun.status} · ${formatDuration(latestRun.latencyMs)}`} /> : "-"}</Td>
                            <Td className="font-mono text-xs text-[#666666]">{conversation._count.messages}</Td>
                            <Td className="font-mono text-xs text-[#666666]">{conversation._count.runs}</Td>
                            <Td className="whitespace-nowrap font-mono text-xs text-[#666666]">{formatDate(conversation.lastMessageAt)}</Td>
                            <Td>
                              <Button asChild variant="ghost" size="sm" className="rounded-full text-[#666666]">
                                <Link href={`/admin/agent-evals/conversations/${conversation.conversationId}`}>
                                  查看
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  label="会话"
                  page={dashboard.conversations.page}
                  total={dashboard.conversations.total}
                  totalPages={dashboard.conversations.totalPages}
                  paramName="conversationsPage"
                  preserve={{ runsPage: dashboard.recentRuns.page }}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function MetricCard({ title, value, description, icon }: { title: string; value: ReactNode; description: string; icon: ReactNode }) {
  return (
    <Card className="rounded-xl border-[#eaeaea] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
      <CardHeader className="p-4">
        <CardDescription className="flex items-center gap-2 text-xs text-[#666666]">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="mt-2 text-2xl font-semibold tracking-normal">{value}</CardTitle>
        <p className="text-xs text-[#7d7d7d]">{description}</p>
      </CardHeader>
    </Card>
  );
}

function Pagination({
  label,
  page,
  total,
  totalPages,
  paramName,
  preserve,
}: {
  label: string;
  page: number;
  total: number;
  totalPages: number;
  paramName: "runsPage" | "conversationsPage";
  preserve: Partial<Record<"runsPage" | "conversationsPage", number>>;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#f0f0f0] px-4 py-3 text-sm text-[#666666] md:flex-row md:items-center md:justify-between">
      <span>
        {label} {page} / {totalPages}，共 {total} 条
      </span>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full border-[#eaeaea] bg-white shadow-none" disabled={page <= 1}>
          <Link aria-disabled={page <= 1} href={buildPageHref(paramName, Math.max(1, page - 1), preserve)}>
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full border-[#eaeaea] bg-white shadow-none" disabled={page >= totalPages}>
          <Link aria-disabled={page >= totalPages} href={buildPageHref(paramName, Math.min(totalPages, page + 1), preserve)}>
            下一页
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const failed = status === "failed";
  const completed = status === "completed";

  return (
    <Badge
      variant="outline"
      className={`rounded-full font-normal ${
        failed ? "border-[#f2c6bc] bg-[#fff4f1] text-[#8a1f11]" : completed ? "border-[#d8ead7] bg-[#f4fbf4] text-[#256029]" : "border-[#eaeaea] bg-[#fafafa] text-[#666666]"
      }`}
    >
      {failed ? <TriangleAlert className="mr-1 h-3 w-3" /> : null}
      {label || status}
    </Badge>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d4d4d4] bg-[#fafafa] px-4 py-12 text-center">
      <MessageSquareText className="h-5 w-5 text-[#7d7d7d]" />
      <p className="mt-3 text-sm font-medium">还没有评测数据</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-[#666666]">先去 deep-diagnosis 完成几轮真实对话，再刷新这个页面。</p>
    </div>
  );
}

function buildPageHref(paramName: "runsPage" | "conversationsPage", page: number, preserve: Partial<Record<"runsPage" | "conversationsPage", number>>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(preserve)) {
    if (value && value > 1) params.set(key, String(value));
  }

  if (page > 1) params.set(paramName, String(page));
  else params.delete(paramName);

  const query = params.toString();
  return query ? `/admin/agent-evals?${query}` : "/admin/agent-evals";
}

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
