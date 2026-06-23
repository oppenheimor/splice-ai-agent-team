import { redirect } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
    redirect_url?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params?.redirect_url ?? params?.next);
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath || "/treasure/hunt");
  }

  const error = params?.error;

  return (
    <main
      className={`${GeistSans.variable} relative min-h-screen overflow-hidden bg-[#fafafa] px-5 text-[#171717] [font-family:var(--font-geist-sans),'Noto_Sans_SC','Source_Han_Sans_SC',ui-sans-serif,sans-serif]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.026)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.026)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_70%,transparent)] lg:bg-[size:44px_44px] lg:[mask-image:radial-gradient(ellipse_at_center,black_0%,black_48%,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(to_bottom,#fff_0%,rgba(255,255,255,0.94)_45%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(to_top,#fff_0%,rgba(255,255,255,0.86)_30%,transparent_100%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl items-start justify-center pt-[19vh] lg:items-center lg:pt-0">
        <div className="grid w-full min-w-0 items-center justify-items-center lg:min-h-[360px] lg:grid-cols-[1fr_1px_372px] lg:gap-14 lg:border-y lg:border-[#eaeaea] lg:bg-white/[0.72] lg:px-12 lg:py-16 lg:shadow-[0_1px_0_rgba(255,255,255,0.92)_inset] lg:backdrop-blur-[1px]">
          <div className="hidden w-full items-center lg:flex">
            <h1 className="max-w-[360px] text-[38px] font-semibold leading-[1.16] text-[#171717]">
              欢迎来到 Splice AI
            </h1>
          </div>
          <div className="hidden h-48 w-px bg-[#ebebeb] lg:block" />

          <form
            className="w-[min(348px,calc(100vw-40px))] max-w-full space-y-4 lg:w-full lg:space-y-5"
            action="/agent-team/api/auth/login"
            method="post"
          >
            <input type="hidden" name="redirect_url" value={nextPath} />

            <div className="flex border-b border-[#eaeaea]">
              <div className="-mb-px border-b border-[#171717] pb-2.5 text-[14px] font-medium leading-6 text-[#171717]">
                账号登录
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="sr-only" htmlFor="username">
                  用户名
                </Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="用户名"
                  required
                  className="h-10 rounded-[6px] border-[#d8d8d8] bg-white px-3 text-[13px] text-[#171717] shadow-[0_1px_0_rgba(0,0,0,0.02)] placeholder:text-[#8f8f8f] hover:border-[#bdbdbd] focus-visible:border-[#171717] focus-visible:ring-[#006bff] focus-visible:ring-offset-2 lg:h-11 lg:px-3.5 lg:text-[14px]"
                />
              </div>

              <div>
                <Label className="sr-only" htmlFor="password">
                  密码
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="密码"
                  required
                  className="h-10 rounded-[6px] border-[#d8d8d8] bg-white px-3 text-[13px] text-[#171717] shadow-[0_1px_0_rgba(0,0,0,0.02)] placeholder:text-[#8f8f8f] hover:border-[#bdbdbd] focus-visible:border-[#171717] focus-visible:ring-[#006bff] focus-visible:ring-offset-2 lg:h-11 lg:px-3.5 lg:text-[14px]"
                />
              </div>
            </div>

            {error ? <p className="text-sm leading-5 text-destructive">{getErrorMessage(error)}</p> : null}

            <Button
              type="submit"
              className="h-10 w-full rounded-[6px] bg-[#171717] text-[13px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(0,0,0,0.12)] hover:bg-black lg:h-11 lg:text-[14px]"
            >
              登录/注册
            </Button>
          </form>
        </div>
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

  if (value === "/agent-team") {
    return "/";
  }

  if (value.startsWith("/agent-team/")) {
    return value.slice("/agent-team".length);
  }

  return value;
}
