import Link from "next/link";
import { Coins, ReceiptText, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getCreditDashboard } from "@/lib/credits/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditsBackButton } from "./CreditsBackButton";

export const dynamic = "force-dynamic";

type CreditsPageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

const DEFAULT_PAGE_SIZE = 20;

export default async function CreditsPage({ searchParams }: CreditsPageProps) {
  const params = await searchParams;
  const page = parsePositiveInt(params?.page, 1);
  const pageSize = parsePositiveInt(params?.pageSize, DEFAULT_PAGE_SIZE);
  const user = await requireUser();
  const dashboard = await getCreditDashboard(user.id, { page, pageSize });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fafafa] px-3 py-4 text-[#171717] sm:px-5 sm:py-6 md:px-8">
      <section className="mx-auto grid w-full max-w-5xl gap-4 sm:gap-6">
        <header className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-4 sm:pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <CreditsBackButton />
            <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">积分</h1>
            <p className="mt-2 text-sm leading-6 text-[#737373]">查看积分余额和流水。</p>
          </div>
        </header>

        <section className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-3">
          <MetricCard
            title="当前余额"
            value={dashboard.account.balance.toLocaleString("zh-CN")}
            description="可用于 Agent 对话、分析和方案生成"
            icon={<Wallet className="h-5 w-5" />}
          />
          <MetricCard
            title="累计获得"
            value={dashboard.account.totalGranted.toLocaleString("zh-CN")}
            description="充值、后台补偿和活动发放"
            icon={<Coins className="h-5 w-5" />}
          />
          <MetricCard
            title="累计消耗"
            value={dashboard.account.totalConsumed.toLocaleString("zh-CN")}
            description="Agent 任务实际扣除积分"
            icon={<ReceiptText className="h-5 w-5" />}
          />
        </section>

        <section className="min-w-0">
          <Card className="min-w-0 border-[#e5e5e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <CardHeader className="flex flex-col gap-2 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div>
                <CardTitle className="text-lg">积分流水</CardTitle>
                <CardDescription>每页展示 {dashboard.ledgerPagination.pageSize} 条积分变化。</CardDescription>
              </div>
              <span className="text-sm text-[#737373]">
                共 {dashboard.ledgerPagination.total.toLocaleString("zh-CN")} 条
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {dashboard.ledgerEntries.length ? (
                <>
                  <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div className="min-w-[620px] overflow-hidden rounded-lg border border-[#e5e5e5]">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#f7f7f7] text-xs text-[#737373]">
                          <tr>
                            <th className="px-3 py-2 font-medium">时间</th>
                            <th className="px-3 py-2 font-medium">类型</th>
                            <th className="px-3 py-2 font-medium">原因</th>
                            <th className="px-3 py-2 text-right font-medium">变化</th>
                            <th className="px-3 py-2 text-right font-medium">余额</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.ledgerEntries.map((entry) => (
                            <tr key={entry.id} className="border-t border-[#eeeeee]">
                              <td className="whitespace-nowrap px-3 py-2 text-[#737373]">{formatDate(entry.createdAt)}</td>
                              <td className="px-3 py-2">
                                <Badge variant={entry.amount >= 0 ? "secondary" : "outline"} className="rounded-full">
                                  {getLedgerTypeLabel(entry.type)}
                                </Badge>
                              </td>
                              <td className="max-w-[420px] truncate px-3 py-2">{entry.reason || "-"}</td>
                              <td className={entry.amount >= 0 ? "px-3 py-2 text-right font-medium text-[#087f5b]" : "px-3 py-2 text-right font-medium text-[#c92a2a]"}>
                                {entry.amount >= 0 ? "+" : ""}
                                {entry.amount.toLocaleString("zh-CN")}
                              </td>
                              <td className="px-3 py-2 text-right font-medium">{entry.balanceAfter.toLocaleString("zh-CN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <LedgerPagination
                    page={dashboard.ledgerPagination.page}
                    pageSize={dashboard.ledgerPagination.pageSize}
                    pageCount={dashboard.ledgerPagination.pageCount}
                    total={dashboard.ledgerPagination.total}
                  />
                </>
              ) : (
                <EmptyState text="还没有积分流水。" />
              )}
            </CardContent>
          </Card>
        </section>
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
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 border-[#e5e5e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="break-words text-3xl font-semibold tracking-normal">{value}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <p className="text-sm leading-6 text-[#737373]">{description}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d4d4d4] bg-[#fbfbfb] px-4 py-8 text-center text-sm text-[#737373]">
      {text}
    </div>
  );
}

function LedgerPagination({
  page,
  pageSize,
  pageCount,
  total,
}: {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav className="mt-4 flex flex-col gap-3 text-sm text-[#737373] sm:flex-row sm:items-center sm:justify-between" aria-label="积分流水分页">
      <span>
        第 {page} / {pageCount} 页，显示 {start}-{end} 条
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        {page <= 1 ? (
          <Button type="button" variant="outline" size="sm" className="w-full rounded-full sm:w-auto" disabled>
            上一页
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
            <Link href={buildCreditsPageHref(page - 1, pageSize)}>上一页</Link>
          </Button>
        )}
        {page >= pageCount ? (
          <Button type="button" variant="outline" size="sm" className="w-full rounded-full sm:w-auto" disabled>
            下一页
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
            <Link href={buildCreditsPageHref(page + 1, pageSize)}>下一页</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getLedgerTypeLabel(type: string) {
  const labels: Record<string, string> = {
    grant: "获得",
    consume: "消耗",
    refund: "退回",
  };

  return labels[type] || type;
}

function buildCreditsPageHref(page: number, pageSize: number) {
  return `/credits?page=${Math.max(1, page)}&pageSize=${pageSize}`;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}
