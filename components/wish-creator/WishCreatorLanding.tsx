"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, CookingPot, Gamepad2, Gift } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { WISH_CREATOR_AGENT_ID, WISH_CREATOR_STARTERS } from "@/constants/wish-creator";
import type { AgentConversation } from "@/lib/agent-team/agents/types";
import {
  deleteAgentConversation,
  fetchAgentConversationSummaries,
  renameAgentConversation,
} from "@/lib/agent-team/conversations/client-conversation-api";
import { createId } from "@/lib/agent-team/id";
import { setPendingWishCreatorPrompt } from "@/lib/wish-creator/pending-prompt";
import { cn } from "@/lib/utils";
import {
  WishCreatorMobileMenuButton,
  WishCreatorNavigation,
} from "./WishCreatorNavigation";
import { wishCreatorFocus, wishCreatorGrid, wishCreatorPanel } from "./styles";

const STARTER_ICONS = [Gamepad2, CookingPot, Gift] as const;

export function WishCreatorLanding() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setConversations(await fetchAgentConversationSummaries(WISH_CREATOR_AGENT_ID));
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  function startConversation(prompt?: string) {
    const conversationId = createId(WISH_CREATOR_AGENT_ID);
    const content = prompt?.trim();
    if (content) setPendingWishCreatorPrompt(conversationId, content);
    router.push(`/wish-creator/session/${conversationId}`);
  }

  function openConversation(conversation: AgentConversation) {
    setMobileOpen(false);
    router.push(`/wish-creator/session/${conversation.id}`);
  }

  function resetDraft() {
    setInput("");
    setMobileOpen(false);
    queueMicrotask(() => inputRef.current?.focus());
  }

  async function deleteConversation(conversationId: string) {
    await deleteAgentConversation(WISH_CREATOR_AGENT_ID, conversationId);
    await refresh();
  }

  async function renameConversation(conversationId: string, title: string) {
    const updated = await renameAgentConversation(WISH_CREATOR_AGENT_ID, conversationId, title);
    if (!updated) return;
    setConversations((items) => items.map((item) => item.id === conversationId ? updated : item));
  }

  return (
    <main className={cn(wishCreatorGrid, "h-dvh overflow-hidden text-white")}>
      <div className="flex h-full">
        <WishCreatorNavigation
          collapsed={collapsed}
          conversations={conversations}
          loading={loading}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onCreate={resetDraft}
          onDelete={(id) => void deleteConversation(id)}
          onOpen={openConversation}
          onRename={(id, title) => void renameConversation(id, title)}
          onToggle={() => setCollapsed((value) => !value)}
        />
        <WishCreatorMobileMenuButton onClick={() => setMobileOpen(true)} />

        <section className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-12 sm:px-8 sm:py-14 lg:overflow-y-hidden lg:px-16 lg:py-[clamp(2rem,5dvh,4.5rem)] xl:px-20">
          <Image
            alt="从一句愿望生成网页"
            className="pointer-events-none absolute right-[-7rem] top-[clamp(1.5rem,4dvh,2.5rem)] hidden h-[min(38dvh,420px)] w-auto object-cover opacity-80 xl:block"
            height={640}
            priority
            src="/agent-team/wish-creator/wish-to-page-wireframe.png"
            width={1120}
          />
          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1040px] flex-col justify-center">
            <p className="font-mono text-sm font-semibold tracking-[0.28em] text-[#b8ff22]">WISH → PAGE</p>
            <h1 className="mt-3 text-[clamp(3.75rem,8vw,7.2rem)] font-black leading-[0.92] tracking-[-0.075em] text-white lg:mt-[clamp(0.5rem,1.4dvh,1rem)]">许愿池</h1>
            <h2 className="mt-6 text-[clamp(1.65rem,3vw,2.55rem)] font-bold tracking-tight lg:mt-[clamp(1rem,2.6dvh,1.75rem)]">今天，想让网页替你做点什么？</h2>
            <p className="mt-3 text-sm leading-7 text-[#8c9891] sm:text-base">一句话生成能运行的小页面，边聊边改，满意后发布成链接。</p>

            <form
              className={cn(wishCreatorPanel, "mt-10 rounded-xl border-[#9bd925] p-3 focus-within:border-[#b8ff22] sm:p-4 lg:mt-[clamp(1.75rem,4dvh,3rem)]")}
              onSubmit={(event) => {
                event.preventDefault();
                if (input.trim()) startConversation(input);
              }}
            >
              <textarea
                aria-label="描述想做的页面"
                className="h-28 w-full resize-none bg-transparent px-2 py-1 text-base leading-7 text-white outline-none placeholder:text-[#657069] sm:h-24 sm:text-lg lg:h-[clamp(4.75rem,9dvh,6.5rem)]"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  // 中文输入法确认候选词时也会触发 Enter，组合输入结束前不能发送。
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    if (input.trim()) startConversation(input);
                  }
                }}
                placeholder="描述你想做的页面…"
                ref={inputRef}
                value={input}
              />
              <div className="flex justify-end">
                <button
                  aria-label="开始生成"
                  className={cn(wishCreatorFocus, "grid h-12 w-12 place-items-center rounded-full bg-[#b8ff22] text-[#071007] transition-transform hover:scale-105 disabled:opacity-40 lg:h-11 lg:w-11")}
                  disabled={!input.trim()}
                  type="submit"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </form>

            <div className={cn(wishCreatorPanel, "mt-5 grid overflow-hidden rounded-xl md:grid-cols-3 lg:mt-[clamp(0.875rem,2dvh,1.5rem)]")}>
              {WISH_CREATOR_STARTERS.map((starter, index) => {
                const Icon = STARTER_ICONS[index];
                return (
                  <button
                    className={cn(
                      wishCreatorFocus,
                      "flex min-h-24 items-start gap-4 px-5 py-4 text-left hover:bg-[#111914]",
                      index > 0 && "border-t border-[#263029] md:border-l md:border-t-0",
                    )}
                    key={starter.title}
                    onClick={() => startConversation(starter.prompt)}
                    type="button"
                  >
                    <Icon className="mt-1 h-7 w-7 shrink-0 text-[#b8ff22]" />
                    <span>
                      <span className="block text-base font-semibold text-[#e8ece9]">{starter.title}</span>
                      <span className="mt-2 block text-xs leading-5 text-[#7d8881]">{starter.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
