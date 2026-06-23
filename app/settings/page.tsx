import Link from "next/link";
import { LogOut, Settings, UserRound, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsBackButton } from "./SettingsBackButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-[#f6f6f4] px-5 py-6 text-[#171717] md:px-8 md:py-9">
      <section className="mx-auto grid w-full max-w-4xl gap-7">
        <header className="grid gap-6 border-b border-[#deded9] pb-7 md:grid-cols-[1fr_auto] md:items-end">
          <div className="min-w-0">
            <SettingsBackButton />
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal">设置</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#737373]">管理账号信息、积分入口和登录状态。</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-[#d4d4d0] bg-white px-5 shadow-[0_8px_22px_rgba(23,23,23,0.06)] hover:border-[#b8b8b2] hover:bg-[#f1f1ee] hover:text-[#171717]"
          >
            <Link href="/credits">
              <Wallet className="h-4 w-4" />
              查看积分
            </Link>
          </Button>
        </header>

        <Card className="overflow-hidden rounded-lg border-[#deded9] bg-white shadow-[0_18px_50px_rgba(23,23,23,0.07)]">
          <CardHeader className="border-b border-[#eeeeea] p-6 md:p-8">
            <CardDescription className="flex items-center gap-2 text-[#737373]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#deded9] bg-[#f7f7f4]">
                <Settings className="h-4 w-4" />
              </span>
              账号信息
            </CardDescription>
            <CardTitle className="mt-4 text-2xl font-semibold tracking-normal md:text-3xl">登录账号</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 md:p-8">
            <dl className="grid gap-3 text-sm">
              <div className="grid gap-3 rounded-lg border border-[#eeeeea] bg-[#fafafa] px-4 py-4 md:grid-cols-[160px_1fr] md:items-center md:px-5">
                <dt className="flex items-center gap-2 text-[#737373]">
                  <UserRound className="h-4 w-4" />
                  用户名
                </dt>
                <dd className="break-all text-lg font-semibold text-[#171717] md:text-right">{user.username}</dd>
              </div>
            </dl>
            <form action="/agent-team/api/auth/logout" method="post">
              <Button
                variant="outline"
                type="submit"
                className="h-11 rounded-full border-[#d4d4d0] bg-white px-5 shadow-[0_8px_22px_rgba(23,23,23,0.05)] hover:border-[#b8b8b2] hover:bg-[#f1f1ee] hover:text-[#171717]"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
