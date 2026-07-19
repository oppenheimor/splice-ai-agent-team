import type { UIMessage } from "ai";

export function extractWishMessageText(message: UIMessage): string {
  return (message.parts || [])
    .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n");
}
export function buildWishTranscript(messages: UIMessage[]): string {
  return messages
    .map((message) => {
      const text = extractWishMessageText(message);
      if (!text) return null;
      return `${message.role === "user" ? "用户" : "顾问"}：${text}`;
    })
    .filter((line): line is string => Boolean(line))
    .join("\n\n")
    .slice(-24000);
}
