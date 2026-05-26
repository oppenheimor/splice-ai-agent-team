"use client";

import { useRouter } from "next/navigation";
import {
  Button as IslandButton,
  Card as IslandCard,
  Icon as IslandIcon,
} from "animal-island-ui";
import { Plus, Send, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTreasureAnalytics } from "@/lib/analytics/useTreasureAnalytics";
import type { AgentConversation, AgentManifest } from "@/lib/agent-team/agents/types";
import { useAgentChat } from "@/lib/agent-team/chat/useAgentChat";
import { popPendingPrompt } from "@/lib/agent-team/storage/pending-prompts";
import { cn } from "@/lib/utils";
import {
  TreasureHuntConversationList,
  TreasureHuntHistoryButton,
  TreasureHuntHistoryDrawer,
} from "./TreasureHuntConversationHistory";
import { TreasureHuntMessagePartsRenderer } from "./TreasureHuntMessagePartsRenderer";
import {
  treasureComposer,
  treasureComposerInput,
  treasureIconButton,
  treasureHistoryRoundButton,
  treasureMessageCard,
  treasureScrollbarHidden,
  treasureSendButton,
  treasureShell,
  treasureSky,
  treasureUserMessageCard,
} from "./styles";

export function TreasureHuntChatShell({
  agent,
  conversationId,
}: {
  agent: AgentManifest;
  conversationId: string;
}) {
  const router = useRouter();
  useTreasureAnalytics(conversationId);
  const chat = useAgentChat(agent, { conversationId });
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const pendingPromptSentRef = useRef(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      const scroller = scrollRef.current;
      if (!scroller) return;
      scroller.scrollTop = scroller.scrollHeight;
      rafRef.current = null;
    });
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [chat.messages, chat.isBusy]);

  useEffect(() => {
    if (pendingPromptSentRef.current || !chat.activeConversation || chat.isBusy)
      return;
    const prompt = popPendingPrompt(chat.activeConversation.id);
    if (!prompt) return;
    pendingPromptSentRef.current = true;
    chat.sendText(prompt);
  }, [chat]);

  function handleScroll() {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const distanceToBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    shouldStickToBottomRef.current = distanceToBottom < 120;
  }

  function goToHero() {
    if (chat.isBusy) chat.stop();
    router.push("/treasure/hunt");
  }

  function openConversation(conversation: AgentConversation) {
    chat.switchConversation(conversation);
    setHistoryOpen(false);
    router.push(`/treasure/hunt/chat/${conversation.id}`);
  }

  function deleteConversation(conversationIdToDelete: string) {
    const deletingActive = chat.activeConversation?.id === conversationIdToDelete;
    const next = chat.removeConversation(conversationIdToDelete);
    if (!deletingActive) return;
    setHistoryOpen(false);
    if (next) {
      router.push(`/treasure/hunt/chat/${next.id}`);
    } else {
      router.push("/treasure/hunt");
    }
  }

  return (
    <main className={treasureShell}>
      <div className={treasureSky} />
      <div className="relative z-10 flex h-screen flex-col overflow-hidden">
        <header className="z-20 flex min-h-20 items-center justify-between gap-3 border-b-2 border-white/45 bg-[#f7f3df]/90 px-4 py-4 backdrop-blur md:gap-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <IslandIcon name="icon-map" size={46} bounce />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-[#0aa99e]">
                {agent.category}
              </p>
              <h1 className="truncate text-2xl font-black tracking-normal text-[#725d42]">
                {agent.name}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <TreasureHuntHistoryButton
              className={treasureIconButton}
              ariaLabel={historyOpen ? "收起会话历史" : "展开会话历史"}
              onClick={() => setHistoryOpen((open) => !open)}
            />
            <div className="hidden items-center gap-3 md:flex">
              <IslandButton
                type="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={goToHero}
              >
                新会话
              </IslandButton>
            </div>
            <div className="flex shrink-0 items-center gap-2 md:hidden">
              <button
                type="button"
                className={treasureIconButton}
                aria-label="新会话"
                onClick={goToHero}
              >
                <Plus className="h-5 w-5" />
                <span>新对话</span>
              </button>
            </div>
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
          <aside
            className={cn(
              "absolute inset-y-0 left-0 z-30 hidden w-[292px] min-w-0 flex-col gap-4 border-r-2 border-white/45 bg-[#f7f3df]/86 p-5 shadow-[10px_0_35px_rgba(93,75,45,0.12)] backdrop-blur transition-all duration-300 ease-out lg:flex",
              historyOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0 pointer-events-none",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <strong className="text-lg font-black text-[#725d42]">会话历史</strong>
              <button
                type="button"
                className={cn(treasureHistoryRoundButton, "h-[42px] w-[42px]")}
                aria-label="收起会话历史"
                onClick={() => setHistoryOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              className={cn(
                treasureScrollbarHidden,
                "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-1",
              )}
            >
              <TreasureHuntConversationList
                conversations={chat.conversations}
                activeConversationId={chat.activeConversation?.id}
                onOpen={openConversation}
                onDelete={deleteConversation}
              />
            </div>
          </aside>

          <TreasureHuntHistoryDrawer
            open={historyOpen}
            conversations={chat.conversations}
            activeConversationId={chat.activeConversation?.id}
            onOpen={openConversation}
            onDelete={deleteConversation}
            onClose={() => setHistoryOpen(false)}
          />

          <section
            className={cn(
              "grid h-full min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden transition-[padding] duration-300 ease-out",
              historyOpen && "lg:pl-[292px]",
            )}
          >
            <section
              ref={scrollRef}
              onScroll={handleScroll}
              className="min-h-0 overflow-auto px-3 py-7 sm:px-4 md:px-7"
            >
              <div className="mx-auto w-full max-w-6xl">
                <div className="space-y-5">
                  {chat.messages.map((message) => (
                    <article
                      key={message.id}
                      className={cn(
                        "flex flex-col gap-3 sm:grid sm:items-start sm:gap-4",
                        message.role === "user"
                          ? "items-end sm:grid-cols-[minmax(0,1fr)_48px]"
                          : "items-start sm:grid-cols-[48px_minmax(0,1fr)]",
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-11 w-11 place-items-center rounded-full bg-[#fff8df] shadow-[0_4px_0_#d8c8a2] sm:h-12 sm:w-12",
                          message.role === "user" && "sm:order-2",
                        )}
                      >
                        <IslandIcon
                          name={
                            message.role === "user" ? "icon-camera" : "icon-chat"
                          }
                          size={34}
                          bounce
                        />
                      </div>
                      <div
                        className={cn(
                          "relative inline-flex max-w-full flex-col pt-2 sm:pt-3",
                          message.role === "user"
                            ? "items-end sm:justify-self-end"
                            : "items-start",
                        )}
                      >
                        <BubbleTail
                          role={message.role === "user" ? "user" : "assistant"}
                        />
                        <IslandCard
                          color={message.role === "user" ? "app-teal" : "default"}
                          className={cn(
                            treasureMessageCard,
                            message.role === "user" && treasureUserMessageCard,
                          )}
                        >
                          <TreasureHuntMessagePartsRenderer
                            // conversationId={chat.activeConversation?.id || conversationId}
                            // messageId={message.id}
                            parts={message.parts || []}
                            addToolOutput={chat.addToolOutput}
                          />
                        </IslandCard>
                      </div>
                    </article>
                  ))}
                  {chat.isBusy ? (
                    <div className="max-w-full sm:ml-14 sm:max-w-md">
                      <IslandCard
                        color="app-yellow"
                        className={treasureMessageCard}
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 animate-pulse rounded-full bg-[#19c8b9]" />
                          <div>
                            <strong className="block text-sm font-black">
                              大喜正在翻找线索
                            </strong>
                          </div>
                        </div>
                      </IslandCard>
                    </div>
                  ) : null}
                  {chat.error ? (
                    <div className="text-sm font-black text-[#e05a5a] sm:ml-14">
                      {chat.error.message}
                    </div>
                  ) : null}
                  <div ref={endRef} />
                </div>
              </div>
            </section>

            <footer className="z-20 border-t-2 border-white/45 bg-[#f7f3df]/90 px-4 py-4 backdrop-blur md:px-7">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
                <form
                  className={treasureComposer}
                  onSubmit={(event) => {
                    event.preventDefault();
                    chat.sendText();
                  }}
                >
                  <input
                    className={treasureComposerInput}
                    value={chat.input}
                    onChange={(event) => chat.setInput(event.target.value)}
                    placeholder={`和「${agent.name}」说说你的想法...`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        chat.sendText();
                      }
                    }}
                  />
                  {chat.isBusy ? (
                    <button
                      type="button"
                      className={treasureSendButton}
                      aria-label="停止生成"
                      onClick={chat.stop}
                    >
                      <Square className="h-5 w-5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={treasureSendButton}
                      aria-label="发送"
                      disabled={!chat.input.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  )}
                </form>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}

function BubbleTail({ role }: { role: "user" | "assistant" }) {
  const fill = role === "user" ? "#82d5bb" : "#f7f3df";
  const position = role === "user" ? "right-4 top-0" : "left-4 top-0";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-10 block h-3 w-5 sm:hidden",
        position,
      )}
    >
      <svg
        viewBox="0 0 20 12"
        className="block h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 0.8C10.45 0.8 10.86 1.02 11.12 1.38L18.44 10.04C18.91 10.72 18.43 11.67 17.6 11.67H2.4C1.57 11.67 1.09 10.72 1.56 10.04L8.88 1.38C9.14 1.02 9.55 0.8 10 0.8Z"
          fill={fill}
        />
      </svg>
    </span>
  );
}
