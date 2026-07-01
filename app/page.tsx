import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

const agents = [
  {
    name: "初步诊断",
    suffix: "Agent",
    href: "/requirements-diagnosis",
    meta: "业务现状 / AI 优先级",
    description: "用结构化问题快速判断，适合先摸清方向。",
    orbStyle: { background: "linear-gradient(135deg, #00e1ff 0%, #0077ff 100%)" },
    hoverShadow: "inset 0 -4px 12px rgba(0,0,0,0.1), 0 16px 32px rgba(0, 119, 255, 0.25)",
    hoverColor: "#0077ff"
  },
  {
    name: "深度诊断",
    suffix: "Agent",
    href: "/deep-diagnosis",
    meta: "业务现场 / 落地路径",
    description: "持续追问和收束，适合认真推演一件事。",
    orbStyle: { background: "linear-gradient(135deg, #9d00ff 0%, #5000ff 100%)" },
    hoverShadow: "inset 0 -4px 12px rgba(0,0,0,0.1), 0 16px 32px rgba(157, 0, 255, 0.25)",
    hoverColor: "#8a2be2"
  },
  {
    name: "寻宝游戏",
    suffix: "Agent",
    href: "/treasure/hunt",
    meta: "生日聚会 / 创意策划",
    description: "把一个惊喜活动变成能照着执行的路线。",
    orbStyle: { background: "linear-gradient(135deg, #ff3b7c 0%, #ff9a44 100%)" },
    hoverShadow: "inset 0 -4px 12px rgba(0,0,0,0.1), 0 16px 32px rgba(255, 59, 124, 0.25)",
    hoverColor: "#ff3b7c"
  },
] as const;

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fa] text-[#111418] antialiased" style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
          100% { transform: translate(50px, 20px) scale(1.02); }
        }
        .orb-shadow-base {
          box-shadow: inset 0 -4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.06);
        }
      `}</style>

      {/* Background System */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f5f7fa]">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(17,20,24,0.03)_1px,transparent_1px)] bg-[size:32px_32px] z-[1]" />
        <div className="absolute top-[25%] left-[10%] w-[450px] h-[450px] rounded-full bg-[rgba(0,160,255,0.08)] blur-[100px] animate-[float_20s_ease-in-out_infinite_alternate] z-0" />
        <div className="absolute top-[35%] left-[45%] w-[550px] h-[550px] rounded-full bg-[rgba(140,50,255,0.06)] blur-[100px] animate-[float_20s_ease-in-out_infinite_alternate] [animation-delay:-5s] z-0" />
        <div className="absolute top-[25%] right-[10%] w-[500px] h-[500px] rounded-full bg-[rgba(255,80,120,0.06)] blur-[100px] animate-[float_20s_ease-in-out_infinite_alternate] [animation-delay:-10s] z-0" />
      </div>

      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1200px] flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-white/60 backdrop-blur-[24px] backdrop-saturate-[1.8] border border-white/80 rounded-full z-[100] shadow-[0_4px_24px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 sm:gap-[10px] text-[18px] sm:text-[20px] font-extrabold tracking-[-0.5px] text-[#111418] whitespace-nowrap"
        >
          <span className="block shrink-0 w-2 h-2 rounded-full bg-[linear-gradient(135deg,#00e1ff_0%,#0077ff_100%)] shadow-[0_0_10px_2px_rgba(0,119,255,0.4)]" />
          Splice AI
        </Link>

        {user ? (
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <span className="truncate max-w-[100px] sm:max-w-none text-[13px] sm:text-[14px] font-medium text-[#6b7280]">
              {user.displayName}
            </span>
            <form action="/agent-team/api/auth/logout" method="post" className="shrink-0">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-white/60 border border-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[12px] sm:text-[13px] font-semibold text-[#6b7280] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-[600ms] hover:-translate-y-[1px] hover:bg-white hover:text-[#111418] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] whitespace-nowrap"
              >
                退出 <span className="hidden sm:inline font-sans text-[14px] leading-none mb-[2px]">⎋</span>
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex shrink-0 items-center gap-1.5 bg-white/60 border border-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[12px] sm:text-[13px] font-semibold text-[#6b7280] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-[600ms] hover:-translate-y-[1px] hover:bg-white hover:text-[#111418] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] whitespace-nowrap"
          >
            登录
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-6 pt-[160px] pb-[80px]">
        <div className="mb-16">
          <h1 className="text-[40px] font-extrabold tracking-[-1px] text-[#111418] mb-3">
            选择你要调用的 Agent
          </h1>
          <p className="font-mono text-[15px] font-medium uppercase tracking-[1px] text-[#6b7280]">
            Select an Agent to initialize workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {agents.map((agent, index) => (
            <Link
              key={agent.href}
              href={agent.href}
              className="group relative flex flex-col overflow-hidden rounded-[32px] p-[40px_32px] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-[linear-gradient(135deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.4)_100%)] border border-white/80 backdrop-blur-[24px] backdrop-saturate-[1.4] shadow-[0_12px_32px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-2 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.6)_100%)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,1)] hover:border-white"
            >
              {/* Glare effect on the glass */}
              <span className="pointer-events-none absolute top-0 -left-[100%] w-1/2 h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] -skew-x-[20deg] transition-[left] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10 group-hover:left-[200%]" />

              {/* Number watermark */}
              <span className="absolute top-6 right-8 text-[64px] font-extrabold text-black/[0.03] font-mono z-0 transition-all duration-[600ms] tracking-[-2px] group-hover:text-black/[0.06] group-hover:translate-x-1">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Orb container */}
              <div className="relative z-10 flex items-center justify-start h-[80px] mb-8">
                <div
                  className={`relative w-[56px] h-[56px] rounded-full transition-all duration-[600ms] orb-shadow-base group-hover:scale-110 group-hover:-translate-y-1 orb-${index}`}
                  style={{
                    ...agent.orbStyle
                  } as React.CSSProperties}
                >
                  {/* Inner reflection */}
                  <span className="absolute left-[8px] top-[4px] w-[20px] h-[16px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.9),transparent)] -rotate-[20deg]" />
                  
                  <style>{`
                    .group:hover .orb-${index} {
                      box-shadow: ${agent.hoverShadow} !important;
                    }
                  `}</style>
                </div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-1 flex-col">
                <p className="text-[13px] text-[#6b7280] mb-3 font-semibold tracking-[0.5px] uppercase">
                  {agent.meta}
                </p>

                <h2 className="flex items-center gap-2 text-[26px] font-extrabold tracking-[-0.5px] text-[#111418] mb-3">
                  {agent.name} <span className="text-[#8b7a65] font-bold">{agent.suffix}</span>
                </h2>

                <p className="text-[14px] text-[#6b7280] leading-[1.6] mb-[40px]">
                  {agent.description}
                </p>

                {/* Action Row */}
                <div className="mt-auto flex items-center justify-end pt-6 border-t border-black/5">
                  <style>{`
                    .group:hover .btn-text-${index} { color: ${agent.hoverColor}; }
                  `}</style>
                  <span className={`flex items-center gap-1 text-[15px] font-bold text-[#111418] transition-colors duration-[600ms] btn-text-${index}`}>
                    打开
                    <span className="font-sans text-[18px] transition-transform duration-[600ms] group-hover:translate-x-[6px]">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
