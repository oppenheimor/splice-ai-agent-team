"use client";

import { ArrowRight, CheckCircle2, FileText, Send, Square } from "lucide-react";
import { memo, type CSSProperties, type ReactNode, type RefObject } from "react";
import { MessagePartsRenderer } from "@/components/agent-chat/MessagePartsRenderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { useAgentChat } from "@/lib/agent-team/chat/useAgentChat";
import { DeepDiagnosisInputMascot, DeepDiagnosisLogo } from "./DeepDiagnosisBrand";
import {
  deepDiagnosisAccentButton,
  deepDiagnosisAgentMark,
  deepDiagnosisFocusRing,
  deepDiagnosisGhostButton,
  deepDiagnosisInput,
  deepDiagnosisMessageEnter,
  deepDiagnosisMicroInteraction,
  deepDiagnosisMono,
} from "./styles";

export type EmptyConversationPrompt = {
  title: string;
  description: string;
  prompt: string;
};

type AgentChatState = ReturnType<typeof useAgentChat>;

export function ConversationLoadingState() {
  return (
    <div className="mx-auto grid min-h-full w-full max-w-200 content-start gap-6 py-6 sm:gap-8 sm:py-10" aria-live="polite" aria-busy="true">
      <span className="sr-only">正在载入这段诊断记录</span>
      <div className="grid gap-8">
        <MessageSkeleton align="start" lines={3} />
        <MessageSkeleton align="end" lines={2} />
        <MessageSkeleton align="start" lines={4} />
      </div>
    </div>
  );
}

export function EmptyConversation({ children }: { children?: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-[960px] items-center justify-center px-0 py-5 sm:px-1 sm:py-10">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[min(820px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(220,230,235,0.22)_0%,rgba(245,245,245,0)_68%)] sm:h-[520px]"
        aria-hidden="true"
      />
      <section className="relative mx-auto grid w-full max-w-[900px] gap-5 sm:gap-8">
        <div className="grid gap-3 text-left">
          <h1 className="text-2xl font-semibold leading-8 text-[#171717] text-balance sm:text-4xl sm:leading-[3.25rem]">
            你好，我是深度诊断 Agent
          </h1>
          <p className="text-sm leading-6 text-[#5f5f5f] text-pretty sm:text-lg sm:leading-8">
            你的业务现场翻译官，外加一点不泼冷水的冷静。
          </p>
        </div>
        {children}
      </section>
    </div>
  );
}

export const ChatMessage = memo(function ChatMessage({
  message,
  addToolOutput,
}: {
  message: AgentChatState["messages"][number];
  addToolOutput: AgentChatState["addToolOutput"];
}) {
  const isUser = message.role === "user";
  const chatCopyClassName = "text-base leading-7";

  if (isUser) {
    return (
      <article className="grid justify-items-end">
        <div className="max-w-[min(760px,100%)]">
          <div
            className={`min-w-0 rounded-lg border border-[#eaeaea] bg-[#f7f7f7]/90 px-3 py-2.5 text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02)] sm:px-4 sm:py-3 ${deepDiagnosisMessageEnter}`}
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
      <div className="grid max-w-[min(980px,100%)] sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-3">
        <span className="hidden sm:block">
          <AssistantIdentityMark className="mt-1 sm:h-9 sm:w-9" />
        </span>
        <div className="min-w-0">
          <div className={`mb-2 flex items-center gap-2 text-xs text-[#8f8f8f] ${deepDiagnosisMono}`}>
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

export function ThinkingState() {
  return (
    <div className={`grid ${deepDiagnosisMessageEnter}`} aria-live="polite">
      <div className="grid max-w-[min(980px,100%)] sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-3">
        <span className="hidden sm:block" aria-hidden="true" />
        <span className="deep-diagnosis-thinking-text inline-block text-base">
          正在思考
        </span>
      </div>
    </div>
  );
}

export function Composer({
  composerRef,
  input,
  isBusy,
  lifted,
  prompts,
  reportAction,
  onInputChange,
  onPromptSelect,
  onSend,
  onStop,
  placement = "floating",
}: {
  composerRef: RefObject<HTMLElement | null>;
  input: string;
  isBusy: boolean;
  lifted?: boolean;
  placement?: "floating" | "inline";
  prompts?: readonly EmptyConversationPrompt[];
  reportAction?: {
    disabled?: boolean;
    disabledReason?: string;
    label?: string;
    onClick: () => void;
  };
  onInputChange: (value: string) => void;
  onPromptSelect?: (prompt: string) => void;
  onSend: () => void;
  onStop: () => void;
}) {
  const isFloating = placement === "floating";

  return (
    <footer
      ref={composerRef}
      className={
        isFloating
          ? `${lifted ? "bottom-5 pt-16 before:bg-[linear-gradient(180deg,rgba(250,250,250,0)_0%,rgba(250,250,250,0.78)_58%,#fafafa_100%)] sm:bottom-12 sm:pt-24 lg:bottom-[3.75rem]" : "bottom-0 pt-12 before:bg-[linear-gradient(180deg,rgba(250,250,250,0)_0%,rgba(250,250,250,0.96)_38%,#fafafa_100%)] sm:pt-16"} pointer-events-none absolute left-0 right-0 z-20 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] before:absolute before:inset-0 before:content-[''] sm:px-6 sm:pb-5`
          : "pointer-events-none relative z-20 w-full px-0 pb-0 pt-0"
      }
    >
      <div className="pointer-events-auto relative mx-auto w-full max-w-[900px]">
        {lifted ? (
          <DeepDiagnosisInputMascot className="absolute right-3 top-1 z-30 w-24 -translate-y-[48%] drop-shadow-[0_10px_18px_rgba(0,0,0,0.08)] sm:right-8 sm:top-1 sm:w-36 lg:right-10 lg:w-40" />
        ) : null}
        <div
          data-deep-diagnosis-composer-card
          className={`${lifted ? "min-h-[152px] rounded-[20px] px-4 pb-4 pt-5 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_18px_36px_-30px_rgba(0,0,0,0.38)] sm:min-h-[204px] sm:rounded-[24px] sm:px-6 sm:pb-6 sm:pt-6" : "rounded-2xl px-3 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_4px_8px_-4px_rgba(0,0,0,0.04),0_24px_48px_-28px_rgba(0,0,0,0.36)] sm:px-4 sm:py-4"} relative border border-[#e7e7e7] bg-[#ffffff] focus-within:border-[#c9c9c9] focus-within:shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.08),0_28px_56px_-28px_rgba(0,0,0,0.4)] motion-safe:transition-[border-color,box-shadow] motion-safe:duration-200 motion-reduce:transition-none`}
        >
          <form
            className={lifted ? "relative flex min-h-[112px] flex-col sm:min-h-[148px]" : "grid grid-cols-[minmax(0,1fr)_44px] items-end gap-2 sm:gap-3"}
            onSubmit={(event) => {
              event.preventDefault();
              onSend();
            }}
          >
            <Textarea
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="说说你的想法..."
              rows={lifted ? 4 : 2}
              className={`${lifted ? "min-h-[92px] flex-1 pb-12 pr-14 sm:min-h-[124px] sm:pr-20" : "min-h-12 sm:min-h-14"} max-h-36 resize-none px-0 py-0 text-base leading-7 ${deepDiagnosisInput}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
            />
            <div className={lifted ? "absolute bottom-0 right-0 flex items-center justify-end gap-3" : "contents"}>
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
                  className={`h-11 w-11 rounded-full p-0 cursor-pointer ${deepDiagnosisAccentButton} ${deepDiagnosisMicroInteraction}`}
                  aria-label="发送"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            {reportAction ? (
              <div className={lifted ? "mt-3 flex justify-start" : "col-span-full flex justify-start"}>
                <button
                  type="button"
                  className={`${deepDiagnosisFocusRing} inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#d7d7d7] bg-white px-2.5 text-xs font-medium text-[#2f2f2f] shadow-[0_1px_1px_rgba(0,0,0,0.02)] hover:border-[#171717] hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:border-[#ececec] disabled:bg-[#f5f5f5] disabled:text-[#b4b4b4] ${deepDiagnosisMicroInteraction}`}
                  disabled={reportAction.disabled}
                  onClick={reportAction.onClick}
                  title={reportAction.disabled ? reportAction.disabledReason : "生成方案链接"}
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{reportAction.label || "生成方案链接"}</span>
                </button>
                {reportAction.disabledReason ? (
                  <span className="sr-only">{reportAction.disabledReason}</span>
                ) : null}
              </div>
            ) : null}
          </form>
        </div>
        {lifted && prompts?.length && onPromptSelect ? (
          <div className="mt-3 grid grid-cols-1 overflow-hidden rounded-2xl border border-[#e9e9e9] bg-[#f6f6f6]/72 px-1.5 pb-1.5 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:mt-4 sm:pt-5">
            <p className={`px-3 pb-2 text-[11px] font-medium leading-none text-[#9a9a9a] sm:px-3.5 ${deepDiagnosisMono}`}>
              也可以从这里开始
            </p>
            {prompts.map((prompt, index) => (
              <div key={prompt.prompt}>
                <PromptChip
                  index={index + 1}
                  title={prompt.title}
                  description={prompt.description}
                  prompt={prompt.prompt}
                  onStart={onPromptSelect}
                />
                {index < prompts.length - 1 ? (
                  <div className="mx-3 h-px bg-[#e5e5e5]/82 sm:mx-4" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
}

function MessageSkeleton({
  align,
  lines,
}: {
  align: "start" | "end";
  lines: number;
}) {
  const isUser = align === "end";
  const lineWidths = isUser
    ? ["w-[min(420px,72vw)]", "w-[min(300px,56vw)]"]
    : ["w-[min(640px,78vw)]", "w-[min(560px,70vw)]", "w-[min(460px,62vw)]", "w-[min(320px,48vw)]"];

  return (
    <div className={`grid ${isUser ? "justify-items-end" : "justify-items-start"}`}>
      <div className="flex max-w-full gap-2 sm:gap-3">
        {!isUser ? <div className="mt-1 hidden h-8 w-8 shrink-0 rounded-full border border-[#e1e1e1] bg-[#f1f1f1] sm:block" /> : null}
        <div
          className={`grid min-w-0 gap-3 rounded-lg border border-[#eeeeee] bg-white/78 px-4 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.02)] ${
            isUser
              ? "w-[min(480px,calc(100vw-1.5rem))] sm:w-[min(480px,calc(100vw-4rem))]"
              : "w-[min(720px,calc(100vw-1.5rem))] sm:w-[min(720px,calc(100vw-8rem))]"
          }`}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <span
              key={index}
              className={`h-3 max-w-full rounded-full bg-[#ececec] ${lineWidths[index] || "w-1/2"} animate-pulse`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PromptChip({
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
    <div
      className="deep-diagnosis-prompt-layer cursor-pointer"
      style={
        {
          "--prompt-delay": `${(index - 1) * 90}ms`,
          "--prompt-gap": "0px",
        } as CSSProperties
      }
    >
      <button
        type="button"
        onClick={() => onStart(prompt)}
        className={`${deepDiagnosisFocusRing} group grid min-h-[76px] w-full grid-cols-[34px_minmax(0,1fr)_32px] items-center gap-2 rounded-xl bg-transparent px-3 py-2.5 text-left hover:bg-white/72 sm:min-h-[70px] sm:grid-cols-[42px_minmax(0,1fr)_36px] sm:gap-3 sm:px-4 ${deepDiagnosisMicroInteraction} cursor-pointer`}
      >
        <span className={`grid h-8 w-8 place-items-center rounded-full border border-[#e6e6e6] bg-white/72 text-xs text-[#7a7a7a] group-hover:border-[#d8d8d8] group-hover:bg-white sm:h-10 sm:w-10 ${deepDiagnosisMono}`}>
          {String(index).padStart(2, "0")}
        </span>
        <span className="grid min-w-0 gap-0.5">
          <span className="text-sm font-semibold leading-5 text-[#171717] text-pretty sm:text-base sm:leading-6">
            {title}
          </span>
          <span className="line-clamp-2 text-xs leading-5 text-[#707070] text-pretty sm:text-sm sm:leading-5">
            {description}
          </span>
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-[#dcdcdc] bg-white/82 text-[#333333] opacity-[0.9] group-hover:translate-x-0.5 group-hover:border-[#171717] group-hover:bg-[#171717] group-hover:text-white group-hover:opacity-100 sm:h-9 sm:w-9">
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}

function AssistantIdentityMark({
  size = "lg",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const sizeClassName = size === "lg" ? "h-9 w-9" : "h-8 w-8";

  return (
    <span className={`${deepDiagnosisAgentMark} ${sizeClassName} ${className}`} aria-label="深度诊断 Agent">
      <span className="absolute inset-[5px] rounded-full" aria-hidden="true" />
      <DeepDiagnosisLogo className="relative h-[78%] w-[78%]" />
    </span>
  );
}

function areChatMessagesEqual(
  previous: { message: AgentChatState["messages"][number] },
  next: { message: AgentChatState["messages"][number] },
) {
  return previous.message === next.message;
}
