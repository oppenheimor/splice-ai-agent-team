import type { UIMessage } from "ai";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractWishMessageText } from "@/lib/wish-intake/messages";
import { cn } from "@/lib/utils";

export function WishIntakeMessages({ messages }: { messages: UIMessage[] }) {
  if (!messages.length) {
    return (
      <div className="mx-auto mt-16 max-w-xl rounded-xl border border-[#334039] bg-[#101714]/90 p-5 text-sm leading-7 text-[#9da8a1]">
        <p className="font-semibold text-white">先从你真正想解决的事情说起。</p>
        <p className="mt-2">不用整理成需求文档，想到哪里说到哪里。我会陪你把目标、场景和理想结果慢慢说清楚。</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {messages.map((message) => {
        const text = extractWishMessageText(message);
        if (!text) return null;
        const user = message.role === "user";
        return (
          <article className={cn("max-w-[82%]", user ? "ml-auto" : "mr-auto")} key={message.id}>
            <header className={cn("mb-2 flex items-center gap-2 text-xs", user ? "justify-end text-[#8c9891]" : "text-[#dfe5e1]")}>
              {!user ? <Sparkles className="h-4 w-4 text-[#b8ff22]" /> : null}
              <strong className={user ? "text-[#b8ff22]" : "text-white"}>{user ? "你" : "许愿池 Agent"}</strong>
            </header>
            <div className={cn(
              "rounded-xl border px-5 py-4 text-sm leading-7 shadow-[0_16px_40px_rgba(0,0,0,0.14)]",
              user ? "border-[#4b5c2e] bg-[#101910] text-[#e6ebe8]" : "border-[#334039] bg-[#111816] text-[#c7cfca]",
            )}>
              <div className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
