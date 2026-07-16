import assert from "node:assert/strict";
import test from "node:test";
import type { HandleMessageStreamEvent, SessionState } from "eve/client";
import type { EveMessage } from "eve/react";
import { compactWishCreatorSnapshot } from "./snapshot-compaction.ts";

function appended(messageSoFar: string, sequence: number): HandleMessageStreamEvent {
  return {
    data: {
      messageDelta: messageSoFar,
      messageSoFar,
      sequence,
      stepIndex: 0,
      turnId: "turn-1",
    },
    type: "message.appended",
  };
}

test("只保留同一步骤最新的 HTML artifact 增量", () => {
  const first = appended('说明\n<!-- wish-creator-html-artifact:v1 path="lab/index.html" -->\n<!doctype html>', 1);
  const latest = appended('说明\n<!-- wish-creator-html-artifact:v1 path="lab/index.html" -->\n<!doctype html><html>', 2);
  const completed = {
    data: { finishReason: "stop", message: "完成", sequence: 3, stepIndex: 0, turnId: "turn-1" },
    type: "message.completed",
  } as unknown as HandleMessageStreamEvent;
  const snapshot = {
    events: [first, latest, completed],
    messages: [] as EveMessage[],
    session: { streamIndex: 3 } as SessionState,
  };

  const compacted = compactWishCreatorSnapshot(snapshot);

  assert.deepEqual(compacted.events, [latest, completed]);
  assert.equal(compacted.session.streamIndex, 3);
});

test("普通对话增量保持原样", () => {
  const events = [appended("你好", 1), appended("你好，我来帮你", 2)];
  const snapshot = {
    events,
    messages: [] as EveMessage[],
    session: { streamIndex: 2 } as SessionState,
  };

  assert.equal(compactWishCreatorSnapshot(snapshot), snapshot);
});
