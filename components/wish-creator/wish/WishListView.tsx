import Link from "next/link";
import { ArrowRight, LockKeyhole, MessageCircleMore, Plus, Star } from "lucide-react";
import { WishIntakeFrame } from "@/components/wish-creator/wish/WishIntakeNavigation";
import { wishCreatorGrid } from "@/components/wish-creator/styles";
import type { WishListItem } from "@/types/wish-intake";
import { cn } from "@/lib/utils";

export function WishListView({ items }: { items: WishListItem[] }) {
  return (
    <WishIntakeFrame active="list">
      <section className={cn(wishCreatorGrid, "h-full overflow-y-auto px-5 pb-12 pt-12 sm:px-8 lg:px-10")}>
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-col gap-5 border-b border-[#2c3731] pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.24em] text-[#b8ff22]">PRIVATE WISHES</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">我的愿望</h1>
              <p className="mt-2 text-sm text-[#89958e]">继续还没说完的愿望，或查看已经提交的愿望。</p>
            </div>
            <Link className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b8ff22] px-5 text-sm font-bold text-[#071007]" href="/wish-creator/wish">
              <Plus className="h-4 w-4" />
              再说一个愿望
            </Link>
          </header>

          {items.length ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <Link
                  className="group rounded-xl border border-[#344039] bg-[#101714]/92 p-5 transition hover:border-[#72913a]"
                  href={getItemHref(item)}
                  key={item.conversationId}
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#435029] bg-[#111b10] text-[#b8ff22]">
                      {item.status === "submitted"
                        ? <Star className="h-5 w-5" />
                        : <MessageCircleMore className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-lg font-bold">{item.title}</h2>
                        <span className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          item.status === "submitted"
                            ? "border-[#53652e] text-[#b8ff22]"
                            : "border-[#46534c] text-[#9ba69f]",
                        )}>
                          {item.status === "submitted" ? "已提交" : "还没说完"}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#9ba69f]">{item.preview}</p>
                    </div>
                    <ArrowRight className="mt-2 h-4 w-4 text-[#67736c] transition group-hover:translate-x-1 group-hover:text-[#b8ff22]" />
                  </div>
                  <p className="mt-5 border-t border-[#29332e] pt-3 text-xs text-[#68746d]">
                    {item.status === "submitted" ? "查看愿望" : "继续说清楚"}
                    <span className="mx-2">·</span>
                    {formatDate(item.activityAt)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-16 grid place-items-center rounded-xl border border-dashed border-[#3a4640] bg-[#0d1411]/80 px-6 py-16 text-center">
              <LockKeyhole className="h-9 w-9 text-[#b8ff22]" />
              <h2 className="mt-5 text-xl font-bold">还没有说过愿望</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#87938c]">说出第一句话后，我们就会替你保留，之后可以随时回来继续。</p>
              <Link className="mt-6 rounded-lg bg-[#b8ff22] px-5 py-3 text-sm font-bold text-[#071007]" href="/wish-creator/wish">说出一个愿望</Link>
            </div>
          )}
        </div>
      </section>
    </WishIntakeFrame>
  );
}

function getItemHref(item: WishListItem): string {
  return item.status === "submitted"
    ? `/wish-creator/wishes/${item.wishId}`
    : `/wish-creator/wish/session/${item.conversationId}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(value));
}
