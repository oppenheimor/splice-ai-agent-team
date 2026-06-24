import Link from "next/link";
import { ArrowRight, Compass, LogOut, MessageSquareText, SearchCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

const agents = [
  {
    name: "初步诊断",
    suffix: "Agent",
    href: "/requirements-diagnosis",
    icon: SearchCheck,
    meta: "业务现状 / AI 优先级",
    description: "用结构化问题快速判断，适合先摸清方向。",
  },
  {
    name: "深度诊断",
    suffix: "Agent",
    href: "/deep-diagnosis",
    icon: MessageSquareText,
    meta: "业务现场 / 落地路径",
    description: "持续追问和收束，适合认真推演一件事。",
  },
  {
    name: "寻宝游戏",
    suffix: "Agent",
    href: "/treasure/hunt",
    icon: Compass,
    meta: "生日聚会 / 创意策划",
    description: "把一个惊喜活动变成能照着执行的路线。",
  },
] as const;

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-4 py-4 text-[#171511] sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-7xl flex-col rounded-[10px] border border-[#e2dbcf] bg-[#fffdfa]">
        <header className="flex min-h-20 items-center justify-between border-b border-[#e2dbcf] px-5 py-4 sm:min-h-24 sm:px-7">
          <Link
            href="/"
            className="text-[34px] font-semibold leading-none tracking-normal text-[#171511] sm:text-[42px]"
          >
            Splice AI
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-[13px] text-[#6f6658] sm:inline">
                {user.displayName}
              </span>
              <form action="/agent-team/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[#d7cec0] bg-[#fbf7f0] px-3 text-[13px] font-medium text-[#171511] transition-colors hover:border-[#b4a998] cursor-pointer"
                >
                  退出
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[#d7cec0] bg-[#fbf7f0] px-3 text-[13px] font-medium text-[#171511] transition-colors hover:border-[#b4a998]"
            >
              登录
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </header>

        <div className="flex-1 px-5 py-9 sm:px-7 sm:py-12 lg:px-10 lg:py-14">
          <h1 className="text-[24px] font-semibold leading-tight tracking-normal text-[#171511] sm:text-[28px]">
            请选择你想体验的 Agent
          </h1>

          <section className="mt-8 divide-y divide-[#e2dbcf] border-y border-[#e2dbcf] sm:mt-9">
            {agents.map((agent, index) => {
              const Icon = agent.icon;

              return (
                <Link
                  key={agent.href}
                  href={agent.href}
                  className="group grid gap-5 py-7 transition-colors hover:bg-[#f4eee5] sm:grid-cols-[64px_minmax(0,1fr)_96px] sm:items-center sm:px-4 lg:py-7"
                >
                  <div className="flex items-center gap-4 sm:block">
                    <span className="flex h-12 w-12 items-center justify-center rounded-[8px] border border-[#d7cec0] bg-[#fbf7f0] text-[#171511]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[13px] text-[#9a8f7d] sm:mt-3 sm:block">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#827767]">
                      {agent.meta}
                    </p>
                    <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-normal text-[#171511] sm:text-[30px]">
                      {agent.name}
                      <span className="ml-2 text-[#9a8f7d]">{agent.suffix}</span>
                    </h2>
                    <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#6f6658]">
                      {agent.description}
                    </p>
                  </div>

                  <div className="flex items-center text-[14px] font-medium text-[#171511] sm:justify-end">
                    打开
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </section>
    </main>
  );
}
