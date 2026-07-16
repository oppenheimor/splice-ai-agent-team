import { notFound } from "next/navigation";
import { WishCreatorSessionShell } from "@/components/wish-creator/WishCreatorSessionShell";
import { requireUser } from "@/lib/auth/session";
import { ensureWishCreatorConversation } from "@/lib/wish-creator/persistence";
import type { WishCreatorInitialState } from "@/types/wish-creator";

export default async function WishCreatorSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  let initialState: WishCreatorInitialState;
  try {
    initialState = await ensureWishCreatorConversation({ conversationId: id, userId: user.id });
  } catch {
    notFound();
  }

  return <WishCreatorSessionShell conversationId={id} initialState={initialState} />;
}
