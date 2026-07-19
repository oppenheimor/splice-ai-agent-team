import type { WishListItem } from "@/types/wish-intake";

export type WishListItemSource = {
  conversationId: string;
  title: string | null;
  firstUserText: string | null;
  lastMessageAt: Date;
  wishCreatorWish: {
    id: string;
    title: string;
    goal: string;
    submittedAt: Date;
    userRemovedAt: Date | null;
  } | null;
};

export function toWishListItem(source: WishListItemSource): WishListItem | null {
  const firstUserText = source.firstUserText?.trim();
  if (!firstUserText || source.wishCreatorWish?.userRemovedAt) return null;

  if (source.wishCreatorWish) {
    return {
      status: "submitted",
      wishId: source.wishCreatorWish.id,
      conversationId: source.conversationId,
      title: source.wishCreatorWish.title,
      preview: source.wishCreatorWish.goal,
      activityAt: source.wishCreatorWish.submittedAt.toISOString(),
    };
  }

  return {
    status: "draft",
    conversationId: source.conversationId,
    title: source.title?.trim() || firstUserText.slice(0, 36),
    preview: firstUserText,
    activityAt: source.lastMessageAt.toISOString(),
  };
}
