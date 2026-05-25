import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RequirementsDiagnosisPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-background to-background px-6 py-8 text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            Splice Agent Team
          </Link>
          <form action="/agent-team/api/auth/logout" method="post">
            <Button variant="outline" type="submit">
              <LogOut className="h-4 w-4" />
              退出
            </Button>
          </form>
        </div>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <CardDescription>受保护页面</CardDescription>
            <CardTitle className="text-4xl sm:text-6xl">需求诊断 Agent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              当前 V1 已通过服务端 session 识别登录用户：<strong className="text-foreground">{user.displayName}</strong>。cookie 里只保存 sessionId，
              用户信息来自 PostgreSQL。
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
