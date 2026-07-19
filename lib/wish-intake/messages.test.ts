import assert from "node:assert/strict";
import test from "node:test";
import type { UIMessage } from "ai";
import { buildWishTranscript, extractWishMessageText } from "./messages.ts";

test("愿望对话只提取可见文本片段", () => {
  const message = {
    id: "message-1",
    role: "user",
    parts: [
      { type: "text", text: "  我想做库存提醒  " },
      { type: "text", text: "最好按门店区分" },
    ],
  } satisfies UIMessage;

  assert.equal(extractWishMessageText(message), "我想做库存提醒\n最好按门店区分");
});
test("摘要上下文保留角色并忽略空消息", () => {
  const messages = [
    { id: "user-1", role: "user", parts: [{ type: "text", text: "缺货前提醒店长" }] },
    { id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "希望通过什么渠道提醒？" }] },
    { id: "user-2", role: "user", parts: [{ type: "text", text: "微信" }] },
  ] satisfies UIMessage[];

  assert.equal(
    buildWishTranscript(messages),
    "用户：缺货前提醒店长\n\n顾问：希望通过什么渠道提醒？\n\n用户：微信",
  );
});
