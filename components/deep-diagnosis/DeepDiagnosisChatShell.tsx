"use client";

import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Send,
  Square,
  UserRoundCheck,
} from "lucide-react";
import { memo, type RefObject, useEffect, useRef, useState } from "react";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { useAgentChat } from "@/lib/agent-team/chat/useAgentChat";
import { MessagePartsRenderer } from "@/components/agent-chat/MessagePartsRenderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ConversationSidebar,
  Topbar,
} from "./DeepDiagnosisNavigation";
import {
  deepDiagnosisAccentButton,
  deepDiagnosisChatShell,
  deepDiagnosisChatWorkbench,
  deepDiagnosisFocusRing,
  deepDiagnosisGhostButton,
  deepDiagnosisAgentMark,
  deepDiagnosisInput,
  deepDiagnosisMarkGrid,
  deepDiagnosisMessageEnter,
  deepDiagnosisMicroInteraction,
  deepDiagnosisMono,
  deepDiagnosisUserMark,
  deepDiagnosisUserMarkGrid,
} from "./styles";

interface DeepDiagnosisChatShellProps {
  agent: AgentManifest;
  conversationId: string;
}

const DEFAULT_COMPOSER_BOTTOM_INSET = 256;
const COMPOSER_SCROLL_GAP = 32;

export function DeepDiagnosisChatShell({
  agent,
  conversationId,
}: DeepDiagnosisChatShellProps) {
  const chat = useAgentChat(agent, {
    conversationId,
  });
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLElement | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const [composerBottomInset, setComposerBottomInset] = useState(
    DEFAULT_COMPOSER_BOTTOM_INSET,
  );

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;

    const updateComposerInset = () => {
      // Composer 是悬浮层，滚动区必须按真实高度留出可见空间，避免正文从输入框下面穿过。
      const nextInset = Math.ceil(
        composer.getBoundingClientRect().height + COMPOSER_SCROLL_GAP,
      );
      setComposerBottomInset((currentInset) =>
        Math.abs(currentInset - nextInset) > 1 ? nextInset : currentInset,
      );
    };

    updateComposerInset();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateComposerInset);
      return () => window.removeEventListener("resize", updateComposerInset);
    }

    const resizeObserver = new ResizeObserver(updateComposerInset);
    resizeObserver.observe(composer);
    window.addEventListener("resize", updateComposerInset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateComposerInset);
    };
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    if (!shouldStickToBottomRef.current) return;
    if (scrollFrameRef.current)
      window.cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    });
    return () => {
      if (scrollFrameRef.current)
        window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, [chat.messages, chat.isBusy, composerBottomInset]);

  function updateScrollStickiness() {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    shouldStickToBottomRef.current =
      scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight <
      96;
  }

  return (
    <main className={deepDiagnosisChatShell}>
      <div className={deepDiagnosisChatWorkbench}>
        <ConversationSidebar currentTitle="独立深度诊断" />
        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar agentName={agent.name} />
          <section className="relative min-h-0 flex-1 overflow-hidden">
            <div
              ref={scrollAreaRef}
              onScroll={updateScrollStickiness}
              className="min-h-0 h-full overflow-y-auto overscroll-contain px-6 pt-6 [scrollbar-color:#d4d4d4_transparent] scrollbar-thin"
              style={{ paddingBottom: composerBottomInset }}
            >
              {chat.messages.length === 0 ? (
                <EmptyConversation onStart={chat.sendText} />
              ) : (
                <div className="mx-auto max-w-200 space-y-8">
                  {chat.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      addToolOutput={chat.addToolOutput}
                    />
                  ))}
                  {chat.isBusy ? <ThinkingState /> : null}
                </div>
              )}
            </div>
            <Composer
              composerRef={composerRef}
              input={chat.input}
              isBusy={chat.isBusy}
              onInputChange={chat.setInput}
              onSend={() => {
                shouldStickToBottomRef.current = true;
                chat.sendText();
              }}
              onStop={chat.stop}
            />
          </section>
        </section>
      </div>
    </main>
  );
}

function EmptyConversation({ onStart }: { onStart: (text: string) => void }) {
  const prompts = [
    {
      title: "我有一堆问题，想先理清主线",
      description: "适合还没确定入口时，让我帮你判断该全局盘点还是聚焦单点深挖。",
      prompt: "我有多个问题想咨询，请先帮我判断该全局盘点还是聚焦单点深挖。",
    },
    {
      title: "先扫一遍业务流程",
      description: "快速看清哪些环节值得 AI 改造，哪些地方暂时不值得投入。",
      prompt: "先快速横向扫描我的业务流程，判断哪些环节值得 AI 改造、哪些不值得。",
    },
    {
      title: "评估一个 AI 自动化想法",
      description: "把价值、落地难度、数据依赖和隐性风险先摊开，不急着开工。",
      prompt: "我有一个 AI 自动化想法，帮我评估它值不值得做、风险在哪里。",
    },
  ];

  return (
    <div className="mx-auto grid min-h-full w-full max-w-200 content-center gap-7 py-8">
      <div className="grid gap-5 rounded-2xl border border-[#eaeaea] bg-white px-5 py-5 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_16px_32px_-24px_rgba(0,0,0,0.28)] sm:px-7 sm:py-7">
        <div className="flex items-center gap-3.5">
          <IdentityMark role="assistant" size="lg" className="h-11 w-11" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#171717]">
              你好，我是深度诊断 Agent
            </p>
            <p className="mt-1 text-sm leading-5 text-[#666666]">
              你的业务现场翻译官，外加一点不泼冷水的冷静。
            </p>
          </div>
        </div>
        <div className="grid gap-3 border-t border-[#efefef] pt-5">
          <h1 className="text-2xl font-semibold leading-9 text-[#171717] text-balance sm:text-base sm:leading-10">
            我会先陪你把问题讲清楚，再判断 AI 该不该上场。
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[#4d4d4d] sm:text-lg">
            你可以直接丢一个行业、岗位、流程痛点或自动化想法过来。我会先追问关键现场，
            再整理机会、风险和下一步行动，不会一上来就把方案写成大型许愿池。
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {prompts.map((prompt, index) => (
          <PromptRow
            key={prompt.prompt}
            index={index + 1}
            title={prompt.title}
            description={prompt.description}
            prompt={prompt.prompt}
            onStart={onStart}
          />
        ))}
      </div>
    </div>
  );
}

function PromptRow({
  index,
  title,
  description,
  prompt,
  onStart,
}: {
  index: number;
  title: string;
  description: string;
  prompt: string;
  onStart: (text: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onStart(prompt)}
      className={`${deepDiagnosisFocusRing} group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-[#eaeaea] bg-white px-4 py-4 text-left shadow-[0_1px_1px_rgba(0,0,0,0.02)] hover:border-[#cfcfcf] hover:bg-[#fbfbfb] hover:shadow-[0_1px_1px_rgba(0,0,0,0.02),0_14px_28px_-22px_rgba(0,0,0,0.3)] sm:px-5 sm:py-5 ${deepDiagnosisMicroInteraction}`}
    >
      <span className={`grid h-9 w-9 place-items-center rounded-full border border-[#e6e6e6] bg-[#f7f7f7] text-xs text-[#666666] group-hover:border-[#d4d4d4] group-hover:bg-white ${deepDiagnosisMono} ${deepDiagnosisMicroInteraction}`}>
        {String(index).padStart(2, "0")}
      </span>
      <span className="grid gap-1.5">
        <span className="text-base font-medium leading-6 text-[#171717] sm:text-lg">
          {title}
        </span>
        <span className="text-sm leading-6 text-[#666666] sm:text-base sm:leading-7">
          {description}
        </span>
      </span>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#171717] text-white opacity-90 group-hover:translate-x-0.5 group-hover:opacity-100">
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}

const ChatMessage = memo(function ChatMessage({
  message,
  addToolOutput,
}: {
  message: ReturnType<typeof useAgentChat>["messages"][number];
  addToolOutput: ReturnType<typeof useAgentChat>["addToolOutput"];
}) {
  const isUser = message.role === "user";
  const chatCopyClassName = "text-base leading-7";

  if (isUser) {
    return (
      <article className="grid justify-items-end">
        <div className="flex max-w-[min(760px,100%)] flex-row-reverse gap-3">
          <IdentityMark role="user" className="mt-1" />
          <div
            className={`min-w-0 rounded-lg border border-[#eaeaea] bg-[#f7f7f7]/90 px-4 py-3 text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02)] ${deepDiagnosisMessageEnter}`}
          >
            <MessagePartsRenderer
              parts={message.parts || []}
              addToolOutput={addToolOutput}
              textClassName={chatCopyClassName}
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`grid ${deepDiagnosisMessageEnter}`}>
      <div className="grid max-w-[min(980px,100%)] grid-cols-[32px_minmax(0,1fr)] gap-3">
        <IdentityMark role="assistant" className="mt-1" />
        <div className="min-w-0">
          <div
            className={`mb-2 flex items-center gap-2 text-xs text-[#8f8f8f] ${deepDiagnosisMono}`}
          >
            深度诊断
            <CheckCircle2 className="ml-1 h-3 w-3 text-[#107d32]" />
          </div>
          <MessagePartsRenderer
            parts={message.parts || []}
            addToolOutput={addToolOutput}
            textClassName={chatCopyClassName}
          />
        </div>
      </div>
    </article>
  );
}, areChatMessagesEqual);

function IdentityMark({
  role,
  size = "lg",
  className = "",
}: {
  role: "assistant" | "user";
  size?: "md" | "lg";
  className?: string;
}) {
  const isAssistant = role === "assistant";
  const rootClassName = isAssistant ? deepDiagnosisAgentMark : deepDiagnosisUserMark;
  const gridClassName = isAssistant ? deepDiagnosisMarkGrid : deepDiagnosisUserMarkGrid;
  const sizeClassName = size === "lg" ? "h-9 w-9" : "h-8 w-8";
  const glyphSizeClassName = size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4";
  const label = isAssistant ? "深度诊断 Agent" : "用户";
  const Glyph = isAssistant ? BrainCircuit : UserRoundCheck;

  return (
    <span className={`${rootClassName} ${sizeClassName} ${className}`} aria-label={label}>
      <span className={gridClassName} aria-hidden="true" />
      <span className="absolute inset-[5px] rounded-full" aria-hidden="true" />
      <Glyph className={`relative ${glyphSizeClassName} stroke-[1.8]`} aria-hidden="true" />
    </span>
  );
}

function areChatMessagesEqual(
  previous: { message: ReturnType<typeof useAgentChat>["messages"][number] },
  next: { message: ReturnType<typeof useAgentChat>["messages"][number] },
) {
  return previous.message === next.message;
}

function ThinkingState() {
  return (
    <div className={`grid ${deepDiagnosisMessageEnter}`} aria-live="polite">
      <div className="grid max-w-[min(980px,100%)] grid-cols-[32px_minmax(0,1fr)] gap-3">
        <span aria-hidden="true" />
        <span className="deep-diagnosis-thinking-text inline-block text-base">
          正在思考
        </span>
      </div>
    </div>
  );
}

function Composer({
  composerRef,
  input,
  isBusy,
  onInputChange,
  onSend,
  onStop,
}: {
  composerRef: RefObject<HTMLElement | null>;
  input: string;
  isBusy: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
}) {
  return (
    <footer
      ref={composerRef}
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 px-6 pb-6 pt-16 before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(250,250,250,0)_0%,rgba(250,250,250,0.96)_38%,#fafafa_100%)] before:content-['']"
    >
      <div className="pointer-events-auto relative mx-auto max-w-200 rounded-2xl border border-[#eaeaea] bg-[#ffffff] px-4 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_4px_8px_-4px_rgba(0,0,0,0.04),0_24px_48px_-28px_rgba(0,0,0,0.36)] focus-within:border-[#c9c9c9] focus-within:shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.08),0_28px_56px_-28px_rgba(0,0,0,0.4)] motion-safe:transition-[border-color,box-shadow] motion-safe:duration-200 motion-reduce:transition-none">
        <form
          className="grid grid-cols-[minmax(0,1fr)_44px] items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="说说你的想法..."
            rows={2}
            className={`max-h-36 min-h-14 resize-none px-0 py-0 text-base leading-7 ${deepDiagnosisInput}`}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
          />
          {isBusy ? (
            <Button
              type="button"
              variant="outline"
              onClick={onStop}
              className={`h-11 w-11 rounded-full p-0 ${deepDiagnosisGhostButton} ${deepDiagnosisMicroInteraction}`}
              aria-label="停止"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              className={`h-11 w-11 rounded-full p-0 ${deepDiagnosisAccentButton} ${deepDiagnosisMicroInteraction}`}
              aria-label="发送"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </footer>
  );
}
