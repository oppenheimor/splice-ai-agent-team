import { Client } from "eve/client";
import { WISH_CREATOR_CONVERSATION_HEADER } from "@/constants/wish-creator";
import {
  createWishCreatorRecoverySession,
  isWishCreatorRecoveryBoundary,
  mergeWishCreatorRecoveredState,
  shouldRecoverWishCreatorSession,
} from "@/lib/wish-creator/session-recovery";
import type { WishCreatorInitialState } from "@/types/wish-creator";
import { APP_BASE_PATH } from "@/utils/routing";

export async function recoverWishCreatorInitialState(
  conversationId: string,
  initialState: WishCreatorInitialState,
  signal: AbortSignal,
): Promise<WishCreatorInitialState> {
  if (!shouldRecoverWishCreatorSession(initialState)) return initialState;

  const client = new Client({
    host: APP_BASE_PATH,
    headers: { [WISH_CREATOR_CONVERSATION_HEADER]: conversationId },
    maxReconnectAttempts: 6,
    preserveCompletedSessions: true,
  });
  const session = client.session(createWishCreatorRecoverySession(initialState));
  const recoveredEvents = [];

  for await (const event of session.stream({ signal })) {
    recoveredEvents.push(event);
    // `ClientSession.stream()` 会持续等待未来事件；恢复只重放到当前轮次边界。
    if (isWishCreatorRecoveryBoundary(event)) break;
  }

  return mergeWishCreatorRecoveredState(initialState, recoveredEvents, session.state);
}
