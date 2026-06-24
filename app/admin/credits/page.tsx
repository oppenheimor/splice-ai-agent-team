import Link from "next/link";
import { ArrowLeft, Coins, ShieldAlert, UserPlus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { CSRF_FORM_FIELD_NAME } from "@/lib/security/csrf-constants";
import { getCsrfToken } from "@/lib/security/csrf-server";
import {
  getCreditAdminDashboard,
} from "@/lib/credits/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

type CreditAdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function CreditAdminPage({ searchParams }: CreditAdminPageProps) {
  const params = await searchParams;
  const user = await requireUser("/admin/credits");
  const csrfToken = await getCsrfToken();
  let dashboard: Awaited<ReturnType<typeof getCreditAdminDashboard>>;

  try {
    dashboard = await getCreditAdminDashboard(user);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return <ForbiddenState username={user.username} />;
    }

    throw error;
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-6 text-[#171717] md:px-8">
      <section className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Button asChild variant="ghost" className="-ml-3 mb-3 rounded-full">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                返回工作台
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                Credits Admin
              </Badge>
              <span className="text-sm text-[#737373]">当前管理员：{user.username}</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">积分后台</h1>
            <p className="mt-2 text-sm leading-6 text-[#737373]">给指定用户名增加积分，并查看最近流水。</p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/settings">
              <Coins className="h-4 w-4" />
              我的积分
            </Link>
          </Button>
        </header>

        {params?.success ? (
          <div className="rounded-lg border border-[#c3e6cb] bg-[#f0fff4] px-4 py-3 text-sm font-medium text-[#087f5b]">
            {params.success}
          </div>
        ) : null}
        {params?.error ? (
          <div className="rounded-lg border border-[#ffc9c9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#c92a2a]">
            {getErrorMessage(params.error)}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="border-[#e5e5e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5" />
                增加积分
              </CardTitle>
              <CardDescription>用户名会自动转成小写匹配。</CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/agent-team/api/admin/credits/grant" method="post" className="grid gap-4">
                <input type="hidden" name={CSRF_FORM_FIELD_NAME} value={csrfToken} />
                <div className="grid gap-2">
                  <Label htmlFor="targetUsername">用户名</Label>
                  <Input id="targetUsername" name="targetUsername" placeholder="例如 paul" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="credits">增加积分</Label>
                  <Input id="credits" name="credits" inputMode="numeric" pattern="[0-9]*" placeholder="例如 6900" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">原因</Label>
                  <Input id="reason" name="reason" placeholder="例如 手动充值 / 测试补偿" />
                </div>
                <Button type="submit" className="rounded-full">
                  <Coins className="h-4 w-4" />
                  确认加积分
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-[#e5e5e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <CardHeader>
              <CardTitle className="text-lg">用户余额</CardTitle>
              <CardDescription>最近更新过积分账户的用户。</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.accounts.length ? (
                <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-[#f7f7f7] text-xs text-[#737373]">
                      <tr>
                        <th className="px-3 py-2 font-medium">用户</th>
                        <th className="px-3 py-2 text-right font-medium">余额</th>
                        <th className="px-3 py-2 text-right font-medium">累计获得</th>
                        <th className="px-3 py-2 text-right font-medium">累计消耗</th>
                        <th className="px-3 py-2 font-medium">更新时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.accounts.map((account) => (
                        <tr key={account.id} className="border-t border-[#eeeeee]">
                          <td className="px-3 py-2 font-medium">{account.user.name || account.user.username}</td>
                          <td className="px-3 py-2 text-right font-semibold">{account.balance.toLocaleString("zh-CN")}</td>
                          <td className="px-3 py-2 text-right">{account.totalGranted.toLocaleString("zh-CN")}</td>
                          <td className="px-3 py-2 text-right">{account.totalConsumed.toLocaleString("zh-CN")}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-[#737373]">{formatDate(account.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState text="还没有用户积分账户。" />
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="border-[#e5e5e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg">最近积分流水</CardTitle>
            <CardDescription>包括后台加分、Agent 消耗和失败退回。</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.recentEntries.length ? (
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#f7f7f7] text-xs text-[#737373]">
                    <tr>
                      <th className="px-3 py-2 font-medium">时间</th>
                      <th className="px-3 py-2 font-medium">用户</th>
                      <th className="px-3 py-2 font-medium">类型</th>
                      <th className="px-3 py-2 font-medium">原因</th>
                      <th className="px-3 py-2 text-right font-medium">变化</th>
                      <th className="px-3 py-2 text-right font-medium">余额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentEntries.map((entry) => (
                      <tr key={entry.id} className="border-t border-[#eeeeee]">
                        <td className="whitespace-nowrap px-3 py-2 text-[#737373]">{formatDate(entry.createdAt)}</td>
                        <td className="px-3 py-2 font-medium">{entry.user.name || entry.user.username}</td>
                        <td className="px-3 py-2">
                          <Badge variant={entry.amount >= 0 ? "secondary" : "outline"} className="rounded-full">
                            {getLedgerTypeLabel(entry.type)}
                          </Badge>
                        </td>
                        <td className="max-w-[280px] truncate px-3 py-2">{entry.reason || "-"}</td>
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
            ) : (
              <EmptyState text="还没有积分流水。" />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ForbiddenState({ username }: { username: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fafafa] px-5 text-[#171717]">
      <Card className="w-full max-w-md border-[#e5e5e5] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5" />
            无权访问积分后台
          </CardTitle>
          <CardDescription>
            当前用户 {username} 不在积分后台名单中。请配置 CREDIT_ADMIN_USERNAMES。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              返回工作台
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d4d4d4] bg-[#fbfbfb] px-4 py-8 text-center text-sm text-[#737373]">
      {text}
    </div>
  );
}

function getErrorMessage(error: string) {
  const messages: Record<string, string> = {
    FORBIDDEN: "当前账号没有积分后台权限。",
    TARGET_USER_NOT_FOUND: "找不到这个用户名。",
    INVALID_CREDITS: "积分数量必须是 1 到 1000000 之间的整数。",
  };

  return messages[error] || "加积分失败，请稍后再试。";
}

function getLedgerTypeLabel(type: string) {
  const labels: Record<string, string> = {
    grant: "获得",
    consume: "消耗",
    refund: "退回",
  };

  return labels[type] || type;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
