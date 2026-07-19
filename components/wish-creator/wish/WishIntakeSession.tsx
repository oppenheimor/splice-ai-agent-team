"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { WISH_INTAKE_AGENT_ID } from "@/constants/wish-intake";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { useAgentChat } from "@/lib/agent-team/chat/useAgentChat";
import { cn } from "@/lib/utils";
import type { WishSummary } from "@/types/wish-intake";
import { APP_BASE_PATH } from "@/utils/routing";
import { wishCreatorFocus, wishCreatorGrid } from "@/components/wish-creator/styles";
import { WishIntakeFrame } from "@/components/wish-creator/wish/WishIntakeNavigation";
import { WishIntakeMessages } from "@/components/wish-creator/wish/WishIntakeMessages";
import { WishSummaryPanel } from "@/components/wish-creator/wish/WishSummaryPanel";

const wishAgent = getAgentById(WISH_INTAKE_AGENT_ID);

export function WishIntakeSession({ conversationId }: { conversationId: string }) {
  if (!wishAgent) throw new Error("愿望 Agent 未注册。");
  return <WishIntakeWorkspace conversationId={conversationId} />;
}

function WishIntakeWorkspace({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);
  const chat = useAgentChat(wishAgent!, { persistence: "database", conversationId });
  const [summary, setSummary] = useState<WishSummary>();
  const [drafting, setDrafting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const hasUserMessage = useMemo(() => chat.messages.some((message) => message.role === "user"), [chat.messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: chat.isBusy ? "auto" : "smooth" });
  }, [chat.isBusy, chat.messages]);

  async function createSummary() {
    if (!hasUserMessage || chat.isBusy || drafting) return;
    setDrafting(true);
    setError(undefined);
    try {
      const response = await fetch(`${APP_BASE_PATH}/api/wish-creator/wishes/draft`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const payload = await response.json() as { summary?: WishSummary; error?: string };
      if (!response.ok || !payload.summary) throw new Error(payload.error || "整理愿望失败。");
      setSummary(payload.summary);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "整理愿望失败。");
    } finally {
      setDrafting(false);
    }
  }

  async function confirmWish() {
    if (!summary || confirming) return;
    setConfirming(true);
    setError(undefined);
    try {
      const response = await fetch(`${APP_BASE_PATH}/api/wish-creator/wishes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId, summary }),
      });
      const payload = await response.json() as { wish?: { id: string }; error?: string };
      if (!response.ok || !payload.wish) throw new Error(payload.error || "提交愿望失败。");
      router.push(`/wish-creator/wishes/${payload.wish.id}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "提交愿望失败。");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <WishIntakeFrame active="new">
      <section className={cn(wishCreatorGrid, "relative flex h-full min-w-0 flex-col overflow-hidden")}>
        <header className={cn("flex items-start justify-between gap-4 px-5 pb-5 pt-16 transition-[padding] sm:px-8 lg:px-9 lg:pt-20", summary && "lg:pr-[516px]")}>
          <div>
            <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] font-black tracking-tight">这里做不了，也不代表做不到</h1>
            <p className="mt-2 text-sm text-[#8d9992]">和我聊聊你真正想实现的东西，我会帮你把愿望说清楚。</p>
          </div>
          <button
            className={cn(wishCreatorFocus, "hidden h-11 shrink-0 items-center rounded-lg bg-[#b8ff22] px-5 text-sm font-bold text-[#071007] hover:bg-[#c7ff4c] disabled:opacity-40 sm:flex")}
            disabled={!hasUserMessage || chat.isBusy || drafting}
            onClick={() => void createSummary()}
            type="button"
          >
            {drafting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            提交你的想法
          </button>
        </header>

        <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-5 transition-[padding] sm:px-8 lg:px-9", summary && "lg:pr-[516px]")}>
          <div className="mx-auto max-w-[760px] py-4">
            {chat.isLoadingActiveConversation ? <p className="text-center text-sm text-[#76827b]">正在打开愿望对话…</p> : null}
            <WishIntakeMessages messages={chat.messages} />
            {chat.isBusy ? <p className="mt-4 flex items-center gap-2 text-sm text-[#87928c]"><LoaderCircle className="h-4 w-4 animate-spin text-[#b8ff22]" />正在认真理解你的想法…</p> : null}
            <div ref={endRef} />
          </div>
        </div>

        <div className={cn("border-t border-[#27312c] bg-[#080d0b]/96 px-5 py-4 transition-[padding] sm:px-8 lg:px-9", summary && "lg:pr-[516px]")}>
          <form
            className="mx-auto flex max-w-[760px] items-end gap-3 rounded-xl border border-[#3c4842] bg-[#111816] p-3 focus-within:border-[#6e8a3f]"
            onSubmit={(event) => {
              event.preventDefault();
              chat.sendText();
            }}
          >
            <textarea
              aria-label="继续说说你的想法"
              className="min-h-16 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-6 text-white outline-none placeholder:text-[#6e7973]"
              disabled={chat.isBusy}
              onChange={(event) => chat.setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  chat.sendText();
                }
              }}
              placeholder="继续说说你的想法…"
              value={chat.input}
            />
            <button aria-label="发送" className={cn(wishCreatorFocus, "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b8ff22] text-[#071007] disabled:opacity-40")} disabled={!chat.input.trim() || chat.isBusy} type="submit">
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <button className={cn(wishCreatorFocus, "mt-3 h-11 w-full rounded-lg bg-[#b8ff22] text-sm font-bold text-[#071007] disabled:opacity-40 sm:hidden")} disabled={!hasUserMessage || chat.isBusy || drafting} onClick={() => void createSummary()} type="button">
            {drafting ? "正在整理…" : "提交你的想法"}
          </button>
          {error && !summary ? <p className="mx-auto mt-2 max-w-[760px] text-sm text-red-300">{error}</p> : null}
          <p className="mt-2 text-center text-[11px] text-[#66716b]">暂不支持上传文件，你可以先用文字描述已有资料。</p>
        </div>

        {summary ? (
          <WishSummaryPanel
            confirming={confirming}
            error={error}
            onChange={setSummary}
            onClose={() => {
              setSummary(undefined);
              setError(undefined);
            }}
            onConfirm={() => void confirmWish()}
            summary={summary}
          />
        ) : null}
      </section>
    </WishIntakeFrame>
  );
}
