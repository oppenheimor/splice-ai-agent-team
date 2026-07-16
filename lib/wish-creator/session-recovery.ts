import type { HandleMessageStreamEvent, SessionState } from "eve/client";
import type { WishCreatorInitialState } from "../../types/wish-creator";

export function shouldRecoverWishCreatorSession(
  initialState: WishCreatorInitialState,
): initialState is WishCreatorInitialState & { readonly eveSessionId: string } {
  return Boolean(initialState.eveSessionId && !initialState.session.sessionId);
}

export function createWishCreatorRecoverySession(
  initialState: WishCreatorInitialState & { readonly eveSessionId: string },
): SessionState {
  return {
    ...initialState.session,
    sessionId: initialState.eveSessionId,
    streamIndex: initialState.events.length,
  };
}

export function mergeWishCreatorRecoveredState(
  initialState: WishCreatorInitialState,
  recoveredEvents: readonly HandleMessageStreamEvent[],
  session: SessionState,
): WishCreatorInitialState {
  return {
    ...initialState,
    events: [...initialState.events, ...recoveredEvents],
    session,
  };
}

export function isWishCreatorRecoveryBoundary(event: HandleMessageStreamEvent): boolean {
  return event.type === "session.waiting"
    || event.type === "session.completed"
    || event.type === "session.failed";
}
