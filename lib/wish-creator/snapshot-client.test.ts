import assert from "node:assert/strict";
import test from "node:test";
import type { HandleMessageStreamEvent } from "eve/client";
import type { WishCreatorSnapshot } from "../../types/wish-creator.ts";
import { saveWishCreatorSnapshot } from "./snapshot-client.ts";

test("大快照保存不能启用页面卸载 keepalive", async (context) => {
  const originalFetch = globalThis.fetch;
  let requestInit: RequestInit | undefined;
  globalThis.fetch = async (_input, init) => {
    requestInit = init;
    return new Response(null, { status: 200 });
  };
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  const snapshot = {
    events: [{
      type: "message.completed",
      data: { content: "x".repeat(70_000) },
    } as unknown as HandleMessageStreamEvent],
    messages: [],
    session: { streamIndex: 1 },
  } satisfies WishCreatorSnapshot;

  const legacySave = saveWishCreatorSnapshot as unknown as (
    conversationId: string,
    value: WishCreatorSnapshot,
    options: { readonly keepalive: boolean },
  ) => Promise<void>;
  await legacySave("conversation-large", snapshot, { keepalive: true });

  assert.ok(requestInit);
  assert.equal("keepalive" in requestInit, false);
});
