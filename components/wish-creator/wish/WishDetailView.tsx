import Link from "next/link";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { WishIntakeFrame } from "@/components/wish-creator/wish/WishIntakeNavigation";
import { WishDetailActions } from "@/components/wish-creator/wish/WishDetailActions";
import { wishCreatorGrid } from "@/components/wish-creator/styles";
import type { WishRecord, WishSummary } from "@/types/wish-intake";
import { cn } from "@/lib/utils";

const FIELDS: Array<{ key: keyof WishSummary; label: string }> = [
  { key: "goal", label: "我想实现" },
  { key: "usageScenario", label: "使用场景" },
  { key: "currentProblem", label: "现在的问题" },
  { key: "idealResult", label: "理想结果" },
  { key: "constraints", label: "补充约束" },
];

export function WishDetailView({ wish }: { wish: WishRecord }) {
  return (
    <WishIntakeFrame active="list">
      <section className={cn(wishCreatorGrid, "h-full overflow-y-auto px-5 pb-12 pt-20 sm:px-9 lg:px-12 lg:pt-10")}>
        <div className="mx-auto max-w-4xl">
          <Link className="inline-flex items-center gap-2 text-sm text-[#8f9a94] hover:text-white" href="/wish-creator/wishes">
            <ArrowLeft className="h-4 w-4" />返回我的愿望
          </Link>
          <div className="mt-7 rounded-2xl border border-[#3a4740] bg-[#0d1411]/94 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-9">
            <header className="border-b border-[#2e3933] pb-7">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#b8ff22]"><CheckCircle2 className="h-4 w-4" />愿望已提交</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{wish.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-xs text-[#77837c]"><LockKeyhole className="h-3.5 w-3.5" />仅你和许愿池团队可见</p>
            </header>
            <div className="mt-7 space-y-7">
              {FIELDS.map((field, index) => wish[field.key] ? (
                <section className="grid gap-3 sm:grid-cols-[52px_minmax(0,1fr)]" key={field.key}>
                  <span className="font-mono text-xl text-[#79857e]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="border-l border-dashed border-[#526058] pl-5">
                    <h2 className="text-sm font-bold text-white">{field.label}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#a7b1ab]">{wish[field.key]}</p>
                  </div>
                </section>
              ) : null)}
            </div>
            <WishDetailActions wishId={wish.id} wishTitle={wish.title} />
          </div>
        </div>
      </section>
    </WishIntakeFrame>
  );
}
