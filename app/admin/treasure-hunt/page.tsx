import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, ExternalLink, MessageSquareText, MousePointerClick, UsersRound } from "lucide-react";
import { getTreasureAdminDashboard } from "@/lib/analytics/treasure-hunt";
import { requireUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TreasureHuntAdminPage() {
  const user = await requireUser();
  const dashboard = await getTreasureAdminDashboard();

  return (
    <main className="min-h-screen bg-[#f7f4ed] px-5 py-6 text-[#26322f] md:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-[#ded4c4] bg-white px-5 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Treasure Hunt Admin</Badge>
              <span className="text-sm font-medium text-[#66736f]">当前用户：{user.displayName}</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-normal">寻宝 Agent 数据后台</h1>
            <p className="mt-2 text-sm leading-6 text-[#66736f]">查看 PV、UV、点击行为、用户会话和 AI 聊天内容。</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/treasure/hunt">
              打开前台
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard title="PV" value={dashboard.summary.pv} description="进入页面次数" icon={<BarChart3 className="h-5 w-5" />} />
          <MetricCard title="UV" value={dashboard.summary.uv} description="用户/访客去重" icon={<UsersRound className="h-5 w-5" />} />
          <MetricCard
            title="登录用户"
            value={dashboard.summary.uniqueUsers}
            description="有页面访问的账号"
            icon={<UsersRound className="h-5 w-5" />}
          />
          <MetricCard
            title="聊天消息"
            value={dashboard.summary.recentMessages.length}
            description="最近记录样本"
            icon={<MessageSquareText className="h-5 w-5" />}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <Card className="border-[#ded4c4] bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MousePointerClick className="h-5 w-5" />
                点击 Top
              </CardTitle>
              <CardDescription>统计用户具体点了什么。</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.summary.topClicks.length ? (
                <div className="space-y-3">
                  {dashboard.summary.topClicks.map((click) => (
                    <div key={click.target || "unknown"} className="flex items-center justify-between gap-3 rounded-md bg-[#f7f4ed] px-3 py-2">
                      <span className="min-w-0 truncate text-sm font-semibold">{click.target || "未知元素"}</span>
                      <Badge variant="outline">{click.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="还没有点击数据。" />
              )}
            </CardContent>
          </Card>

          <Card className="border-[#ded4c4] bg-white">
            <CardHeader>
              <CardTitle className="text-xl">最近事件</CardTitle>
              <CardDescription>页面进入和点击事件流。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="sticky top-0 bg-white text-xs uppercase text-[#7a857f]">
                    <tr className="border-b">
                      <th className="py-2 pr-3">时间</th>
                      <th className="py-2 pr-3">类型</th>
                      <th className="py-2 pr-3">用户</th>
                      <th className="py-2 pr-3">页面</th>
                      <th className="py-2 pr-3">点击目标</th>
                      <th className="py-2 pr-3">会话</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-[#eee7dc] align-top">
                        <td className="whitespace-nowrap py-2 pr-3 text-[#66736f]">{formatDate(event.occurredAt)}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={event.type === "click" ? "default" : "secondary"}>{event.type}</Badge>
                        </td>
                        <td className="py-2 pr-3 font-medium">{event.user.name || event.user.username}</td>
                        <td className="max-w-[220px] truncate py-2 pr-3">{event.pagePath}</td>
                        <td className="max-w-[220px] truncate py-2 pr-3">{event.target || "-"}</td>
                        <td className="max-w-[180px] truncate py-2 pr-3 text-[#66736f]">{event.conversationId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-[#ded4c4] bg-white">
          <CardHeader>
            <CardTitle className="text-xl">用户会话与聊天内容</CardTitle>
            <CardDescription>按 conversation 汇总，展示最近消息，便于快速分析用户需求和 AI 回复。</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.conversations.length ? (
              <div className="grid gap-4">
                {dashboard.conversations.map((conversation) => (
                  <article key={conversation.conversationId} className="rounded-lg border border-[#e6dccd] bg-[#fffdf8] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-black">{conversation.conversationId}</h2>
                        <p className="mt-1 text-sm text-[#66736f]">
                          {conversation.user?.name || conversation.user?.username || "未知用户"} · {conversation.messageCount} 条消息 ·{" "}
                          {conversation.lastMessageAt ? formatDate(conversation.lastMessageAt) : "无时间"}
                        </p>
                      </div>
                      {conversation.visitorId ? <Badge variant="outline">{conversation.visitorId}</Badge> : null}
                    </div>
                    <div className="mt-4 grid gap-2">
                      {conversation.messages.map((message) => (
                        <div key={message.messageId} className="grid gap-1 rounded-md bg-white px-3 py-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <Badge variant={message.role === "user" ? "default" : "secondary"}>{message.role}</Badge>
                            <span className="text-xs text-[#7a857f]">{formatDate(message.createdAt)}</span>
                          </div>
                          <p className="whitespace-pre-wrap break-words leading-6 text-[#33413d]">{message.text || "[非文本消息]"}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="还没有聊天记录。" />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-[#ded4c4] bg-white">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-3xl font-black">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#66736f]">{description}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-[#d8ccb8] bg-[#fffdf8] px-4 py-8 text-center text-sm text-[#66736f]">{text}</div>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
