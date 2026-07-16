import type { WishCreatorSnapshot } from "../../types/wish-creator";

export async function saveWishCreatorSnapshot(
  conversationId: string,
  snapshot: WishCreatorSnapshot,
): Promise<void> {
  const response = await fetch(
    `/agent-team/api/wish-creator/sessions/${encodeURIComponent(conversationId)}/snapshot`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    },
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error ?? "会话保存失败。");
  }
}
