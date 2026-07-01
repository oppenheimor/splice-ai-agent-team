import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, MessageSquareText, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { requireUser } from "@/lib/auth/session";
import { getAgentEvalConversationDetail } from "@/lib/agent-team/evaluation/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AgentEvalConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  await requireUser();
  const { conversationId } = await params;
  const conversation = await getAgentEvalConversationDetail(decodeURIComponent(conversationId));

  if (!conversation) notFound();

  const latestRun = conversation.runs[0];

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8">
        <header className="flex flex-col gap-4 border-b border-[#eaeaea] pb-6">
          <Button asChild variant="ghost" size="sm" className="w-fit rounded-full px-0 text-[#666666] hover:bg-transparent">
            <Link href="/admin/agent-evals">
              <ArrowLeft className="h-4 w-4" />
              返回评测后台
            </Link>
          </Button>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full bg-[#f2f2f2] font-normal">
                  {conversation.agentId}
                </Badge>
                {latestRun ? <StatusBadge status={latestRun.status} label={`${latestRun.status} · ${formatDuration(latestRun.latencyMs)}`} /> : null}
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-normal md:text-3xl">{conversation.title || conversation.conversationId}</h1>
              <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-[#666666]">{conversation.conversationId}</p>
            </div>
            <div className="grid gap-1 text-sm text-[#666666] md:text-right">
              <span>{conversation.user.name || conversation.user.username}</span>
              <span>{formatDate(conversation.lastMessageAt)}</span>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <MetaCard title="消息" value={conversation.messages.length} />
          <MetaCard title="运行" value={conversation.runs.length} />
          <MetaCard title="模型" value={latestRun?.model || conversation.model || "-"} />
          <MetaCard title="Prompt" value={latestRun?.promptVersion || conversation.promptVersion || "-"} />
        </section>

        <Card className="rounded-xl border-[#eaeaea] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-[#f0f0f0] p-5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-normal">
              <Clock3 className="h-4 w-4" />
              运行记录
            </CardTitle>
            <CardDescription>用于排查同一会话中的多次触发、失败和耗时。</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[#f0f0f0] bg-[#fafafa] text-xs text-[#666666]">
                  <tr>
                    <Th>时间</Th>
                    <Th>状态</Th>
                    <Th>模型</Th>
                    <Th>Prompt</Th>
                    <Th>消息</Th>
                    <Th>耗时</Th>
                    <Th>错误</Th>
                  </tr>
                </thead>
                <tbody>
                  {conversation.runs.map((run) => (
                    <tr key={run.id} className="border-b border-[#f5f5f5] align-top last:border-0">
                      <Td className="whitespace-nowrap font-mono text-xs text-[#666666]">{formatDate(run.startedAt)}</Td>
                      <Td>
                        <StatusBadge status={run.status} />
                      </Td>
                      <Td className="font-mono text-xs text-[#666666]">{run.model || "-"}</Td>
                      <Td className="font-mono text-xs text-[#666666]">{run.promptVersion || "-"}</Td>
                      <Td className="font-mono text-xs text-[#666666]">
                        {run.inputMessageCount} / {run.outputMessageCount}
                      </Td>
                      <Td className="font-mono text-xs text-[#666666]">{formatDuration(run.latencyMs)}</Td>
                      <Td className="max-w-[240px] truncate text-[#8a1f11]">{run.errorMessage || "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#eaeaea] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-[#f0f0f0] p-5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-normal">
              <MessageSquareText className="h-4 w-4" />
              完整对话
            </CardTitle>
            <CardDescription>按消息创建时间正序展示。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            {conversation.messages.map((message) => (
              <article key={message.id} className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline" className="rounded-full border-[#e5e5e5] bg-white font-normal">
                    {message.role}
                  </Badge>
                  <span className="font-mono text-xs text-[#7d7d7d]">{formatDate(message.createdAt)}</span>
                </div>
                <MarkdownMessage content={message.text || "[非文本消息]"} />
              </article>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

const markdownClassName =
  "mt-3 max-w-none overflow-x-auto break-words text-sm leading-7 text-[#333] [&_a]:font-medium [&_a]:text-[#171717] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#d4d4d4] [&_blockquote]:pl-3 [&_blockquote]:text-[#666666] [&_code]:rounded [&_code]:bg-white [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_li]:my-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[#eaeaea] [&_pre]:bg-white [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-[#e5e5e5] [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-[#e5e5e5] [&_th]:bg-white [&_th]:px-2 [&_th]:py-1.5 [&_ul]:ml-5 [&_ul]:list-disc";

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className={markdownClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function MetaCard({ title, value }: { title: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
      <p className="text-xs text-[#666666]">{title}</p>
      <p className="mt-2 truncate text-lg font-semibold tracking-normal">{value}</p>
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
