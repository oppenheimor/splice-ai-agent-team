"use client";

import { Bot, Send, Square, SquareUserRound } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { useAgentChat } from "@/lib/agent-team/chat/useAgentChat";
import type { DiagnosisRecordDto } from "@/lib/requirements-diagnosis/persistence";
import { MessagePartsRenderer } from "@/components/agent-chat/MessagePartsRenderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  diagnosisAppSurface,
  diagnosisBottomActions,
  diagnosisIconButton,
  diagnosisInput,
  diagnosisMetric,
  diagnosisMutedText,
  diagnosisPanel,
  diagnosisPrimaryButton,
  diagnosisSecondaryButton,
  diagnosisStage,
  diagnosisShell,
} from "@/components/requirements-diagnosis/styles";

interface IDiagnosisChatShellProps {
  agent: AgentManifest;
  conversationId: string;
  sourceDiagnosis?: DiagnosisRecordDto | null;
};

export function DiagnosisChatShell({ agent, conversationId, sourceDiagnosis }: IDiagnosisChatShellProps) {
  const diagnosis = sourceDiagnosis;
  const requestBody = useMemo(() => (diagnosis ? { quizResultId: diagnosis.id } : undefined), [diagnosis]);
  const chat = useAgentChat(agent, {
    // 需求诊断的对话必须与评测结果一一绑定，避免复用同一 Agent 的历史本地会话导致 DB conversationId 唯一键冲突。
    conversationId: diagnosis?.chatSession?.conversationId || conversationId,
    requestBody,
  });
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages, chat.isBusy]);

  return (
    <main className={diagnosisShell}>
      <section className={diagnosisStage}>
        <article className={`${diagnosisAppSurface} overflow-hidden`}>
          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto]">
            <section className="mt-6 min-h-0 space-y-4 overflow-auto pr-1">
              {chat.messages.length === 0 ? (
                <EmptyState diagnosis={diagnosis} onStart={chat.sendText} />
              ) : (
                <div className="space-y-4">
                  {chat.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} addToolOutput={chat.addToolOutput} />
                  ))}
                  {chat.isBusy ? <div className={`${diagnosisPanel} px-4 py-3 text-sm ${diagnosisMutedText}`}>正在整理诊断建议...</div> : null}
                  <div ref={endRef} />
                </div>
              )}
            </section>

            <footer className={`${diagnosisBottomActions} pt-4`}>
              <form
                className="grid grid-cols-[minmax(0,1fr)_52px] items-end gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  chat.sendText();
                }}
              >
                <Textarea
                  value={chat.input}
                  onChange={(event) => chat.setInput(event.target.value)}
                  placeholder="描述你的行业、业务环节或想验证的 AI 方案..."
                  rows={1}
                  className={`min-h-12 max-h-32 resize-y rounded-full px-5 text-sm ${diagnosisInput}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      chat.sendText();
                    }
                  }}
                />
                {chat.isBusy ? (
                  <Button type="button" variant="outline" onClick={chat.stop} className={`h-12 w-12 p-0 ${diagnosisSecondaryButton}`} aria-label="停止">
                    <Square className="h-4 w-4 fill-current" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={!chat.input.trim()} className={`h-12 w-12 p-0 ${diagnosisPrimaryButton}`} aria-label="发送">
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </footer>
          </div>
        </article>
      </section>
    </main>
  );
}

function ChatMessage({
  message,
  addToolOutput,
}: {
  message: ReturnType<typeof useAgentChat>["messages"][number];
  addToolOutput: ReturnType<typeof useAgentChat>["addToolOutput"];
}) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "flex flex-col gap-2 sm:grid sm:gap-3",
        isUser ? "items-end sm:grid-cols-[minmax(0,1fr)_40px]" : "items-start sm:grid-cols-[40px_minmax(0,1fr)]",
      )}
    >
      <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f0f0ed] text-[#2e2f2d]", isUser && "sm:order-2")}>
        {isUser ? <SquareUserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          `w-full px-4 py-3 text-sm leading-6 sm:max-w-[min(78%,100%)] ${diagnosisPanel}`,
          isUser && "border-0 bg-[#2e2f2d] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),0_12px_30px_rgba(0,0,0,0.2)] sm:justify-self-end",
        )}
      >
        <MessagePartsRenderer parts={message.parts || []} addToolOutput={addToolOutput} />
      </div>
    </article>
  );
}

function EmptyState({ diagnosis, onStart }: { diagnosis?: DiagnosisRecordDto | null; onStart: (text: string) => void }) {
  const prompts = diagnosis ? [
    "基于我的诊断结果，直接帮我判断：现在最值得先做的 AI 改造切入点是哪一个？",
    "帮我把诊断结果落成一份 7 / 30 / 90 天执行计划，先从本月能动的事开始。",
    "请帮我判断哪些 AI 想法值得做、哪些先别做，避免我花冤枉钱。",
  ] : [
    "我还没想清楚从哪里开始，请通过几个问题帮我找出最值得 AI 改造的业务环节。",
    "帮我判断我的业务里有没有适合 AI 落地的场景，并给出第一步建议。",
    "我有一个 AI 自动化想法，帮我评估它值不值得做、风险在哪里。",
  ];

  return (
    <div>
      {diagnosis ? (
        <Message role="assistant">
          我已经读到你的诊断结果：{diagnosis.result.operatorTypeName}。先定位一个最值得改造的业务环节。
        </Message>
      ) : (
        <Message role="assistant">
          你可以直接从业务现场开始，我会先追问关键背景，再把可落地的 AI 改造路径收束出来。
        </Message>
      )}
      <div className="mt-4 grid gap-3">
        {prompts.map((prompt) => (
          <button key={prompt} type="button" onClick={() => onStart(prompt)} className={`${diagnosisMetric} text-left text-sm font-bold transition hover:bg-[#e8e8e4]`}>
            {prompt}
          </button>
        ))}
      </div>
      <p className={`mt-3 px-1 text-xs ${diagnosisMutedText}`}>
        也可以直接输入你的行业、岗位、流程痛点或一个 AI 想法，我会先帮你判断是否值得做。
      </p>
    </div>
  );
}

function Message({ role, children }: { role: "assistant" | "user"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className={diagnosisIconButton}>
          <Bot className="h-4 w-4" />
        </span>
      ) : null}
      <div className={`max-w-[78%] px-4 py-3 text-sm leading-6 ${isUser ? "rounded-[28px] bg-[#2e2f2d] text-white" : diagnosisPanel}`}>{children}</div>
    </div>
  );
}

function WorkspaceItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2">
      <span className="mt-0.5 text-[#2e2f2d]">{icon}</span>
      <span>
        <b className="block text-[#222322]">{title}</b>
        <small className={diagnosisMutedText}>{desc}</small>
      </span>
    </div>
  );
}
