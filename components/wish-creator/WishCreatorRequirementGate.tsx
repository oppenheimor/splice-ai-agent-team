"use client";

import { ListTree, Sparkles, UserRound } from "lucide-react";
import type { WishCreatorRequirementPath } from "@/types/wish-creator";
import { cn } from "@/lib/utils";
import { wishCreatorFocus } from "./styles";

export function WishCreatorRequirementGate({
  disabled,
  onChoose,
  requirement,
}: {
  readonly disabled: boolean;
  readonly onChoose: (path: WishCreatorRequirementPath) => void;
  readonly requirement: string;
}) {
  return (
    <div className="space-y-4">
      <article className="rounded-xl border border-[#28322d] bg-[#0d1411]/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
        <header className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#dfe5e1]">
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-[#29302c]">
            <UserRound className="h-4 w-4" />
          </span>
          <span>你</span>
        </header>
        <p className="whitespace-pre-wrap text-sm leading-7 text-[#c7cfca]">{requirement}</p>
      </article>

      <article className="rounded-xl border border-[#3b4c27] bg-[#0d1411]/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
        <header className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#dfe5e1]">
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-[#b8ff22] text-[#071007]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>许愿池 Agent</span>
        </header>
        <p className="text-sm leading-7 text-[#c7cfca]">
          我可以先和你一起把需求拆清楚，也可以直接开始。你的选择会决定接下来的创作路径。
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            className={cn(wishCreatorFocus, "flex items-center justify-center gap-2 rounded-lg bg-[#b8ff22] px-4 py-2.5 text-xs font-semibold text-[#071007] disabled:opacity-50")}
            disabled={disabled}
            onClick={() => onChoose("clarify")}
            type="button"
          >
            <ListTree className="h-3.5 w-3.5" />先拆解需求（推荐）
          </button>
          <button
            className={cn(wishCreatorFocus, "rounded-lg border border-[#3a463f] bg-[#111815] px-4 py-2.5 text-xs font-semibold text-[#d5dcd7] hover:border-[#728351] disabled:opacity-50")}
            disabled={disabled}
            onClick={() => onChoose("direct")}
            type="button"
          >
            直接创建
          </button>
        </div>
      </article>
    </div>
  );
}
