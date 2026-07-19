import { notFound, redirect } from "next/navigation";
import { WishIntakeSession } from "@/components/wish-creator/wish/WishIntakeSession";
import { requireUser } from "@/lib/auth/session";
import { ensureWishConversation, getWishByConversation } from "@/lib/wish-intake/service";

export default async function WishIntakeSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const submittedWish = await getWishByConversation(user.id, id);

  if (submittedWish) {
    redirect(submittedWish.visibleToUser ? `/wish-creator/wishes/${submittedWish.id}` : "/wish-creator/wishes");
  }

  try {
    await ensureWishConversation(user.id, id);
  } catch (error) {
    console.error("[wish-intake] failed to prepare conversation", error);
    notFound();
  }

  return <WishIntakeSession conversationId={id} />;
}
