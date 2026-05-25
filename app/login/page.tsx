import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params?.next);
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath || "/treasure/hunt");
  }

  const error = params?.error;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/35 px-6 py-10 text-foreground">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Agent Team 访问入口
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">登录</h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              输入用户名和密码即可继续，首次使用会自动完成注册。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-background/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" />
                登录后访问受保护页面
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">会话会保存在浏览器里，刷新后仍然有效。</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="h-4 w-4 text-primary" />
                账号可直接复用
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">同一个用户名后续可直接登录，不用重复创建。</p>
            </div>
          </div>
        </div>

        <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur">
          <CardHeader className="space-y-2">
            <CardDescription className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              继续访问
            </CardDescription>
            <CardTitle className="text-2xl">账号登录</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" action="/agent-team/api/auth/login" method="post">
              <input type="hidden" name="next" value={nextPath} />

              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" name="username" autoComplete="username" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error ? <p className="text-sm text-destructive">{getErrorMessage(error)}</p> : null}

              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  登录/注册
                </Button>
                <p className="text-center text-xs leading-5 text-muted-foreground">
                  首次提交会创建账号，已有账号则直接登录。
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function getErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    missing_credentials: "请输入用户名和密码。",
    invalid_username: "用户名需为 3-32 位小写字母、数字、下划线或短横线，并以字母或数字开头。",
    invalid_password: "密码长度需为 6-128 位。",
    invalid_credentials: "密码不正确。这个用户名已经注册过了。",
  };

  return messages[error] ?? "登录失败，请稍后再试。";
}

function sanitizeNextPath(value?: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "";
  }

  return value;
}
