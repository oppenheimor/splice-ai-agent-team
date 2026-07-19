import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WISH_CAPABILITY_GAPS } from "@/constants/wish-intake";
import type { getWishAdminDetail } from "@/lib/wish-intake/admin";

type WishDetail = NonNullable<Awaited<ReturnType<typeof getWishAdminDetail>>>;

export function WishAdminDetail({ wish }: { wish: WishDetail }) {
  return (
    <main className="min-h-screen bg-[#090d0b] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link className="inline-flex items-center gap-2 text-sm text-[#8f9a94] hover:text-white" href="/admin/wishes"><ArrowLeft className="h-4 w-4" />返回愿望观察台</Link>
        <header className="mt-6 rounded-xl border border-[#303c35] bg-[#0f1613] p-6">
          <p className="text-xs text-[#7f8a84]">{wish.user.name || wish.user.username} · {formatDate(wish.submittedAt)}</p>
          <h1 className="mt-2 text-3xl font-black">{wish.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">{wish.capabilityGaps.map((gap) => <span className="rounded-full border border-[#536235] px-3 py-1 text-xs text-[#d5dfa9]" key={gap}>{WISH_CAPABILITY_GAPS.find((item) => item.id === gap)?.label}</span>)}</div>
          <p className="mt-4 text-sm leading-6 text-[#9da8a1]">内部分析：{wish.analysisRationale}</p>
          <p className="mt-1 text-xs text-[#68746d]">分析版本：{wish.analysisVersion} · 联系入口点击 {wish.contactClickCount} 次</p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="我想实现" value={wish.goal} /><Field label="使用场景" value={wish.usageScenario} /><Field label="现在的问题" value={wish.currentProblem} /><Field label="理想结果" value={wish.idealResult} />
          {wish.constraints ? <Field label="补充约束" value={wish.constraints} /> : null}
        </section>

        <section className="mt-6 rounded-xl border border-[#303c35] bg-[#0f1613] p-5">
          <h2 className="text-lg font-bold">原始对话</h2>
          <div className="mt-4 space-y-3">
            {wish.conversation.messages.map((message) => (
              <article className="rounded-lg border border-[#2d3832] bg-[#0b110e] p-4" key={message.id}>
                <p className="text-xs font-bold text-[#b8ff22]">{message.role === "user" ? "用户" : "愿望 Agent"}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#a8b2ac]">{extractText(message.text, message.parts)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return <section className="rounded-xl border border-[#303c35] bg-[#0f1613] p-5"><h2 className="text-sm font-bold text-[#e6ebe8]">{label}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#9da8a1]">{value}</p></section>;
}

function extractText(text: string | null, parts: Prisma.JsonValue | null) {
  if (text) return text;
  if (!Array.isArray(parts)) return "（无文本内容）";
  return parts.flatMap((part) => {
    if (!part || typeof part !== "object" || Array.isArray(part)) return [];
    return part.type === "text" && typeof part.text === "string" ? [part.text] : [];
  }).join("\n") || "（无文本内容）";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(value);
}
