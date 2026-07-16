import assert from "node:assert/strict";
import test from "node:test";
import type { HandleMessageStreamEvent } from "eve/client";
import {
  createWishCreatorRecoverySession,
  isWishCreatorRecoveryBoundary,
  mergeWishCreatorRecoveredState,
  shouldRecoverWishCreatorSession,
} from "./session-recovery.ts";

const event = { type: "turn.completed", data: {} } as unknown as HandleMessageStreamEvent;

test("仅有 Eve session id 时需要从服务端事件流恢复", () => {
  const initialState = {
    eveSessionId: "wrun_interrupted",
    events: [event],
    session: { streamIndex: 0 },
    title: "新的愿望",
  };

  assert.equal(shouldRecoverWishCreatorSession(initialState), true);
  assert.deepEqual(createWishCreatorRecoverySession(initialState), {
    sessionId: "wrun_interrupted",
    streamIndex: 1,
  });
});

test("事件重放在当前轮次边界结束，避免等待下一条用户消息", () => {
  assert.equal(isWishCreatorRecoveryBoundary({ type: "turn.completed", data: {} } as unknown as HandleMessageStreamEvent), false);
  assert.equal(isWishCreatorRecoveryBoundary({ type: "session.waiting", data: {} } as unknown as HandleMessageStreamEvent), true);
  assert.equal(isWishCreatorRecoveryBoundary({ type: "session.failed", data: {} } as unknown as HandleMessageStreamEvent), true);
});

test("已经保存完整游标的会话不会重复恢复", () => {
  assert.equal(shouldRecoverWishCreatorSession({
    eveSessionId: "wrun_saved",
    events: [event],
    session: { sessionId: "wrun_saved", streamIndex: 1 },
    title: "新的愿望",
  }), false);
});

test("恢复事件追加到已有快照并采用最新游标", () => {
  const initialState = {
    eveSessionId: "wrun_interrupted",
    events: [event],
    session: { streamIndex: 0 },
    title: "新的愿望",
  };
  const recoveredEvent = { type: "session.waiting", data: {} } as unknown as HandleMessageStreamEvent;

  const recovered = mergeWishCreatorRecoveredState(
    initialState,
    [recoveredEvent],
    { sessionId: "wrun_interrupted", streamIndex: 2 },
  );

  assert.deepEqual(recovered.events, [event, recoveredEvent]);
  assert.deepEqual(recovered.session, {
    sessionId: "wrun_interrupted",
    streamIndex: 2,
  });
});
