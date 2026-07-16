import { WISH_CREATOR_PENDING_PROMPT_PREFIX } from "@/constants/wish-creator";

export function setPendingWishCreatorPrompt(conversationId: string, prompt: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${WISH_CREATOR_PENDING_PROMPT_PREFIX}${conversationId}`, prompt);
}

export function getPendingWishCreatorPrompt(conversationId: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const key = `${WISH_CREATOR_PENDING_PROMPT_PREFIX}${conversationId}`;
  return window.sessionStorage.getItem(key) ?? undefined;
}

export function clearPendingWishCreatorPrompt(conversationId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(`${WISH_CREATOR_PENDING_PROMPT_PREFIX}${conversationId}`);
}
