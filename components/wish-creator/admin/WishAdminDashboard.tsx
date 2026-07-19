import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, MessageCircleMore, Search, Star, Users } from "lucide-react";
import { WISH_CAPABILITY_GAPS } from "@/constants/wish-intake";
import type { getWishAdminDashboard } from "@/lib/wish-intake/admin";

type Dashboard = Awaited<ReturnType<typeof getWishAdminDashboard>>;

export function WishAdminDashboard({
  dashboard,
  filters,
  username,
}: {
  dashboard: Dashboard;
  filters: { query?: string; capabilityGap?: string };
  username: string;
}) {
  const maxTrend = Math.max(1, ...dashboard.trend.map((item) => item.count));
  return (
    <main className="min-h-screen bg-[#090d0b] px-5 py-7 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#2c3731] pb-6">
          <Link className="inline-flex items-center gap-2 text-sm text-[#8f9a94] hover:text-white" href="/wish-creator"><ArrowLeft className="h-4 w-4" />返回许愿池</Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold tracking-[0.2em] text-[#b8ff22]">PRIVATE WISH ADMIN</p><h1 className="mt-2 text-3xl font-black">愿望观察台</h1></div>
            <p className="text-sm text-[#7e8983]">管理员：{username} · 只读</p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard icon={<Star className="h-5 w-5" />} label="愿望总数" value={dashboard.metrics.totalWishes} />
          <MetricCard icon={<Users className="h-5 w-5" />} label="提交用户" value={dashboard.metrics.uniqueUsers} />
          <MetricCard icon={<MessageCircleMore className="h-5 w-5" />} label="联系入口点击" value={dashboard.metrics.contactClicks} />
        </section>

        <section className="mt-6 rounded-xl border border-[#303c35] bg-[#0f1613] p-5">
          <h2 className="text-sm font-bold">最近提交趋势</h2>
          {dashboard.trend.length ? (
            <div className="mt-5 flex h-32 items-end gap-1.5" aria-label="最近愿望提交趋势">
              {dashboard.trend.map((item) => (
                <div className="group flex min-w-0 flex-1 flex-col items-center justify-end" key={item.date} title={`${item.date}：${item.count} 条`}>
                  <div className="w-full max-w-7 rounded-t bg-[#b8ff22]/75 transition group-hover:bg-[#b8ff22]" style={{ height: `${Math.max(10, item.count / maxTrend * 100)}%` }} />
                  <span className="mt-2 hidden text-[9px] text-[#68736d] xl:block">{item.date.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-sm text-[#6f7b74]">还没有愿望数据。</p>}
        </section>

        <form className="mt-6 grid gap-3 rounded-xl border border-[#303c35] bg-[#0f1613] p-4 md:grid-cols-[minmax(0,1fr)_240px_auto]" method="get">
          <label className="flex h-11 items-center gap-2 rounded-lg border border-[#3a4640] px-3"><Search className="h-4 w-4 text-[#7f8a84]" /><input className="w-full bg-transparent text-sm outline-none placeholder:text-[#657069]" defaultValue={filters.query} name="query" placeholder="搜索标题、需求、场景或用户名" /></label>
          <select className="h-11 rounded-lg border border-[#3a4640] bg-[#0d1411] px-3 text-sm text-[#c9d0cc]" defaultValue={filters.capabilityGap || ""} name="capabilityGap">
            <option value="">全部能力缺口</option>
            {WISH_CAPABILITY_GAPS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <button className="h-11 rounded-lg bg-[#b8ff22] px-5 text-sm font-bold text-[#071007]" type="submit">筛选</button>
        </form>

        <section className="mt-6 overflow-hidden rounded-xl border border-[#303c35] bg-[#0f1613]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#141c18] text-xs text-[#7f8a84]"><tr><th className="px-4 py-3">愿望</th><th className="px-4 py-3">用户</th><th className="px-4 py-3">能力缺口</th><th className="px-4 py-3">联系点击</th><th className="px-4 py-3">提交时间</th><th className="px-4 py-3" /></tr></thead>
              <tbody>
                {dashboard.wishes.map((wish) => (
                  <tr className="border-t border-[#28322d]" key={wish.id}>
                    <td className="max-w-[360px] px-4 py-4"><p className="font-semibold text-white">{wish.title}</p><p className="mt-1 truncate text-xs text-[#7f8a84]">{wish.goal}</p></td>
                    <td className="px-4 py-4">{wish.user.name || wish.user.username}</td>
                    <td className="px-4 py-4"><div className="flex flex-wrap gap-1">{wish.capabilityGaps.map((gap) => <span className="rounded-full border border-[#45522f] px-2 py-1 text-[11px] text-[#c4d19f]" key={gap}>{getGapLabel(gap)}</span>)}</div></td>
                    <td className="px-4 py-4 text-center">{wish.contactClickCount}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-[#8d9892]">{formatDate(wish.submittedAt)}</td>
                    <td className="px-4 py-4"><Link aria-label={`查看 ${wish.title}`} className="text-[#b8ff22]" href={`/admin/wishes/${wish.id}`}><ArrowRight className="h-4 w-4" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!dashboard.wishes.length ? <p className="p-8 text-center text-sm text-[#77837c]">没有符合条件的愿望。</p> : null}
        </section>
      </div>
    </main>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="rounded-xl border border-[#303c35] bg-[#0f1613] p-5"><div className="flex items-center gap-2 text-[#9ba69f]">{icon}<span className="text-sm">{label}</span></div><strong className="mt-3 block text-3xl text-[#eaffad]">{value.toLocaleString("zh-CN")}</strong></div>;
}

function getGapLabel(id: string) {
  return WISH_CAPABILITY_GAPS.find((item) => item.id === id)?.label || id;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(value);
}
