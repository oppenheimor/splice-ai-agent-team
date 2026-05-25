"use client";

const PENDING_PROMPT_PREFIX = "agent-team.pending-prompt.v1.";

export function setPendingPrompt(conversationId: string, prompt: string): void {
  window.sessionStorage.setItem(`${PENDING_PROMPT_PREFIX}${conversationId}`, prompt);
}

export function popPendingPrompt(conversationId: string): string {
  const key = `${PENDING_PROMPT_PREFIX}${conversationId}`;
  const prompt = window.sessionStorage.getItem(key) || "";
  window.sessionStorage.removeItem(key);
  return prompt;
}
