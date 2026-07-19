"use client";

import { LockKeyhole, Pencil, Sparkles, X } from "lucide-react";
import type { WishSummary } from "@/types/wish-intake";
import { cn } from "@/lib/utils";
import { wishCreatorFocus } from "@/components/wish-creator/styles";

const FIELDS: Array<{
  key: keyof WishSummary;
  label: string;
  placeholder: string;
  required: boolean;
}> = [
  { key: "title", label: "愿望名称", placeholder: "给愿望起个容易理解的名字", required: true },
  { key: "goal", label: "我想实现", placeholder: "你真正想实现什么", required: true },
  { key: "usageScenario", label: "使用场景", placeholder: "谁会在什么情况下使用", required: true },
  { key: "currentProblem", label: "现在的问题", placeholder: "目前最难解决的是什么", required: true },
  { key: "idealResult", label: "理想结果", placeholder: "做到什么程度算成功", required: true },
  { key: "constraints", label: "补充约束", placeholder: "预算、时间、现有系统等，可留空", required: false },
];

export function WishSummaryPanel({
  confirming,
  error,
  onChange,
  onClose,
  onConfirm,
  summary,
}: {
  confirming: boolean;
  error?: string;
  onChange: (summary: WishSummary) => void;
  onClose: () => void;
  onConfirm: () => void;
  summary: WishSummary;
}) {
  const incompleteFields = FIELDS.filter(
    (field) => field.required && summary[field.key].trim().length < 2,
  );

  return (
    <aside className="fixed inset-0 z-40 flex flex-col overflow-y-auto border-l border-[#3a4640] bg-[#080d0b] px-7 py-8 shadow-[-32px_0_80px_rgba(0,0,0,0.45)] sm:px-9 lg:absolute lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[min(36vw,480px)] lg:px-10 lg:py-12">
      <button aria-label="关闭愿望确认" className={cn(wishCreatorFocus, "absolute right-6 top-6 text-[#9aa49e] hover:text-white")} onClick={onClose} type="button">
        <X className="h-5 w-5" />
      </button>
      <h2 className="pr-8 text-2xl font-black tracking-tight">
        {incompleteFields.length > 0 ? "再补充一点，就说清楚了" : "你的愿望，已经说清楚了"}
      </h2>
      <p className="mt-2 text-sm text-[#7e8a83]">
        {incompleteFields.length > 0
          ? "AI 只整理对话里明确说过的内容，空白项可以直接补充。"
          : "确认无误后，它会进入你的私密愿望库。"}
      </p>
      <div className="mt-9 flex min-h-20 items-start gap-3 text-xl font-bold leading-8 text-[#f0f4b8]">
        <span className="flex-1">{summary.idealResult || "还有一些信息需要补充"}</span>
        <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#b8ff22]" />
      </div>

      <div className="mt-7 flex-1 space-y-5">
        {FIELDS.map((field, index) => (
          <label className="grid grid-cols-[36px_minmax(0,1fr)] gap-3" key={field.key}>
            <span className="pt-0.5 font-mono text-lg text-[#929d97]">{String(index + 1).padStart(2, "0")}</span>
            <span className={cn(
              "border-l border-dashed border-[#536059] pl-4",
              field.required && summary[field.key].trim().length < 2 && "border-[#b8ff22]/70",
            )}>
              <span className="flex items-center gap-2 text-sm font-bold text-white">
                {field.label}
                <Pencil className="ml-auto h-3.5 w-3.5 text-[#8e9993]" />
              </span>
              <textarea
                aria-label={field.label}
                aria-invalid={field.required && summary[field.key].trim().length < 2}
                className="mt-1 min-h-12 w-full resize-none overflow-hidden bg-transparent text-sm leading-6 text-[#aab4ae] outline-none placeholder:text-[#59645e] focus:text-white"
                onChange={(event) => onChange({ ...summary, [field.key]: event.target.value })}
                placeholder={field.placeholder}
                rows={field.key === "title" ? 1 : 2}
                value={summary[field.key]}
              />
            </span>
          </label>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {incompleteFields.length > 0 ? (
        <p className="mt-3 text-sm text-[#f0f4b8]">
          还需要补充：{incompleteFields.map((field) => field.label).join("、")}。
        </p>
      ) : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button className={cn(wishCreatorFocus, "h-12 rounded-lg border border-[#68736d] font-semibold text-[#d5dcd8] hover:border-white")} onClick={onClose} type="button">
          继续聊聊
        </button>
        <button className={cn(wishCreatorFocus, "h-12 rounded-lg bg-[#b8ff22] font-bold text-[#071007] hover:bg-[#c7ff4c] disabled:opacity-50")} disabled={confirming || incompleteFields.length > 0} onClick={onConfirm} type="button">
          {confirming ? "正在提交…" : "确认提交"}
        </button>
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7e8983]">
        <LockKeyhole className="h-3.5 w-3.5" />
        愿望仅你和许愿池团队可见
      </p>
    </aside>
  );
}
