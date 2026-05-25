"use client";

import Link from "next/link";
import { Bot, LogOut, Plus, Send, Square, SquareUserRound } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { useAgentChat } from "@/lib/agent-team/chat/useAgentChat";
import { Button } from "@/components/ui/button";
import { MessagePartsRenderer } from "./MessagePartsRenderer";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AgentChatShellProps = {
  agent: AgentManifest;
  emptyState: (actions: { sendText: (text: string) => void }) => React.ReactNode;
};

export function AgentChatShell({ agent, emptyState }: AgentChatShellProps) {
  const chat = useAgentChat(agent);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages, chat.isBusy]);

  return (
    <main className="grid min-h-screen bg-muted/30 text-foreground lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen flex-col gap-4 border-r border-border bg-background/95 p-5 lg:flex" aria-label="会话导航">
        <Link className="flex items-center gap-3 rounded-lg px-1 py-1 font-semibold tracking-tight" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">ST</span>
          <strong>Splice Agent Team</strong>
        </Link>
        <Button type="button" onClick={chat.startNewConversation} className="justify-start">
          <Plus className="h-4 w-4" />
          新建会话
        </Button>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
          {chat.conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className={cn(
                "rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-accent/40",
                conversation.id === chat.activeConversation?.id && "border-border bg-accent/60"
              )}
              onClick={() => chat.switchConversation(conversation)}
            >
              <span className="block truncate text-sm font-semibold">{conversation.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{conversation.messages.length} 条消息</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="grid min-w-0 min-h-screen grid-rows-[auto_minmax(0,1fr)_auto]">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 py-4 backdrop-blur md:px-7">
          <div className="space-y-1">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
              {agent.category}
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{agent.name}</h1>
          </div>
          <form action="/agent-team/api/auth/logout" method="post">
            <Button variant="outline" type="submit">
              <LogOut className="h-4 w-4" />
              退出
            </Button>
          </form>
        </header>

        <section className="min-h-0 overflow-auto px-4 py-7 md:px-7">
          <div className="mx-auto w-full max-w-4xl">
            {chat.messages.length === 0 ? (
              <div>{emptyState({ sendText: chat.sendText })}</div>
            ) : (
              <div className="space-y-4">
                {chat.messages.map((message) => (
                  <article
                    key={message.id}
                    className={cn(
                      "grid grid-cols-[40px_minmax(0,1fr)] gap-3",
                      message.role === "user" && "grid-cols-[minmax(0,1fr)_40px]"
                    )}
                  >
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-lg border border-border bg-background text-sm font-bold",
                        message.role === "user" && "order-2"
                      )}
                    >
                      {message.role === "user" ? <SquareUserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[min(720px,100%)] rounded-lg border border-border bg-card px-4 py-3 shadow-sm",
                        message.role === "user" && "justify-self-end bg-primary text-primary-foreground"
                      )}
                    >
                      <MessagePartsRenderer parts={message.parts || []} addToolOutput={chat.addToolOutput} />
                    </div>
                  </article>
                ))}
                {chat.isBusy ? (
                  <div className="ml-12 flex max-w-md items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <div>
                      <strong className="block text-sm">正在整理</strong>
                      <p className="text-sm text-muted-foreground">我会边生成边把可操作内容呈现出来。</p>
                    </div>
                  </div>
                ) : null}
                {chat.error ? <div className="ml-12 text-sm text-destructive">{chat.error.message}</div> : null}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-border bg-background/95 px-4 py-4 md:px-7">
          <div className="mx-auto w-full max-w-4xl">
            <form
              className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                chat.sendText();
              }}
            >
              <Textarea
                value={chat.input}
                onChange={(event) => chat.setInput(event.target.value)}
                placeholder={`和「${agent.name}」说说你的目标...`}
                rows={1}
                className="min-h-12 max-h-40 resize-y rounded-lg bg-background"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    chat.sendText();
                  }
                }}
              />
              {chat.isBusy ? (
                <Button type="button" variant="outline" onClick={chat.stop}>
                  <Square className="h-4 w-4 fill-current" />
                  停止
                </Button>
              ) : (
                <Button type="submit" disabled={!chat.input.trim()}>
                  <Send className="h-4 w-4" />
                  发送
                </Button>
              )}
            </form>
          </div>
        </footer>
      </section>
    </main>
  );
}
