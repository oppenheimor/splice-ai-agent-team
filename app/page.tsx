import Link from "next/link";
import { ArrowRight, LogOut, MessageSquareText, SearchCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 px-6 py-10 text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
            Splice Agent Team
          </Badge>
          <span className="text-sm text-muted-foreground">Tailwind + shadcn UI</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              面向多 Agent 产品的工作台
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              先把登录态、受保护页面和当前用户识别跑通，再逐步接入验证码、密码和完整用户体系。
            </p>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader className="space-y-2">
              <CardDescription className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                当前状态
              </CardDescription>
              <CardTitle className="text-xl">{user ? `已登录：${user.displayName}` : "未登录"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {user ? `用户名：${user.username}` : "进入 Agent 页面前需要先登录。"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11">
            <Link href="/requirements-diagnosis">
              <SearchCheck className="h-4 w-4" />
              打开需求诊断 Agent
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-11">
            <Link href="/deep-diagnosis">
              <MessageSquareText className="h-4 w-4" />
              打开深度诊断 Agent
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-11">
            <Link href="/treasure/hunt">
              <Sparkles className="h-4 w-4" />
              打开寻宝游戏 Agent
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href="/admin/treasure-hunt">
              <Sparkles className="h-4 w-4" />
              打开简易后台
            </Link>
          </Button>
          {user ? (
            <form action="/agent-team/api/auth/logout" method="post">
              <Button variant="outline" className="h-11" type="submit">
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </form>
          ) : (
            <Button asChild variant="outline" className="h-11">
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
